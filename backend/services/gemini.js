/**
 * @file gemini.js
 * @description Google Gemini AI integration service for BhoomiChain.
 * Drop-in replacement for claude.js — identical exported function signatures.
 * Uses gemini-2.0-flash (free tier) via the @google/generative-ai SDK.
 */

'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Models tried in order. If primary hits a quota/rate limit (429/503),
 * the service automatically falls back to the next in the list.
 * All confirmed available for this key via ListModels.
 */
const MODEL_PRIORITY = [
  'gemini-2.5-flash',       // Primary — latest, generous free quota
  'gemini-2.0-flash-lite',  // Fallback — lightest, separate quota bucket
  'gemini-2.0-flash-001',   // Last resort — pinned stable version
];

/**
 * Get an initialised GenerativeModel instance.
 * @param {string} modelName
 * @param {string} systemInstruction
 * @returns {import('@google/generative-ai').GenerativeModel}
 */
function getModel(modelName, systemInstruction) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables.');

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: { maxOutputTokens: 1024 },
  });
}

/**
 * Call Gemini with automatic model fallback on quota errors.
 * Tries each model in MODEL_PRIORITY until one succeeds.
 * @param {string} systemInstruction
 * @param {string} userMessage
 * @returns {Promise<string>} Plain text response from Gemini.
 */
async function callGemini(systemInstruction, userMessage) {
  let lastError;
  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = getModel(modelName, systemInstruction);
      const result = await model.generateContent(userMessage);
      const text = result.response.text();
      if (!text) throw new Error('Empty response from Gemini API.');
      console.log(`[Gemini] ✅ Response from ${modelName}`);
      return text;
    } catch (err) {
      const is429 = err.message.includes('429') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('503') || err.message.includes('Service Unavailable');
      const is404 = err.message.includes('404') || err.message.includes('not found');
      if (is429 || is404) {
        console.warn(`[Gemini] ⚠️  ${modelName} unavailable (${is429 ? '429 quota' : '404 not found'}), trying next model...`);
        lastError = err;
        continue; // try next model
      }
      throw err; // non-quota error — propagate immediately
    }
  }
  throw lastError || new Error('All Gemini models exhausted.');
}

// ─── Fraud Analysis ─────────────────────────────────────────────────────────────

const FRAUD_SYSTEM_INSTRUCTION = `You are BhoomiChain's AI fraud detection engine for India's blockchain land registry. \
Analyse property transactions for fraud, benami ownership, PMLA violations, and circle rate evasion. \
Always respond in valid JSON only with absolutely no extra text, no markdown fences, no explanation — just the raw JSON object: \
{ \
  "riskScore": <number 0-100>, \
  "redFlags": ["<specific red flag>", ...], \
  "recommendation": "<APPROVE|FLAG|REJECT>", \
  "lawSections": [{"section": "<law name>", "description": "<why it applies>"}], \
  "summary": "<one paragraph summary>" \
}`;

/**
 * Analyse a property transaction for fraud signals using Gemini AI.
 * Returns a parsed JSON risk assessment object.
 *
 * @param {string|object} propertyDetails - Raw property description or structured object.
 * @returns {Promise<{
 *   riskScore: number,
 *   redFlags: string[],
 *   recommendation: 'APPROVE' | 'FLAG' | 'REJECT',
 *   lawSections: Array<{ section: string, description: string }>,
 *   summary: string
 * }>}
 */
async function analyzeForFraud(propertyDetails) {
  const userMessage =
    typeof propertyDetails === 'string'
      ? propertyDetails
      : JSON.stringify(propertyDetails, null, 2);

  const raw = await callGemini(FRAUD_SYSTEM_INSTRUCTION, userMessage);

  // Strip any accidental markdown fences Gemini may add
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('[Gemini] Raw unparseable text:', raw);
    throw new Error('Could not extract JSON from Gemini fraud analysis response.');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('[Gemini] Invalid JSON:', jsonMatch[0]);
    throw new Error(`Failed to parse Gemini fraud analysis JSON: ${err.message}`);
  }
}

// ─── Due Diligence ──────────────────────────────────────────────────────────────

const DUE_DILIGENCE_SYSTEM_INSTRUCTION = `You are a senior property due diligence expert for Indian real estate investment trusts (REITs). \
Given blockchain-verified property data and transaction history, produce a structured due diligence report. \
Respond using this exact pipe-delimited format — no extra text before or after, no markdown: \
TITLE_CLARITY: <text> | ENCUMBRANCE_STATUS: <text> | DISPUTE_HISTORY: <text> | OWNERSHIP_CHAIN: <text> | INVESTMENT_RISK: <Low|Medium|High> | RECOMMENDATION: <text> | RISK_FACTORS: ["<factor1>", "<factor2>"]`;

/**
 * Parse the pipe-delimited due diligence response into a structured object.
 * @param {string} raw - Raw string response from Gemini.
 * @returns {object}
 */
function parseDueDiligenceResponse(raw) {
  const fields = [
    'TITLE_CLARITY',
    'ENCUMBRANCE_STATUS',
    'DISPUTE_HISTORY',
    'OWNERSHIP_CHAIN',
    'INVESTMENT_RISK',
    'RECOMMENDATION',
    'RISK_FACTORS',
  ];

  const result = {};

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const nextField = fields[i + 1];

    const pattern = nextField
      ? new RegExp(`${field}:\\s*([\\s\\S]*?)(?=\\s*\\|\\s*${nextField}:|$)`)
      : new RegExp(`${field}:\\s*([\\s\\S]*)$`);

    const match = raw.match(pattern);
    let value = match ? match[1].trim().replace(/\|$/, '').trim() : '—';

    if (field === 'RISK_FACTORS') {
      try {
        const arrMatch = value.match(/\[[\s\S]*\]/);
        result[field] = arrMatch ? JSON.parse(arrMatch[0]) : [value];
      } catch {
        result[field] = value ? [value] : [];
      }
    } else {
      result[field] = value;
    }
  }

  return result;
}

/**
 * Generate a full REIT-grade due diligence report using Gemini AI.
 *
 * @param {object} propertyData - The property's latest block data.
 * @param {object[]} history - Full transaction history array.
 * @returns {Promise<{
 *   TITLE_CLARITY: string,
 *   ENCUMBRANCE_STATUS: string,
 *   DISPUTE_HISTORY: string,
 *   OWNERSHIP_CHAIN: string,
 *   INVESTMENT_RISK: 'Low' | 'Medium' | 'High',
 *   RECOMMENDATION: string,
 *   RISK_FACTORS: string[],
 *   rawResponse: string
 * }>}
 */
async function generateDueDiligence(propertyData, history) {
  const userMessage = JSON.stringify(
    {
      property: propertyData,
      transactionHistory: history.map((b) => ({
        blockNumber: b.blockNumber,
        event: b.data.eventType,
        owner: b.data.ownerName || b.data.newOwner || 'System',
        value: b.data.declaredValue,
        date: b.timestamp,
        notes: b.data.notes || '',
        status: b.data.status,
      })),
    },
    null,
    2
  );

  const raw = await callGemini(DUE_DILIGENCE_SYSTEM_INSTRUCTION, userMessage);
  const parsed = parseDueDiligenceResponse(raw);
  return { ...parsed, rawResponse: raw };
}

module.exports = { analyzeForFraud, generateDueDiligence };

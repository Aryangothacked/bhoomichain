/**
 * @file claude.js
 * @description Anthropic Claude AI integration service for BhoomiChain.
 * Provides AI-powered fraud analysis and REIT due diligence report generation.
 */

'use strict';

const axios = require('axios');

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 1024;

/**
 * Build Axios config for Anthropic API calls.
 * @returns {object} Axios request config headers.
 */
function buildHeaders() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set in environment variables.');
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  };
}

/**
 * Make a call to the Claude API with the given system and user messages.
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @returns {Promise<string>} Raw text response from Claude.
 */
async function callClaude(systemPrompt, userMessage) {
  const response = await axios.post(
    CLAUDE_API_URL,
    {
      model: CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    },
    { headers: buildHeaders(), timeout: 30000 }
  );

  const content = response.data?.content?.[0]?.text;
  if (!content) throw new Error('Empty response from Claude API.');
  return content;
}

// ─── Fraud Analysis ─────────────────────────────────────────────────────────────

const FRAUD_SYSTEM_PROMPT = `You are BhoomiChain's AI fraud detection engine for India's blockchain land registry. \
Analyse property transactions for fraud, benami ownership, PMLA violations, and circle rate evasion. \
Always respond in valid JSON only with no extra text: \
{ \
  "riskScore": number 0-100, \
  "redFlags": ["array of specific red flag strings"], \
  "recommendation": "APPROVE" or "FLAG" or "REJECT", \
  "lawSections": [{"section": "law section name", "description": "brief explanation of why it applies"}], \
  "summary": "one paragraph summary of findings" \
}`;

/**
 * Analyse a property transaction for fraud signals using Claude AI.
 * Returns a parsed JSON risk assessment object.
 *
 * @param {string|object} propertyDetails - Raw property details (string description or object).
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

  const raw = await callClaude(FRAUD_SYSTEM_PROMPT, userMessage);

  // Extract JSON from response — Claude may sometimes add markdown fences
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not extract JSON from Claude fraud analysis response.');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error(`Failed to parse Claude fraud analysis JSON: ${err.message}`);
  }
}

// ─── Due Diligence ──────────────────────────────────────────────────────────────

const DUE_DILIGENCE_SYSTEM_PROMPT = `You are a senior property due diligence expert for Indian real estate investment trusts (REITs). \
Given blockchain-verified property data and transaction history, produce a structured due diligence report. \
Respond using this exact pipe-delimited format with no extra text before or after: \
TITLE_CLARITY: <text> | ENCUMBRANCE_STATUS: <text> | DISPUTE_HISTORY: <text> | OWNERSHIP_CHAIN: <text> | INVESTMENT_RISK: <Low|Medium|High> | RECOMMENDATION: <text> | RISK_FACTORS: ["factor1", "factor2"]`;

/**
 * Parse the pipe-delimited due diligence response from Claude into a structured object.
 * @param {string} raw - Raw string response from Claude.
 * @returns {object} Parsed due diligence report fields.
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

    // Attempt to parse RISK_FACTORS as JSON array
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
 * Generate a full REIT-grade due diligence report for a property using Claude AI.
 *
 * @param {object} propertyData - The property's latest block data.
 * @param {object[]} history - Full transaction history array for the property.
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

  const raw = await callClaude(DUE_DILIGENCE_SYSTEM_PROMPT, userMessage);
  const parsed = parseDueDiligenceResponse(raw);

  return { ...parsed, rawResponse: raw };
}

module.exports = { analyzeForFraud, generateDueDiligence };

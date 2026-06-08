/**
 * @file groq.js
 * @description Groq integration service for BhoomiChain.
 * Drop-in replacement for gemini.js/claude.js — identical exported function signatures.
 * Uses Groq's high-speed inference engine.
 */

'use strict';

const Groq = require('groq-sdk');

const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Using Llama 3 for robust JSON reasoning

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set in environment variables.');
  return new Groq({ apiKey });
}

async function callGroq(systemInstruction, userMessage) {
  const client = getClient();
  const completion = await client.chat.completions.create({
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userMessage }
    ],
    model: GROQ_MODEL,
    temperature: 0.1,
    response_format: { type: 'text' }, // or json_object depending on prompt
  });
  
  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq API.');
  return text;
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

async function analyzeForFraud(propertyDetails) {
  const userMessage =
    typeof propertyDetails === 'string'
      ? propertyDetails
      : JSON.stringify(propertyDetails, null, 2);

  const raw = await callGroq(FRAUD_SYSTEM_INSTRUCTION, userMessage);

  // Strip any accidental markdown fences the model may add
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('[Groq] Raw unparseable text:', raw);
    throw new Error('Could not extract JSON from Groq fraud analysis response.');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('[Groq] Invalid JSON:', jsonMatch[0]);
    throw new Error(`Failed to parse Groq fraud analysis JSON: ${err.message}`);
  }
}

// ─── Due Diligence ──────────────────────────────────────────────────────────────

const DUE_DILIGENCE_SYSTEM_INSTRUCTION = `You are a senior property due diligence expert for Indian real estate investment trusts (REITs). \
Given blockchain-verified property data and transaction history, produce a structured due diligence report. \
Respond using this exact pipe-delimited format — no extra text before or after, no markdown: \
TITLE_CLARITY: <text> | ENCUMBRANCE_STATUS: <text> | DISPUTE_HISTORY: <text> | OWNERSHIP_CHAIN: <text> | INVESTMENT_RISK: <Low|Medium|High> | RECOMMENDATION: <text> | RISK_FACTORS: ["<factor1>", "<factor2>"]`;

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

  const raw = await callGroq(DUE_DILIGENCE_SYSTEM_INSTRUCTION, userMessage);
  const parsed = parseDueDiligenceResponse(raw);
  return { ...parsed, rawResponse: raw };
}

module.exports = { analyzeForFraud, generateDueDiligence };

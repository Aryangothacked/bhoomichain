/**
 * @file data/seed.js
 * @description CLI seed script — clears ledger.json and rejects.json,
 * then re-seeds the blockchain with all 8 demo properties and 4 subsequent transactions.
 *
 * Usage: node data/seed.js
 *        npm run seed
 */

'use strict';

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'ledger.json');
const REJECTS_PATH = path.join(__dirname, 'rejects.json');

console.log('\x1b[36m\n🌱 BhoomiChain — Seeding Demo Data\x1b[0m');
console.log('─────────────────────────────────────\n');

// Remove existing files to force fresh seed
if (fs.existsSync(LEDGER_PATH)) {
  fs.unlinkSync(LEDGER_PATH);
  console.log('✅ Cleared existing ledger.json');
}
if (fs.existsSync(REJECTS_PATH)) {
  fs.unlinkSync(REJECTS_PATH);
  console.log('✅ Cleared existing rejects.json');
}

// Require blockchain service — it will auto-seed on getLedgerSync call
const { getLedgerSync, validateChain } = require('../services/blockchain');

const chain = getLedgerSync();
const validation = validateChain(chain);

console.log(`\n✅ Seeded ${chain.length} blocks:`);
chain.forEach((block) => {
  if (block.blockNumber === 0) {
    console.log(`  Block #0: GENESIS`);
  } else {
    const et = block.data?.eventType || '?';
    const pid = block.data?.propertyId || '?';
    const city = block.data?.city || '?';
    console.log(`  Block #${block.blockNumber}: ${et.padEnd(12)} | ${pid} | ${city}`);
  }
});

console.log(`\n🔒 Chain validation: ${validation.valid ? '✅ VALID' : '❌ INVALID — ' + validation.message}`);
console.log('\n\x1b[32m🏛️  Demo data seeded successfully!\x1b[0m\n');

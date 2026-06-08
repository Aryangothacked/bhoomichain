const axios = require('axios')
require('dotenv').config()

function formatCrore(amount) {
  if (!amount) return '0'
  const cr = Number(amount) / 10000000
  return cr >= 1 ? cr.toFixed(2) + ' Cr' : (Number(amount) / 100000).toFixed(2) + ' Lakh'
}

// ─── WhatsApp via CallMeBot (100% free) ───────────────────────────
async function sendWhatsApp(message) {
  try {
    if (!process.env.CALLMEBOT_API_KEY || !process.env.CALLMEBOT_PHONE) {
      console.log('⚠️  CallMeBot not configured — skipping WhatsApp alert')
      return { success: false, reason: 'CALLMEBOT_API_KEY or CALLMEBOT_PHONE not set' }
    }

    const encodedMessage = encodeURIComponent(message)
    const url = `https://api.callmebot.com/whatsapp.php?phone=${process.env.CALLMEBOT_PHONE}&text=${encodedMessage}&apikey=${process.env.CALLMEBOT_API_KEY}`

    await axios.get(url, { timeout: 8000 })
    console.log('✅ WhatsApp alert sent via CallMeBot')
    return { success: true }
  } catch (err) {
    console.error('❌ WhatsApp alert failed:', err.message)
    return { success: false, error: err.message }
  }
}

// ─── Telegram Bot (100% free, unlimited) ─────────────────────────
async function sendTelegram(message) {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      console.log('⚠️  Telegram not configured — skipping Telegram alert')
      return { success: false, reason: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set' }
    }

    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`
    const response = await axios.post(url, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    }, { timeout: 8000 })

    if (response.data.ok) {
      console.log('✅ Telegram alert sent')
      return { success: true }
    } else {
      console.error('❌ Telegram error:', response.data.description)
      return { success: false, error: response.data.description }
    }
  } catch (err) {
    console.error('❌ Telegram alert failed:', err.message)
    return { success: false, error: err.message }
  }
}

// ─── Build alert message by event type ───────────────────────────
function buildMessage(type, data, format = 'plain') {
  const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  
  const messages = {
    REGISTRATION: {
      plain: `🏛️ BhoomiChain Alert\n\nNew Property Registered!\n\nProperty ID: ${data.propertyId}\nOwner: ${data.ownerName}\nCity: ${data.city}\nType: ${data.propertyType || 'N/A'}\nArea: ${Number(data.area || 0).toLocaleString('en-IN')} sqft\nValue: ₹${formatCrore(data.declaredValue)}\nStamp Duty: ₹${formatCrore(data.stampDuty)}\nBlock: #${data.blockNumber || 'N/A'}\n\n🕐 ${time}`,
      html: `🏛️ <b>BhoomiChain — New Registration</b>\n\n<b>Property ID:</b> <code>${data.propertyId}</code>\n<b>Owner:</b> ${data.ownerName}\n<b>City:</b> ${data.city}\n<b>Type:</b> ${data.propertyType || 'N/A'}\n<b>Area:</b> ${Number(data.area || 0).toLocaleString('en-IN')} sqft\n<b>Value:</b> ₹${formatCrore(data.declaredValue)}\n<b>Stamp Duty:</b> ₹${formatCrore(data.stampDuty)}\n<b>Block:</b> #${data.blockNumber || 'N/A'}\n\n🕐 ${time}`
    },
    SALE: {
      plain: `🏛️ BhoomiChain Alert\n\nProperty Sale Recorded!\n\nProperty ID: ${data.propertyId}\nNew Owner: ${data.newOwner || 'N/A'}\nCity: ${data.city}\nSale Value: ₹${formatCrore(data.declaredValue)}\n\n🕐 ${time}`,
      html: `🏠 <b>BhoomiChain — Property Sale</b>\n\n<b>Property ID:</b> <code>${data.propertyId}</code>\n<b>New Owner:</b> ${data.newOwner || 'N/A'}\n<b>City:</b> ${data.city}\n<b>Sale Value:</b> ₹${formatCrore(data.declaredValue)}\n\n🕐 ${time}`
    },
    FRAUD_REJECTED: {
      plain: `🚨 BhoomiChain FRAUD ALERT\n\nFraudulent Registration BLOCKED!\n\nAttempted By: ${data.ownerName}\nCity: ${data.city}\nDeclared Value: ₹${formatCrore(data.declaredValue)}\nReason: ${data.rejectionReason}\n\n⚠️ Transaction rejected and logged.\n🕐 ${time}`,
      html: `🚨 <b>BhoomiChain — FRAUD BLOCKED</b>\n\n<b>Attempted By:</b> ${data.ownerName}\n<b>City:</b> ${data.city}\n<b>Declared Value:</b> ₹${formatCrore(data.declaredValue)}\n<b>Reason:</b> ${data.rejectionReason}\n\n⚠️ Transaction rejected and logged.\n🕐 ${time}`
    },
    COURT_FREEZE: {
      plain: `⚠️ BhoomiChain Alert\n\nProperty Frozen by Court!\n\nProperty ID: ${data.propertyId}\nCity: ${data.city}\nNotes: ${data.notes}\n\n🕐 ${time}`,
      html: `⚠️ <b>BhoomiChain — Court Freeze</b>\n\n<b>Property ID:</b> <code>${data.propertyId}</code>\n<b>City:</b> ${data.city}\n<b>Notes:</b> ${data.notes}\n\n🕐 ${time}`
    },
    MUTATION: {
      plain: `🏛️ BhoomiChain Alert\n\nProperty Mutation Recorded!\n\nProperty ID: ${data.propertyId}\nCity: ${data.city}\nNotes: ${data.notes}\n\n🕐 ${time}`,
      html: `📝 <b>BhoomiChain — Mutation</b>\n\n<b>Property ID:</b> <code>${data.propertyId}</code>\n<b>City:</b> ${data.city}\n<b>Notes:</b> ${data.notes}\n\n🕐 ${time}`
    },
    LIEN: {
      plain: `🏛️ BhoomiChain Alert\n\nLien Registered on Property!\n\nProperty ID: ${data.propertyId}\nCity: ${data.city}\nNotes: ${data.notes}\n\n🕐 ${time}`,
      html: `🔒 <b>BhoomiChain — Lien Registered</b>\n\n<b>Property ID:</b> <code>${data.propertyId}</code>\n<b>City:</b> ${data.city}\n<b>Notes:</b> ${data.notes}\n\n🕐 ${time}`
    }
  }

  return messages[type] || { plain: `BhoomiChain Alert: ${type} event recorded.`, html: `BhoomiChain Alert: ${type} event recorded.` }
}

// ─── Main function — send both alerts ────────────────────────────
async function sendPropertyAlert(type, data) {
  const msg = buildMessage(type, data)
  
  const [waResult, tgResult] = await Promise.allSettled([
    sendWhatsApp(msg.plain),
    sendTelegram(msg.html)
  ])

  const result = {
    whatsapp: waResult.status === 'fulfilled' ? waResult.value : { success: false, error: waResult.reason },
    telegram: tgResult.status === 'fulfilled' ? tgResult.value : { success: false, error: tgResult.reason }
  }

  console.log(`📱 Alert result for ${type}:`, JSON.stringify(result))
  return result
}

module.exports = { sendWhatsApp, sendTelegram, sendPropertyAlert }

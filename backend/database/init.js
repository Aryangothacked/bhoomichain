const pool = require('./db')
const { testConnection } = require('./db')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

async function initDatabase() {
  console.log('🔄 Connecting to PostgreSQL...')
  
  let retries = 5
  while (retries > 0) {
    try {
      const client = await pool.connect()
      await client.query('SELECT NOW()')
      client.release()
      console.log('✅ Database connection verified')
      break
    } catch (err) {
      retries--
      console.error(`❌ Connection failed (${retries} retries left):`, err.message)
      if (retries === 0) throw new Error('Could not connect to database after 5 attempts')
      console.log('⏳ Retrying in 3 seconds...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('✅ Schema ready')

  const result = await pool.query('SELECT COUNT(*) FROM blocks')
  const count = parseInt(result.rows[0].count)

  if (count === 0) {
    console.log('🌱 Seeding demo data...')
    await seedDemoData()
    console.log('✅ Seeded successfully')
  } else {
    console.log(`📊 ${count} blocks found in database`)
  }
}

async function seedDemoData() {
  const properties = [
    { propertyId: 'BHC-MUM-2024-00001', ownerName: 'Rajesh Kumar Sharma', aadhaarLast4: '4521', pan: 'ABCRS1234K', surveyNo: '45/B', khasraNo: 'K-101', area: 1200, circleRate: 18000, declaredValue: 21600000, gpsLat: 19.1136, gpsLng: 72.8697, city: 'Mumbai', propertyType: 'residential', status: 'CLEAR', notes: 'Andheri West property' },
    { propertyId: 'BHC-DEL-2024-00002', ownerName: 'Priya Mehta', aadhaarLast4: '7832', pan: 'BCDPM5678L', surveyNo: 'S-112', khasraNo: 'K-202', area: 2400, circleRate: 12000, declaredValue: 28800000, gpsLat: 28.5921, gpsLng: 77.0460, city: 'Delhi', propertyType: 'residential', status: 'UNDER_LIEN', notes: 'Sector 21 Dwarka' },
    { propertyId: 'BHC-BLR-2024-00003', ownerName: 'Tech Ventures Pvt Ltd', aadhaarLast4: '0000', pan: 'CDETV9012M', surveyNo: 'S-88', khasraNo: 'K-303', area: 5000, circleRate: 9500, declaredValue: 47500000, gpsLat: 12.9698, gpsLng: 77.7500, city: 'Bengaluru', propertyType: 'commercial', status: 'CLEAR', notes: 'Whitefield commercial' },
    { propertyId: 'BHC-HYD-2024-00004', ownerName: 'Mohammed Salim Khan', aadhaarLast4: '3341', pan: 'DEFMK3456N', surveyNo: 'P-7B', khasraNo: 'K-404', area: 1800, circleRate: 7200, declaredValue: 12960000, gpsLat: 17.4400, gpsLng: 78.3489, city: 'Hyderabad', propertyType: 'residential', status: 'DISPUTED', notes: 'Gachibowli plot' },
    { propertyId: 'BHC-AMD-2024-00005', ownerName: 'Harshaben Patel', aadhaarLast4: '6621', pan: 'EFGHP7890O', surveyNo: 'S-203', khasraNo: 'K-505', area: 3000, circleRate: 4500, declaredValue: 13500000, gpsLat: 23.0225, gpsLng: 72.5714, city: 'Ahmedabad', propertyType: 'residential', status: 'CLEAR', notes: 'Bopal survey' },
    { propertyId: 'BHC-PUN-2024-00006', ownerName: 'Vikram Singh Rathore', aadhaarLast4: '9912', pan: 'GHIVR2345P', surveyNo: 'K-56', khasraNo: 'K-606', area: 2200, circleRate: 8000, declaredValue: 17600000, gpsLat: 18.5590, gpsLng: 73.7868, city: 'Pune', propertyType: 'residential', status: 'CLEAR', notes: 'Baner khasra' },
    { propertyId: 'BHC-CHN-2024-00007', ownerName: 'Lakshmi Narayanan', aadhaarLast4: '4478', pan: 'HIJLN6789Q', surveyNo: 'P-12', khasraNo: 'K-707', area: 1500, circleRate: 6500, declaredValue: 9750000, gpsLat: 12.9001, gpsLng: 80.2249, city: 'Chennai', propertyType: 'residential', status: 'CLEAR', notes: 'OMR plot' },
    { propertyId: 'BHC-KOL-2024-00008', ownerName: 'Debashish Roy', aadhaarLast4: '2234', pan: 'IJKDR1234R', surveyNo: 'S-34A', khasraNo: 'K-808', area: 1100, circleRate: 5000, declaredValue: 5500000, gpsLat: 22.5958, gpsLng: 88.4783, city: 'Kolkata', propertyType: 'residential', status: 'COURT_FREEZE', notes: 'New Town survey' },
  ]

  let prevHash = 'GENESIS_BHOOMICHAIN_INDIA_2024'

  await pool.query(
    `INSERT INTO blocks (block_number, hash, prev_hash, timestamp, event_type)
     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (block_number) DO NOTHING`,
    [0, 'GENESIS_BHOOMICHAIN_INDIA_2024', '0000000000000000', new Date('2024-01-01'), 'GENESIS']
  )

  let blockNum = 1
  for (const prop of properties) {
    const timestamp = new Date()
    const stampDuty = prop.declaredValue * 0.05
    const registrationFee = prop.declaredValue * 0.01
    const hashData = `${blockNum}${prevHash}${timestamp.toISOString()}${JSON.stringify(prop)}`
    const hash = crypto.createHash('sha256').update(hashData).digest('hex')

    await pool.query(
      `INSERT INTO blocks (block_number, hash, prev_hash, timestamp, property_id, owner_name, aadhaar_last4, pan, survey_no, khasra_no, area, circle_rate, declared_value, gps_lat, gps_lng, city, property_type, event_type, status, notes, stamp_duty, registration_fee)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
       ON CONFLICT (block_number) DO NOTHING`,
      [blockNum, hash, prevHash, timestamp, prop.propertyId, prop.ownerName, prop.aadhaarLast4, prop.pan, prop.surveyNo, prop.khasraNo, prop.area, prop.circleRate, prop.declaredValue, prop.gpsLat, prop.gpsLng, prop.city, prop.propertyType, 'REGISTRATION', prop.status, prop.notes, stampDuty, registrationFee]
    )

    prevHash = hash
    blockNum++
  }

  const extraTxns = [
    { propertyId: 'BHC-DEL-2024-00002', eventType: 'LIEN', newOwner: null, notes: 'HDFC Bank lien registered', status: 'UNDER_LIEN' },
    { propertyId: 'BHC-HYD-2024-00004', eventType: 'COURT_FREEZE', newOwner: null, notes: 'Dispute filed in Hyderabad Civil Court', status: 'COURT_FREEZE' },
    { propertyId: 'BHC-MUM-2024-00001', eventType: 'SALE', newOwner: 'Anita Desai', notes: 'Sold for 2.40 Cr', status: 'CLEAR' },
    { propertyId: 'BHC-BLR-2024-00003', eventType: 'MUTATION', newOwner: 'Tech Ventures Pvt Ltd (New Directors)', notes: 'Director change mutation', status: 'CLEAR' },
  ]

  for (const txn of extraTxns) {
    const timestamp = new Date()
    const hashData = `${blockNum}${prevHash}${timestamp.toISOString()}${JSON.stringify(txn)}`
    const hash = crypto.createHash('sha256').update(hashData).digest('hex')

    await pool.query(
      `INSERT INTO blocks (block_number, hash, prev_hash, timestamp, property_id, event_type, new_owner, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (block_number) DO NOTHING`,
      [blockNum, hash, prevHash, timestamp, txn.propertyId, txn.eventType, txn.newOwner, txn.notes, txn.status]
    )

    prevHash = hash
    blockNum++
  }
}

async function resetDemoData() {
  await pool.query('DELETE FROM blocks')
  await pool.query('DELETE FROM fraud_rejections')
  await seedDemoData()
}

module.exports = { initDatabase, seedDemoData, resetDemoData }

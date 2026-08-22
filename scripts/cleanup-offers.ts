import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('No MONGODB_URI found')
    return
  }
  await mongoose.connect(uri)
  const db = mongoose.connection.db
  if (!db) {
    console.error('No DB connection')
    return
  }

  const completedTxs = await db.collection('transactions').find({ status: 'COMPLETED' }).toArray()
  console.log(`Found ${completedTxs.length} completed transactions`)

  for (const tx of completedTxs) {
    if (tx.listingId) {
      await db.collection('listings').updateOne({ _id: tx.listingId }, { $set: { status: 'COMPLETED' } })
      await db.collection('offers').updateMany(
        { listingId: tx.listingId, status: 'PENDING' },
        { $set: { status: 'REJECTED' } }
      )
      if (tx.offerId) {
        await db.collection('offers').updateOne({ _id: tx.offerId }, { $set: { status: 'ACCEPTED' } })
      }
    }
  }

  console.log('Database synced cleanly!')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})

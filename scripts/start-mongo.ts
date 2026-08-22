import { MongoMemoryServer } from 'mongodb-memory-server'
import path from 'path'
import fs from 'fs'

async function main() {
  const dbPath = path.resolve(process.cwd(), '.mongo-data')
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true })
  }

  console.log('🚀 Starting local embedded MongoDB server on port 27017...')
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'hostel_marketplace',
      dbPath: dbPath,
      storageEngine: 'wiredTiger',
    },
  })

  const uri = mongod.getUri()
  console.log(`✅ Local MongoDB Server is running!`)
  console.log(`📡 URI: ${uri}`)
  console.log(`💾 Data directory: ${dbPath}`)

  process.on('SIGINT', async () => {
    console.log('Shutting down MongoDB server...')
    await mongod.stop()
    process.exit(0)
  })
}

main().catch(err => {
  console.error('Failed to start MongoDB server:', err)
  process.exit(1)
})

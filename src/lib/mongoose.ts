import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'

const DEFAULT_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_marketplace'

declare global {

  var _mongooseConn: typeof mongoose | null

  var _mongoServerInstance: any | null
}

let cached = global._mongooseConn

export async function connectDB() {
  if (cached && mongoose.connection.readyState === 1) return cached

  try {
    // 1. Try standard connection to local MongoDB
    cached = await mongoose.connect(DEFAULT_URI, {
      serverSelectionTimeoutMS: 2000,
      bufferCommands: false,
      maxPoolSize: 10,
    })
    global._mongooseConn = cached
    return cached
  } catch (err: any) {
    // 2. If no local MongoDB is running, start local embedded instance seamlessly
    if (!global._mongoServerInstance) {
      console.log('🍃 Starting local embedded MongoDB instance...')
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server')
        const dbPath = path.resolve(process.cwd(), '.mongo-data')
        if (!fs.existsSync(dbPath)) {
          fs.mkdirSync(dbPath, { recursive: true })
        }
        const server = await MongoMemoryServer.create({
          binary: {
            version: '6.0.14',
          },
          instance: {
            port: 27017,
            dbName: 'hostel_marketplace',
            dbPath: dbPath,
            storageEngine: 'wiredTiger',
          },
        })
        global._mongoServerInstance = server
        const uri = server.getUri()
        console.log(`✅ Embedded local MongoDB running on: ${uri}`)
        cached = await mongoose.connect(uri, {
          bufferCommands: false,
          maxPoolSize: 10,
        })
        global._mongooseConn = cached
        return cached
      } catch (embErr) {
        console.error('Failed to start embedded MongoDB:', embErr)
        throw err
      }
    } else {
      const uri = global._mongoServerInstance.getUri()
      cached = await mongoose.connect(uri, { bufferCommands: false, maxPoolSize: 10 })
      global._mongooseConn = cached
      return cached
    }
  }
}

export default connectDB

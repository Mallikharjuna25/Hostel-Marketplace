/**
 * Custom Next.js server with Socket.io attached.
 *
 * Architecture decision: Socket.io runs in the same process as Next.js.
 * This enables persistent WebSocket connections for real-time chat and OTP events.
 *
 * NOTE: This approach requires a long-lived server process.
 * Serverless platforms (plain Vercel) are NOT supported.
 * Deploy to: Railway, Render, DigitalOcean App Platform, or any Docker/VM host.
 */

import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer, Socket } from 'socket.io'

import { connectDB } from './src/lib/mongoose'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  try {
    await connectDB()
    console.log('🍃 MongoDB connected successfully on boot')
  } catch (dbErr) {
    console.error('⚠️ MongoDB boot connection error:', dbErr)
  }

  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // ─── Socket.io ────────────────────────────────────────────────────────────
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  /**
   * Namespaces:
   *   tx:{transactionId}  — per-transaction chat, offer events, OTP events
   *   user:{userId}       — personal notification pushes
   */

  // Transaction namespace — real-time chat and transaction events
  io.on('connection', (socket: Socket) => {
    // Join a transaction room
    socket.on('join:transaction', (transactionId: string) => {
      socket.join(`tx:${transactionId}`)
      console.log(`[Socket] ${socket.id} joined tx:${transactionId}`)
    })

    // Join personal notification room
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`)
      console.log(`[Socket] ${socket.id} joined user:${userId}`)
    })

    // New chat message — validated and stored via REST API, then broadcast here
    socket.on('message:send', (data: {
      transactionId: string
      messageId: string
      senderId: string
      senderName: string
      content: string
      type: string
      createdAt: string
    }) => {
      // Broadcast to all others in the transaction room
      socket.to(`tx:${data.transactionId}`).emit('message:new', data)
    })

    // Offer event (accept/reject/counter) — broadcast to transaction room
    socket.on('offer:update', (data: {
      transactionId: string
      offerId: string
      status: string
      amount?: number
    }) => {
      socket.to(`tx:${data.transactionId}`).emit('offer:updated', data)
    })

    // OTP generated — notify the transaction room
    socket.on('otp:generated', (data: { transactionId: string }) => {
      socket.to(`tx:${data.transactionId}`).emit('otp:ready', {
        transactionId: data.transactionId,
        message: 'The seller has generated an OTP. Please inspect the item before entering the code.',
      })
    })

    // Transaction status changed
    socket.on('transaction:status', (data: {
      transactionId: string
      status: string
      updatedAt: string
    }) => {
      io.to(`tx:${data.transactionId}`).emit('transaction:updated', data)
    })

    // Typing indicator
    socket.on('typing:start', (data: { transactionId: string; userId: string; name: string }) => {
      socket.to(`tx:${data.transactionId}`).emit('typing:active', data)
    })
    socket.on('typing:stop', (data: { transactionId: string; userId: string }) => {
      socket.to(`tx:${data.transactionId}`).emit('typing:inactive', data)
    })

    socket.on('disconnect', () => {
      console.log(`[Socket] disconnected: ${socket.id}`)
    })
  })

  // Expose io globally so API routes can emit events
  ;(global as unknown as { io: SocketIOServer }).io = io

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`\n🏠 Hostel Marketplace running at http://${hostname}:${port}`)
      console.log(`   Environment: ${dev ? 'development' : 'production'}`)
      console.log(`   Socket.io: enabled (ws://${hostname}:${port})`)
      console.log(`   AI provider: ${process.env.AI_PROVIDER || 'mock'}`)
      console.log(`   Email provider: ${process.env.EMAIL_PROVIDER || 'mock'}\n`)
    })
})

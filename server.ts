import 'dotenv/config'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import next from 'next'
import { createBotClient } from './bot/client'

const PORT = parseInt(process.env.PORT || '3000', 10)
const IS_DEV = process.argv.includes('--dev')

async function start() {
  const nextApp = next({ dev: IS_DEV })
  const handle = nextApp.getRequestHandler()

  await nextApp.prepare()

  const server = http.createServer((req, res) => {
    handle(req, res)
  })

  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_SOCKET_URL || '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`)
    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`)
    })
  })

  if (process.env.DISCORD_TOKEN && process.env.GUILD_ID) {
    const botClient = createBotClient(io)
    try {
      await botClient.login(process.env.DISCORD_TOKEN)
      console.log('[Discord Bot] Login successful')
    } catch (error) {
      console.error('[Discord Bot] Login failed:', error)
    }
  } else {
    console.log('[Discord Bot] Skipping login — DISCORD_TOKEN or GUILD_ID not set')
  }

  server.listen(PORT, () => {
    console.log(`> Server running on http://localhost:${PORT}`)
    console.log(`> Environment: ${IS_DEV ? 'development' : 'production'}`)
    console.log(`> Socket.io available at ws://localhost:${PORT}`)
  })
}

start().catch((error) => {
  console.error('[Server] Fatal error:', error)
  process.exit(1)
})

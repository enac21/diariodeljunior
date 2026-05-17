import { Message } from 'discord.js'
import { Server as SocketIOServer } from 'socket.io'
import { BotConfig } from '../config'

export interface ChatMessagePayload {
  userId: string
  username: string
  channelName: string
  content: string
}

export function setupMessageCreate(
  config: BotConfig,
  io: SocketIOServer,
): (message: Message) => void {
  return (message: Message) => {
    if (message.author.bot) return

    if (config.allowedChannelIds.length > 0 && !config.allowedChannelIds.includes(message.channelId)) {
      return
    }

    const channelName = message.channel.isThread()
      ? (message.channel as any).name || message.channelId
      : (message.channel as any).name || message.channelId

    const payload: ChatMessagePayload = {
      userId: message.author.id,
      username: message.author.username,
      channelName: channelName || 'unknown',
      content: message.content,
    }

    io.emit('chat-message', payload)
  }
}

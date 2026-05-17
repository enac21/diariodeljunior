import { Client, GatewayIntentBits } from 'discord.js'
import { Server as SocketIOServer } from 'socket.io'
import { BotConfig, loadConfig } from './config'
import { setupGuildMemberAdd } from './events/guild-member-add'
import { setupMessageCreate } from './events/message-create'

export function createBotClient(io: SocketIOServer, config?: BotConfig): Client {
  const resolvedConfig = config || loadConfig()

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  })

  const onGuildMemberAdd = setupGuildMemberAdd(resolvedConfig)
  const onMessageCreate = setupMessageCreate(resolvedConfig, io)

  client.on('guildMemberAdd', onGuildMemberAdd)
  client.on('messageCreate', onMessageCreate)

  client.once('ready', () => {
    console.log(`[Discord Bot] Connected as ${client.user?.tag}`)
  })

  client.on('error', (error) => {
    console.error('[Discord Bot] Error:', error)
  })

  return client
}

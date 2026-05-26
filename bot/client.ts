import { Client, GatewayIntentBits, REST, Routes } from 'discord.js'
import { Server as SocketIOServer } from 'socket.io'
import { BotConfig, loadConfig } from './config'
import { setupGuildMemberAdd } from './events/guild-member-add'
import { setupMessageCreate } from './events/message-create'
import { setupInteractionCreate } from './events/interaction-create'
import { initScheduler, recoverScheduledMessages } from './services/scheduler'
import { data as scheduleCommand } from './commands/schedule'
import { data as scheduleInfoCommand } from './commands/schedule-info'

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

  setupInteractionCreate(client, resolvedConfig)

  client.once('clientReady', async () => {
    console.log(`[Discord Bot] Connected as ${client.user?.tag}`)

    try {
      const rest = new REST({ version: '10' }).setToken(resolvedConfig.discordToken)
      await rest.put(
        Routes.applicationGuildCommands(client.user!.id, resolvedConfig.guildId),
        { body: [scheduleCommand.toJSON(), scheduleInfoCommand.toJSON()] },
      )
      console.log('[Discord Bot] Slash commands deployed')
    } catch (error) {
      console.error('[Discord Bot] Failed to deploy commands:', error)
    }

    initScheduler(client, resolvedConfig.scheduleBucket)
    recoverScheduledMessages()
  })

  client.on('error', (error) => {
    console.error('[Discord Bot] Error:', error)
  })

  return client
}

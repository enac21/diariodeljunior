export interface BotConfig {
  discordToken: string
  guildId: string
  webAuthToken: string
  allowedChannelIds: string[]
}

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required env var: ${key}`)
  }
  return value
}

export function loadConfig(): BotConfig {
  const allowedChannelIds = process.env.ALLOWED_CHANNEL_IDS
    ? process.env.ALLOWED_CHANNEL_IDS.split(',').map(id => id.trim()).filter(Boolean)
    : []

  return {
    discordToken: getRequiredEnv('DISCORD_TOKEN'),
    guildId: getRequiredEnv('GUILD_ID'),
    webAuthToken: getRequiredEnv('WEB_AUTH_TOKEN'),
    allowedChannelIds,
  }
}

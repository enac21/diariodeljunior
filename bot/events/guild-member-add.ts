import { GuildMember } from 'discord.js'
import { BotConfig } from '../config'

async function syncMember(member: GuildMember, config: BotConfig): Promise<void> {
  if (member.user.bot) return

  const payload = {
    users: [
      {
        id: member.user.id,
        username: member.user.username,
        joinedAt: member.joinedAt?.toISOString() || new Date().toISOString(),
        discordId: member.user.id,
      },
    ],
  }

  const baseUrl = process.env.WEB_AUTH_TOKEN
    ? 'http://localhost:' + (process.env.PORT || 3000)
    : 'http://localhost:' + (process.env.PORT || 3000)

  try {
    const response = await fetch(`${baseUrl}/api/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.webAuthToken}`,
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      console.log(`[GuildMemberAdd] Synced ${member.user.username} (${member.user.id})`)
    } else {
      const errorText = await response.text()
      console.error(
        `[GuildMemberAdd] Failed to sync ${member.user.username}: ${response.status} ${response.statusText}`,
        errorText,
      )
    }
  } catch (error) {
    console.error(`[GuildMemberAdd] Error syncing ${member.user.username}:`, error)
  }
}

export function setupGuildMemberAdd(config: BotConfig): (member: GuildMember) => Promise<void> {
  return (member: GuildMember) => syncMember(member, config)
}

import { Client } from 'discord.js';
import { BotConfig } from '../config';
import { data as scheduleCommand, execute as executeSchedule } from '../commands/schedule';
import { data as scheduleInfoCommand, execute as executeScheduleInfo } from '../commands/schedule-info';

export function setupInteractionCreate(client: Client, config: BotConfig): void {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
      case scheduleCommand.name:
        await executeSchedule(interaction, config.authorizedUsers);
        break;

      case scheduleInfoCommand.name:
        await executeScheduleInfo(interaction, config.authorizedUsers);
        break;
    }
  });
}

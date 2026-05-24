import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, ChannelType, MessageFlags } from 'discord.js';
import { scheduleMessage } from '../services/scheduler';

const MAX_CONTENT_LENGTH = 2000;

export const data = new SlashCommandBuilder()
  .setName('schedule')
  .setDescription('Programa un archivo .md para enviarlo en una fecha futura')
  .addStringOption((option) =>
    option
      .setName('fecha')
      .setDescription('Fecha ISO con offset horario: YYYY-MM-DDTHH:MM:SS+01:00')
      .setRequired(true),
  )
  .addAttachmentOption((option) =>
    option
      .setName('archivo')
      .setDescription('Archivo .md a programar')
      .setRequired(true),
  )
  .addChannelOption((option) =>
    option
      .setName('canal')
      .setDescription('Canal al que enviar el mensaje (opcional, por defecto el actual)')
      .setRequired(false),
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
  authorizedUsers: string[],
): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.editReply({ content: 'Este comando solo puede usarse en un servidor.' });
      return;
    }

    if (!authorizedUsers.includes(interaction.user.id)) {
      await interaction.editReply({ content: 'No tienes permiso para usar este comando.' });
      return;
    }

    const fechaRaw = interaction.options.get('fecha', true).value as string;
    const attachment = interaction.options.get('archivo', true).attachment!;

    const scheduledAt = new Date(fechaRaw);

    if (isNaN(scheduledAt.getTime())) {
      await interaction.editReply({
        content: 'Fecha inválida. Usa formato ISO con offset: `YYYY-MM-DDTHH:MM:SS+01:00`',
      });
      return;
    }

    if (scheduledAt <= new Date()) {
      await interaction.editReply({ content: 'La fecha debe ser en el futuro.' });
      return;
    }

    if (!attachment.name || !attachment.name.endsWith('.md')) {
      await interaction.editReply({ content: 'El archivo debe tener extensión `.md`.' });
      return;
    }

    let content: string;

    try {
      const response = await fetch(attachment.url);
      content = await response.text();
    } catch {
      await interaction.editReply({ content: 'No se pudo descargar el archivo adjunto.' });
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      await interaction.editReply({
        content: `El archivo excede el límite de ${MAX_CONTENT_LENGTH} caracteres (tiene ${content.length}).`,
      });
      return;
    }

    const channelOption = interaction.options.getChannel('canal');

    if (channelOption && channelOption.type !== ChannelType.GuildText && channelOption.type !== ChannelType.GuildAnnouncement) {
      await interaction.editReply({ content: 'El canal debe ser un canal de texto.' });
      return;
    }

    const targetChannelId = channelOption ? channelOption.id : interaction.channelId;

    const { recordId } = await scheduleMessage(
      targetChannelId,
      scheduledAt,
      content,
    );

    const channelName = channelOption
      ? `#${channelOption.name}`
      : interaction.channel instanceof TextChannel
        ? `#${interaction.channel.name}`
        : interaction.channelId;

    const unix = Math.floor(scheduledAt.getTime() / 1000);

    await interaction.editReply({
      content: `**Mensaje programado exitosamente**\n\n**Canal:** ${channelName}\n**Programado para:** <t:${unix}:R> (<t:${unix}:F>)\n**ID:** \`${recordId}\``,
    });
  } catch (error) {
    console.error('[Schedule] Error:', error);
    await interaction.editReply({
      content: 'Ocurrió un error al programar el mensaje. Intenta de nuevo.',
    });
  }
}


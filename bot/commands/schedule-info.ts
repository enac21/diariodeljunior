import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import prisma from '../../lib/prisma';
import { getFromS3 } from '../../lib/supabase';

const PREVIEW_LENGTH = 150;
const MAX_SHOW = 10;
const DISCORD_CONTENT_LIMIT = 2000;

export const data = new SlashCommandBuilder()
  .setName('schedule-info')
  .setDescription('Muestra información de los mensajes programados');

export async function execute(
  interaction: ChatInputCommandInteraction,
  authorizedUsers: string[],
): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    if (!authorizedUsers.includes(interaction.user.id)) {
      await interaction.editReply({ content: 'No tienes permiso para usar este comando.' });
      return;
    }

    const bucket = process.env.SUPABASE_SCHEDULE_BUCKET;
    if (!bucket) {
      await interaction.editReply({ content: 'SUPABASE_SCHEDULE_BUCKET no configurado.' });
      return;
    }

    const records = await prisma.scheduledMessage.findMany({
      orderBy: { scheduledAt: 'asc' },
    });

    if (records.length === 0) {
      await interaction.editReply({ content: 'No hay mensajes programados.' });
      return;
    }

    const lines: string[] = [];
    const total = records.length;

    for (let i = 0; i < Math.min(records.length, MAX_SHOW); i++) {
      const r = records[i];
      const unix = Math.floor(new Date(r.scheduledAt).getTime() / 1000);

      let preview = '*sin contenido*';
      try {
        const buffer = await getFromS3(bucket, r.s3ObjectKey);
        const text = buffer.toString('utf-8').replace(/\s+/g, ' ').trim().slice(0, PREVIEW_LENGTH);
        preview = text.length >= PREVIEW_LENGTH ? `${text}…` : text;
      } catch {
        preview = '*archivo no disponible*';
      }

      lines.push(
        `**${i + 1}.** ID: \`${r.id.slice(0, 8)}…\`\n   <t:${unix}:R> — <t:${unix}:F>\n   \`\`\`${preview}\`\`\``,
      );
    }

    let content = `**📋 Mensajes programados (${total})**\n\n${lines.join('\n\n')}`;

    if (total > MAX_SHOW) {
      content += `\n\n*... y ${total - MAX_SHOW} más*`;
    }

    if (content.length > DISCORD_CONTENT_LIMIT) {
      content = content.slice(0, DISCORD_CONTENT_LIMIT - 100) + '\n\n*... (truncado)*';
    }

    await interaction.editReply({ content });
  } catch (error) {
    console.error('[Schedule-Info] Error:', error);
    await interaction.editReply({ content: 'Ocurrió un error al obtener la información.' });
  }
}

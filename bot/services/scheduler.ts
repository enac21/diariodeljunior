import { Client, TextChannel } from 'discord.js';
import schedule from 'node-schedule';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../lib/prisma';
import { uploadToS3, getFromS3, deleteFromS3 } from '../../lib/supabase';

interface ScheduledRecord {
  id: string;
  channelId: string;
  scheduledAt: Date;
  s3ObjectKey: string;
}

let botClient: Client | null = null;
let scheduleBucket: string | null = null;

const activeJobs = new Map<string, schedule.Job>();

export function initScheduler(client: Client, bucket: string): void {
  botClient = client;
  scheduleBucket = bucket;
  console.log('[Scheduler] Initialized');
}

export async function scheduleMessage(
  channelId: string,
  scheduledAt: Date,
  content: string,
): Promise<{ s3ObjectKey: string; recordId: string }> {
  if (!scheduleBucket) {
    throw new Error('Scheduler not initialized. Call initScheduler first.');
  }

  const objectKey = `${uuidv4()}.md`;
  const buffer = Buffer.from(content, 'utf-8');

  await uploadToS3(scheduleBucket, objectKey, buffer, 'text/markdown');

  const record = await prisma.scheduledMessage.create({
    data: {
      channelId,
      scheduledAt,
      s3ObjectKey: objectKey,
    },
  });

  const job = schedule.scheduleJob(record.id, scheduledAt, () => {
    executeScheduledMessage(record.id);
  });

  if (job) {
    activeJobs.set(record.id, job);
  }

  return { s3ObjectKey: objectKey, recordId: record.id };
}

export async function executeScheduledMessage(recordId: string): Promise<void> {
  let record: ScheduledRecord | null = null;

  try {
    record = await prisma.scheduledMessage.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      console.warn(`[Scheduler] Record ${recordId} not found, skipping`);
      return;
    }

    if (!botClient || !scheduleBucket) {
      console.error('[Scheduler] Bot client or bucket not initialized');
      return;
    }

    const buffer = await getFromS3(scheduleBucket, record.s3ObjectKey);

    const channel = await botClient.channels.fetch(record.channelId);

    if (!channel || !(channel instanceof TextChannel)) {
      console.error(`[Scheduler] Channel ${record.channelId} not found or not a text channel`);
      return;
    }

    const textContent = buffer.toString('utf-8');
    await channel.send(textContent);

    await deleteFromS3(scheduleBucket, record.s3ObjectKey);

    await prisma.scheduledMessage.delete({
      where: { id: recordId },
    });

    activeJobs.delete(recordId);

    console.log(`[Scheduler] Executed and cleaned up message ${recordId}`);
  } catch (error) {
    console.error(`[Scheduler] Failed to execute message ${recordId}:`, error);
  }
}

export async function recoverScheduledMessages(): Promise<void> {
  if (!botClient || !scheduleBucket) {
    console.warn('[Scheduler] Cannot recover: not initialized');
    return;
  }

  const records = await prisma.scheduledMessage.findMany({
    orderBy: { scheduledAt: 'asc' },
  });

  console.log(`[Scheduler] Found ${records.length} pending messages`);

  const now = new Date();

  for (const record of records) {
    const scheduledDate = new Date(record.scheduledAt);

    if (scheduledDate <= now) {
      console.log(`[Scheduler] Executing past-due message ${record.id}`);
      executeScheduledMessage(record.id);
    } else {
      const job = schedule.scheduleJob(record.id, scheduledDate, () => {
        executeScheduledMessage(record.id);
      });

      if (job) {
        activeJobs.set(record.id, job);
        console.log(`[Scheduler] Recovered message ${record.id} for ${scheduledDate.toISOString()}`);
      }
    }
  }
}




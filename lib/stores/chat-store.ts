import { create } from 'zustand'
import type { ChatMessage } from '@/lib/types/chat'

const BUBBLE_DURATION_MS = 15000
const MAX_STACKED = 5

export interface StackedBubble extends ChatMessage {
  createdAt: number
  fadingOut: boolean
}

interface ChatState {
  stacks: Map<string, StackedBubble[]>
  addMessage: (message: ChatMessage) => void
  removeMessage: (userId: string) => void
}

const timersRef = new Map<string, ReturnType<typeof setTimeout>[]>()

export const useChatStore = create<ChatState>((set, get) => ({
  stacks: new Map(),

  addMessage: (message: ChatMessage) => {
    const { userId } = message

    const existingStack = get().stacks.get(userId) || []

    if (existingStack.length >= MAX_STACKED) {
      existingStack.shift()
    }

    const bubble: StackedBubble = {
      ...message,
      createdAt: Date.now(),
      fadingOut: false,
    }

    existingStack.push(bubble)

    const timer = setTimeout(() => {
      get().removeMessage(userId)
    }, BUBBLE_DURATION_MS)

    const userTimers = timersRef.get(userId) || []
    userTimers.push(timer)
    timersRef.set(userId, userTimers)

    const newStacks = new Map(get().stacks)
    newStacks.set(userId, existingStack)
    set({ stacks: newStacks })
  },

  removeMessage: (userId: string) => {
    if (timersRef.has(userId)) {
      timersRef.get(userId)!.forEach(clearTimeout)
      timersRef.delete(userId)
    }

    const existingStack = get().stacks.get(userId)
    if (!existingStack || existingStack.length === 0) return

    const marked = existingStack.map(b => ({ ...b, fadingOut: true }))
    const fadingStacks = new Map(get().stacks)
    fadingStacks.set(userId, marked)
    set({ stacks: fadingStacks })

    setTimeout(() => {
      const newStacks = new Map(get().stacks)
      newStacks.delete(userId)
      set({ stacks: newStacks })
    }, 600)
  },
}))

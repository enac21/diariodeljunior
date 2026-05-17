import { useEffect, useState } from 'react'
import { useChatStore } from '@/lib/stores/chat-store'
import { ChatBubble } from './ChatBubble'

export interface ScreenPosition {
  x: number
  y: number
}

interface ChatOverlayProps {
  getCharacterScreenPosition: (discordId: string) => ScreenPosition | null
  worldScale: number
  worldOffsetX: number
  worldOffsetY: number
  canvasWidth: number
  canvasHeight: number
}

const BUBBLE_GAP = 22
const BUBBLE_HEAD_OFFSET = 110

export function ChatOverlay({
  getCharacterScreenPosition,
  worldScale,
  worldOffsetX,
  worldOffsetY,
  canvasWidth,
  canvasHeight,
}: ChatOverlayProps) {
  const stacks = useChatStore((state) => state.stacks)
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 50)
    return () => clearInterval(interval)
  }, [])

  const stackEntries = Array.from(stacks.entries())

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        transform: `translate(${worldOffsetX}px, ${worldOffsetY}px) scale(${worldScale})`,
        transformOrigin: '0 0',
      }}
    >
      {stackEntries.map(([userId, bubbles]) => {
        const pos = getCharacterScreenPosition(userId)

        if (!pos) {
          return null
        }

        return (
          <div
            key={userId}
            className="absolute"
            style={{
              left: pos.x,
              top: pos.y - BUBBLE_HEAD_OFFSET,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="flex flex-col items-center" style={{ gap: `${BUBBLE_GAP}px` }}>
              {bubbles.map((bubble, index) => (
                <ChatBubble
                  key={`${userId}-${bubble.createdAt}`}
                  channelName={bubble.channelName}
                  content={bubble.content}
                  fading={bubble.fadingOut}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { useEffect, useState } from 'react'

interface ChatBubbleProps {
  channelName: string
  content: string
  fading?: boolean
}

export function ChatBubble({ channelName, content, fading = false }: ChatBubbleProps) {
  const [mounted, setMounted] = useState(false)
  const [localFading, setLocalFading] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  useEffect(() => {
    if (fading) {
      setLocalFading(true)
    }
  }, [fading])

  const maxChars = 40
  const displayContent =
    content.length > maxChars ? content.slice(0, maxChars) + '...' : content

  const opacity = localFading ? 0 : (mounted ? 1 : 0)
  const translateY = mounted ? 0 : 8

  return (
    <div
      className="pointer-events-none"
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        transition: 'opacity 0.5s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div className="relative max-w-[200px] rounded-lg border border-amber-500/60 bg-[#2a2520]/95 px-3 py-2 text-sm shadow-lg backdrop-blur-sm">
        <div className="whitespace-pre-wrap break-words leading-snug">
          <span className="font-bold text-amber-400">#{channelName}:</span>{' '}
          <span className="text-white">{displayContent}</span>
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-amber-500/60"
          style={{ bottom: '-6px' }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#2a2520]/95"
          style={{ bottom: '-4px' }}
        />
      </div>
    </div>
  )
}

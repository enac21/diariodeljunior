export interface ChatMessage {
  userId: string
  username: string
  channelName: string
  content: string
}

export interface ActiveChatBubble extends ChatMessage {
  expiresAt: number
}

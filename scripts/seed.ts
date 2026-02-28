import 'dotenv/config'
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from '@prisma/adapter-pg'
import { stringToSeed, seleccionarPartes, generateAndSaveAvatar } from '../lib/character-generator'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

const DEFAULT_COUNT = 200
const count = parseInt(process.argv[2]) || DEFAULT_COUNT

const adjectives = [
  'Brave', 'Clever', 'Swift', 'Mighty', 'Gentle', 'Fierce', 'Noble', 'Wild',
  'Calm', 'Bold', 'Quick', 'Wise', 'Keen', 'Sharp', 'Grand', 'Pure',
  'Free', 'True', 'Rich', 'Deep', 'High', 'Vast', 'Fair', 'Fine'
]

const nouns = [
  'Wolf', 'Bear', 'Eagle', 'Lion', 'Tiger', 'Hawk', 'Fox', 'Deer',
  'Raven', 'Owl', 'Cat', 'Dog', 'Horse', 'Dragon', 'Phoenix', 'Falcon',
  'Shark', 'Whale', 'Dolphin', 'Panther', 'Leopard', 'Jaguar', 'Cobra', 'Viper'
]

function generateUsername(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 999) + 1
  return `${adj}${noun}${num}`
}

async function main() {
  console.log(`Seeding ${count} characters...`)
  
  for (let i = 0; i < count; i++) {
    let username = generateUsername()
    let seed = stringToSeed(username)
    
    const existing = await prisma.character.findUnique({ where: { seed } })
    while (existing) {
      username = generateUsername()
      seed = stringToSeed(username)
    }
    
    const selectedParts = seleccionarPartes(seed)
    let imageUrl: string | null = null
    
    try {
      imageUrl = await generateAndSaveAvatar(username, selectedParts)
      console.log(`Generated avatar for ${username}: ${imageUrl}`)
    } catch (e) {
      console.error(`Error generating avatar for ${username}:`, e)
    }
    
    await prisma.character.create({
      data: {
        username,
        seed,
        generatorVersion: 1,
        selectedParts: selectedParts as any,
        imageUrl,
      }
    })
  }
  
  console.log(`Created ${count} characters`)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

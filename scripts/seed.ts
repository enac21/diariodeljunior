import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { stringToSeed, seleccionarPartes } from '../lib/character-generator'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

const CHARACTER_COUNT = 200

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

function generateUsername(index: number): string {
  const adjIndex = index % adjectives.length
  const nounIndex = (index * 7) % nouns.length
  const number = Math.floor(index / adjectives.length) + 1
  return `${adjectives[adjIndex]}${nouns[nounIndex]}${number}`
}

async function main() {
  console.log(`Seeding ${CHARACTER_COUNT} characters...`)
  
  const characters: any[] = []
  
  for (let i = 0; i < CHARACTER_COUNT; i++) {
    const username = generateUsername(i)
    const seed = stringToSeed(username)
    const selectedParts = seleccionarPartes(seed)
    
    characters.push({
      username,
      seed,
      generatorVersion: 1,
      selectedParts,
    })
  }
  
  const result = await prisma.character.createMany({
    data: characters,
    skipDuplicates: true,
  })
  
  console.log(`Created ${result.count} characters`)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

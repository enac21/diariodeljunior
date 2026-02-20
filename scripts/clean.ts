import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Cleaning all characters from database...')
  
  const result = await prisma.character.deleteMany()
  
  console.log(`Deleted ${result.count} characters`)
}

main()
  .catch((e) => {
    console.error('Error cleaning database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

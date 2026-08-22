import { connectDB } from '../src/lib/mongoose'
import { User, Listing, Offer, Transaction, Message, Notification, Review, Report, DonationApplication, KnowledgeAgreement, ProofSubmission } from '../src/lib/models'

async function main() {
  console.log('🧹 Clearing all seed data from MongoDB...')
  await connectDB()

  await Promise.all([
    User.deleteMany({}),
    Listing.deleteMany({}),
    Offer.deleteMany({}),
    Transaction.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
    Review.deleteMany({}),
    Report.deleteMany({}),
    DonationApplication.deleteMany({}),
    KnowledgeAgreement.deleteMany({}),
    ProofSubmission.deleteMany({}),
  ])

  console.log('✨ All seed data wiped! Database is clean and ready for real user registration & posting.')
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

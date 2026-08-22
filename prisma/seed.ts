import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDB } from '../src/lib/mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_marketplace'

// ─── Inline model definitions for seed ───────────────────────────────────────

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' },
  isVerified: { type: Boolean, default: false },
  profile: {
    fullName: String, hostel: String, block: String,
    phone: String, photoUrl: String, college: String,
    department: String, year: Number, rollNumber: String,
  },
  trustScore: { type: Number, default: 50, min: 0, max: 100 },
  trustHistory: [{ event: String, delta: Number, reason: String, createdAt: { type: Date, default: Date.now } }],
  skills: [String],
}, { timestamps: true })

const ListingSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String, description: String,
  mode: { type: String, enum: ['SELL', 'LEND', 'BORROW', 'EXCHANGE', 'DONATE', 'KNOWLEDGE'] },
  condition: String, conditionScore: Number,
  priceInr: Number, depositInr: Number,
  status: { type: String, default: 'PUBLISHED' },
  images: [{ url: String, isPrimary: Boolean }],
  category: String, tags: [String], hostel: String, block: String,
  aiVerified: Boolean, listingQualityScore: Number,
  aiAnalysis: mongoose.Schema.Types.Mixed,
  pricePrediction: mongoose.Schema.Types.Mixed,
}, { timestamps: true })

const TransactionSchema = new mongoose.Schema({
  listingId: mongoose.Schema.Types.ObjectId,
  sellerId: mongoose.Schema.Types.ObjectId,
  buyerId: mongoose.Schema.Types.ObjectId,
  agreedPriceInr: Number,
  status: { type: String, default: 'HANDOVER_PENDING' },
  otpCodeHash: String, otpExpiry: Date, otpUsed: Boolean,
  otpGenerationCount: { type: Number, default: 0 },
  completedAt: Date,
}, { timestamps: true })

const NotifSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: String, title: String, message: String,
  read: { type: Boolean, default: false }, link: String,
}, { timestamps: true })

async function seed() {
  console.log('🌱 Connecting to MongoDB...')
  await connectDB()
  console.log('✅ Connected')

  // Models
  const User = mongoose.models.User || mongoose.model('User', UserSchema)
  const Listing = mongoose.models.Listing || mongoose.model('Listing', ListingSchema)
  const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema)
  const Notification = mongoose.models.Notification || mongoose.model('Notification', NotifSchema)

  // Clear existing
  await Promise.all([
    User.deleteMany({}), Listing.deleteMany({}),
    Transaction.deleteMany({}), Notification.deleteMany({}),
  ])
  console.log('🗑️  Cleared existing data')

  const hash = (pw: string) => bcrypt.hash(pw, 10)

  // ── Users ──────────────────────────────────────────────────
  const users = await User.insertMany([
    {
      email: 'admin@hostelmarket.in', passwordHash: await hash('Admin@123'),
      role: 'ADMIN', isVerified: true,
      profile: { fullName: 'Admin User', hostel: 'Admin Block', block: 'A', college: 'Hostel Marketplace HQ', department: 'Platform', year: 4 },
      trustScore: 100,
      trustHistory: [{ event: 'ADMIN_GRANT', delta: 50, reason: 'Admin account initialized', createdAt: new Date() }],
    },
    {
      email: 'rahul.sharma@iit.ac.in', passwordHash: await hash('Student@123'),
      role: 'STUDENT', isVerified: true,
      profile: { fullName: 'Rahul Sharma', hostel: 'Hostel 10', block: 'B', phone: '+91-9876543210', college: 'IIT Bombay', department: 'Computer Science', year: 3, rollNumber: 'CS21B059' },
      trustScore: 94,
      trustHistory: [
        { event: 'REGISTRATION', delta: 50, reason: 'Account created', createdAt: new Date('2025-06-01') },
        { event: 'SALE_COMPLETED', delta: 2, reason: 'Sold Casio Calculator', createdAt: new Date('2025-07-12') },
        { event: 'REVIEW_RECEIVED', delta: 2, reason: '5-star review from buyer', createdAt: new Date('2025-08-01') },
      ],
      skills: ['C++', 'Data Structures', 'Competitive Programming'],
    },
    {
      email: 'ananya.krishnan@nitc.ac.in', passwordHash: await hash('Student@123'),
      role: 'STUDENT', isVerified: true,
      profile: { fullName: 'Ananya Krishnan', hostel: 'Hostel 5', block: 'A', phone: '+91-9123456789', college: 'NIT Calicut', department: 'Electronics', year: 2, rollNumber: 'EC22B034' },
      trustScore: 85,
      trustHistory: [
        { event: 'REGISTRATION', delta: 50, reason: 'Account created', createdAt: new Date('2025-07-01') },
        { event: 'PURCHASE_COMPLETED', delta: 1, reason: 'Bought Thermodynamics textbook', createdAt: new Date('2025-08-10') },
      ],
      skills: ['VLSI Design', 'Embedded Systems'],
    },
    {
      email: 'priya.menon@nitc.ac.in', passwordHash: await hash('Student@123'),
      role: 'STUDENT', isVerified: true,
      profile: { fullName: 'Priya Menon', hostel: 'Hostel 3', block: 'C', college: 'NIT Calicut', department: 'Civil Engineering', year: 3 },
      trustScore: 97,
      trustHistory: [{ event: 'REGISTRATION', delta: 50, reason: 'Account created', createdAt: new Date('2025-05-15') }],
      skills: ['AutoCAD', 'Structural Analysis'],
    },
    {
      email: 'kiran.verma@bits.ac.in', passwordHash: await hash('Student@123'),
      role: 'STUDENT', isVerified: true,
      profile: { fullName: 'Kiran Verma', hostel: 'Hostel H', block: 'H', college: 'BITS Pilani', department: 'Mechanical Engineering', year: 4 },
      trustScore: 82,
      trustHistory: [{ event: 'REGISTRATION', delta: 50, reason: 'Account created', createdAt: new Date('2025-06-20') }],
      skills: ['SolidWorks', 'FEA Analysis'],
    },
    {
      email: 'arjun.patel@du.ac.in', passwordHash: await hash('Student@123'),
      role: 'STUDENT', isVerified: true,
      profile: { fullName: 'Arjun Patel', hostel: 'Hostel 7', block: 'A', college: 'Delhi University', department: 'Physics', year: 1 },
      trustScore: 78,
      trustHistory: [{ event: 'REGISTRATION', delta: 50, reason: 'Account created', createdAt: new Date('2025-08-01') }],
    },
    {
      email: 'ananya.singh@du.ac.in', passwordHash: await hash('Student@123'),
      role: 'STUDENT', isVerified: true,
      profile: { fullName: 'Ananya Singh', hostel: 'Hostel 2', block: 'D', college: 'Delhi University', department: 'Economics', year: 2 },
      trustScore: 85,
      trustHistory: [{ event: 'REGISTRATION', delta: 50, reason: 'Account created', createdAt: new Date('2025-07-05') }],
    },
    {
      email: 'vikram.nair@vit.ac.in', passwordHash: await hash('Student@123'),
      role: 'STUDENT', isVerified: true,
      profile: { fullName: 'Vikram Nair', hostel: 'Hostel G', block: 'G', college: 'VIT Vellore', department: 'Information Technology', year: 3 },
      trustScore: 88,
      trustHistory: [{ event: 'REGISTRATION', delta: 50, reason: 'Account created', createdAt: new Date('2025-06-10') }],
      skills: ['React.js', 'Node.js', 'MongoDB'],
    },
  ])

  const [admin, rahul, ananya_k, priya, kiran, arjun, ananya_s, vikram] = users
  console.log(`✅ Created ${users.length} users`)

  // ── Listings ────────────────────────────────────────────────
  const listings = await Listing.insertMany([
    {
      sellerId: rahul._id,
      title: 'Casio FX-991ES Plus Scientific Calculator',
      description: 'Used for 2 semesters, perfect working condition. All functions work. Comes with original case. Great for engineering mathematics, calculus, and statistics exams.',
      mode: 'SELL', condition: 'EXCELLENT', conditionScore: 92, priceInr: 450,
      status: 'PUBLISHED', category: 'ELECTRONICS', hostel: 'Hostel 10', block: 'B',
      tags: ['calculator', 'casio', 'scientific', 'engineering', 'maths'],
      aiVerified: true, listingQualityScore: 82,
      aiAnalysis: { detectedProduct: 'Casio FX-991ES Scientific Calculator', confidence: 0.96, conditionLabel: 'EXCELLENT', conditionScore: 92, detectedIssues: [], qualityScore: 82, provider: 'mock', status: 'COMPLETE' },
      pricePrediction: { minPrice: 380, maxPrice: 550, fairPrice: 450, confidence: 0.88, reasoning: 'Casio FX-991ES retails for ₹800 new. 2yr used in excellent condition suggests 45-55% depreciation.' },
    },
    {
      sellerId: arjun._id,
      title: 'Thermodynamics by P.K. Nag (5th Edition)',
      description: 'Donated for juniors! Complete condition, all pages intact. Perfect for B.Tech Mech/Chemical 2nd year Engineering Thermodynamics course. Minor pencil markings only.',
      mode: 'DONATE', condition: 'GOOD', conditionScore: 78,
      status: 'PUBLISHED', category: 'BOOKS', hostel: 'Hostel 7', block: 'A',
      tags: ['thermodynamics', 'pk nag', 'mechanical', 'chemical engineering', 'btech'],
      aiVerified: true, listingQualityScore: 74,
    },
    {
      sellerId: priya._id,
      title: 'Foldable Study Table (Portable Wooden)',
      description: 'Height-adjustable foldable study table. Perfect for studying in bed. Bought from Amazon, used for 1 semester. Very sturdy, no damage. Can be used on floor or bed. Deposit refundable.',
      mode: 'LEND', condition: 'EXCELLENT', conditionScore: 88, priceInr: 100, depositInr: 800,
      status: 'PUBLISHED', category: 'FURNITURE', hostel: 'Hostel 3', block: 'C',
      tags: ['study table', 'foldable', 'portable', 'laptop table', 'bed table'],
      aiVerified: true, listingQualityScore: 79,
    },
    {
      sellerId: kiran._id,
      title: '"Clean Code" by Robert C. Martin',
      description: 'Want: "Design Patterns" by Gang of Four or "The Pragmatic Programmer". My Clean Code is in near-perfect condition, read once. Direct swap preferred.',
      mode: 'EXCHANGE', condition: 'EXCELLENT', conditionScore: 95,
      status: 'PUBLISHED', category: 'BOOKS', hostel: 'Hostel H', block: 'H',
      tags: ['clean code', 'robert martin', 'programming', 'software engineering', 'swap'],
      aiVerified: false, listingQualityScore: 65,
    },
    {
      sellerId: vikram._id,
      title: 'boAt Rockerz 450 Bluetooth Headphones',
      description: 'Selling due to upgrade. Battery backup is 15 hours, Bluetooth 5.0. Comes with original box, charging cable. Color: Black. Sound quality still 10/10.',
      mode: 'SELL', condition: 'GOOD', conditionScore: 80, priceInr: 1200,
      status: 'PUBLISHED', category: 'ELECTRONICS', hostel: 'Hostel G', block: 'G',
      tags: ['headphones', 'boat', 'bluetooth', 'wireless', 'audio'],
      aiVerified: true, listingQualityScore: 77,
      pricePrediction: { minPrice: 950, maxPrice: 1500, fairPrice: 1200, confidence: 0.82, reasoning: 'boAt Rockerz 450 retails at ₹1799 new. Good condition used typically sells at 60-70% of MRP.' },
    },
    {
      sellerId: ananya_k._id,
      title: 'Sony WH-1000XM4 Noise Cancelling Headphones',
      description: 'Barely used, bought 6 months ago. Industry-leading noise cancellation. 30hr battery. Comes with carry case, cables. Going home for a year — need someone responsible.',
      mode: 'LEND', condition: 'EXCELLENT', conditionScore: 97, priceInr: 500, depositInr: 15000,
      status: 'PUBLISHED', category: 'ELECTRONICS', hostel: 'Hostel 5', block: 'A',
      tags: ['sony', 'xm4', 'noise cancelling', 'headphones', 'premium'],
      aiVerified: true, listingQualityScore: 91,
    },
    {
      sellerId: rahul._id,
      title: 'Anchor Roma 6-Way Extension Board (1m wire)',
      description: 'Selling my extra extension board. Works perfectly. 6 sockets, individual switches. Anchor Roma is the best brand for hostel — completely safe, no power surges in 1 year.',
      mode: 'SELL', condition: 'GOOD', conditionScore: 82, priceInr: 350,
      status: 'PUBLISHED', category: 'ELECTRONICS', hostel: 'Hostel 10', block: 'B',
      tags: ['extension board', 'anchor roma', 'power strip', 'electricity', 'hostel essential'],
      aiVerified: false, listingQualityScore: 58,
    },
    {
      sellerId: arjun._id,
      title: 'Problems in General Physics — I.E. Irodov',
      description: 'The holy book of JEE Physics! My solved copy with detailed solutions in pencil. Perfect for MSc/PhD entrance prep or JEE Advanced. All chapters covered. Physics Olympiad prep too.',
      mode: 'SELL', condition: 'GOOD', conditionScore: 75, priceInr: 280,
      status: 'PUBLISHED', category: 'BOOKS', hostel: 'Hostel 7', block: 'A',
      tags: ['irodov', 'physics', 'jee', 'olympiad', 'problems'],
      aiVerified: false, listingQualityScore: 62,
    },
    {
      sellerId: priya._id,
      title: 'Haier 99L Single Door Mini Fridge',
      description: 'Perfect hostel mini fridge! Energy efficient, 5-star rated. Frost-free. Can store 1 week groceries easily. Available from Dec (semester end) to April (semester start).',
      mode: 'LEND', condition: 'GOOD', conditionScore: 80, priceInr: 800, depositInr: 5000,
      status: 'PUBLISHED', category: 'APPLIANCES', hostel: 'Hostel 3', block: 'C',
      tags: ['mini fridge', 'haier', 'refrigerator', 'hostel', 'appliance'],
      aiVerified: false, listingQualityScore: 55,
    },
    {
      sellerId: vikram._id,
      title: 'Lab Coat (Full Sleeve) — Large Size',
      description: 'Full sleeve white lab coat, large size. Used for chemistry labs only (2 semesters). Washed and clean. Perfect for engineering and science labs. Elastic cuffs, 2 front pockets.',
      mode: 'SELL', condition: 'GOOD', conditionScore: 72, priceInr: 150,
      status: 'PUBLISHED', category: 'CLOTHING', hostel: 'Hostel G', block: 'G',
      tags: ['lab coat', 'chemistry lab', 'large', 'white coat', 'science'],
      aiVerified: false, listingQualityScore: 52,
    },
    {
      sellerId: rahul._id,
      title: 'Full Stack Web Dev Tutoring (React + Node)',
      description: 'I will teach you React.js, Node.js, Express, and MongoDB basics over 4 sessions of 1.5hr each. In exchange, I need your SolidWorks or FEA analysis help for my Minor project. Formal agreement will be signed.',
      mode: 'KNOWLEDGE', condition: 'N/A',
      status: 'PUBLISHED', category: 'SKILLS', hostel: 'Hostel 10', block: 'B',
      tags: ['react', 'nodejs', 'web dev', 'full stack', 'tutoring', 'knowledge swap'],
      aiVerified: false, listingQualityScore: 68,
    },
  ])

  const [casio, thermo, table, cleanCode, boat, sony, extensionBoard, irodov, fridge, labCoat, webDev] = listings
  console.log(`✅ Created ${listings.length} listings`)

  // ── Pre-seeded Transaction (HANDOVER_PENDING) ──────────────────────────────
  const tx1 = await Transaction.create({
    listingId: casio._id,
    sellerId: rahul._id,
    buyerId: ananya_k._id,
    agreedPriceInr: 420,
    status: 'HANDOVER_PENDING',
    otpUsed: false,
    otpGenerationCount: 0,
  })

  await Listing.findByIdAndUpdate(casio._id, { status: 'IN_TRANSACTION' })

  // Notifications
  await Notification.insertMany([
    {
      userId: rahul._id,
      type: 'OFFER_ACCEPTED',
      title: 'Deal locked! 🎉',
      message: 'Ananya Krishnan accepted your offer. Arrange meetup via chat.',
      link: `/transactions/${tx1._id.toString()}`,
    },
    {
      userId: ananya_k._id,
      type: 'NEW_OFFER',
      title: 'Transaction Active',
      message: `Your offer on "Casio FX-991ES" was accepted. Go to transaction to arrange pickup.`,
      link: `/transactions/${tx1._id.toString()}`,
    },
  ])

  console.log(`✅ Created 1 transaction (HANDOVER_PENDING)`)
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║          SEED COMPLETE — Demo Accounts       ║')
  console.log('╠══════════════════════════════════════════════╣')
  console.log('║  Admin:    admin@hostelmarket.in / Admin@123  ║')
  console.log('║  Rahul:    rahul.sharma@iit.ac.in / Student@123 ║')
  console.log('║  Ananya:   ananya.singh@du.ac.in / Student@123  ║')
  console.log('║  Priya:    priya.menon@nitc.ac.in / Student@123 ║')
  console.log('╚══════════════════════════════════════════════╝\n')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(e => { console.error('Seed failed:', e); process.exit(1) })

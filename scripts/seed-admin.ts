import connectDB from '../src/lib/mongoose'
import { User } from '../src/lib/models'
import bcrypt from 'bcryptjs'

async function seedAdmin() {
  await connectDB()

  const adminEmail = 'admin@campus.edu'
  const adminPassword = 'Admin@1234'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  const existing = await User.findOne({ email: adminEmail })
  if (existing) {
    existing.passwordHash = passwordHash
    existing.role = 'ADMIN'
    existing.isVerified = true
    existing.trustScore = 100
    existing.profile = {
      fullName: 'Campus Marketplace Admin',
      college: 'Campus Administration',
      hostel: 'Admin Tower',
      block: 'Central Wing',
      room: 'Room 101',
      phone: '+91 98765 43210',
      rollNumber: 'ADMIN-001',
      academicYear: 4,
      branch: 'Administration & Safety',
    }
    await existing.save()
    console.log('✓ Admin account updated successfully!')
  } else {
    const admin = new User({
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      isVerified: true,
      trustScore: 100,
      profile: {
        fullName: 'Campus Marketplace Admin',
        college: 'Campus Administration',
        hostel: 'Admin Tower',
        block: 'Central Wing',
        room: 'Room 101',
        phone: '+91 98765 43210',
        rollNumber: 'ADMIN-001',
        academicYear: 4,
        branch: 'Administration & Safety',
      },
    })
    await admin.save()
    console.log('✓ Admin account created successfully!')
  }

  // Also verify demo students
  const demoUsers = [
    { email: 'rahul.sharma@hostel.edu', name: 'Rahul Sharma', hostel: 'Hostel 10', block: 'B', room: 'B-204', roll: '21BCE045', branch: 'Computer Science' },
    { email: 'priya.patel@hostel.edu', name: 'Priya Patel', hostel: 'Hostel 4', block: 'A', room: 'A-102', roll: '22BME012', branch: 'Mechanical Eng' },
    { email: 'arjun.mehta@hostel.edu', name: 'Arjun Mehta', hostel: 'Hostel 8', block: 'C', room: 'C-315', roll: '23BEE089', branch: 'Electrical Eng' },
  ]

  for (const u of demoUsers) {
    const s = await User.findOne({ email: u.email })
    if (s) {
      s.isVerified = true
      s.trustScore = s.trustScore || 92
      s.profile.rollNumber = s.profile.rollNumber || u.roll
      s.profile.room = s.profile.room || u.room
      s.profile.branch = s.profile.branch || u.branch
      await s.save()
    }
  }

  console.log('✓ All demo users and admin seeded.')
  process.exit(0)
}

seedAdmin().catch(console.error)

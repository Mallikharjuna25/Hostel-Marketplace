import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.ownerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'bill'

    if (!file) {
      return NextResponse.json({ error: 'No bill file provided' }, { status: 400 })
    }

    // Stored under private/bills/ directory (distinct path from public product images)
    const privateDir = path.join(process.cwd(), 'private', 'bills')
    await mkdir(privateDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name) || '.pdf'
    const filename = `bill-${id}-${Date.now()}${ext}`
    const filepath = path.join(privateDir, filename)
    await writeFile(filepath, buffer)

    const billRecord = await prisma.productBill.create({
      data: {
        listingId: id,
        url: `/private/bills/${filename}`,
        type,
      },
    })

    return NextResponse.json({
      bill: billRecord,
      message: 'Proof of purchase uploaded securely. It will never be shown on public listings.',
    })
  } catch (err) {
    console.error('[POST /api/products/[id]/bill]', err)
    return NextResponse.json({ error: 'Failed to upload bill' }, { status: 500 })
  }
}

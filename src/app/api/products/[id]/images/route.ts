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
    const files = formData.getAll('files') as File[]
    const angle = (formData.get('angle') as string) || 'front'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    await mkdir(uploadDir, { recursive: true })

    const existingCount = await prisma.productImage.count({ where: { listingId: id } })
    const createdImages = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const ext = path.extname(file.name) || '.jpg'
      const filename = `${id}-${Date.now()}-${i}${ext}`
      const filepath = path.join(uploadDir, filename)
      await writeFile(filepath, buffer)

      const relativeUrl = `/uploads/products/${filename}`
      const imageRecord = await prisma.productImage.create({
        data: {
          listingId: id,
          url: relativeUrl,
          angle,
          order: existingCount + i + 1,
        },
      })
      createdImages.push(imageRecord)
    }

    return NextResponse.json({
      images: createdImages,
      message: 'Images uploaded successfully',
    })
  } catch (err) {
    console.error('[POST /api/products/[id]/images]', err)
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 })
  }
}

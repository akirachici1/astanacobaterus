// src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const settings = await prisma.setting.findMany()
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
    return NextResponse.json({ success: true, data: settingsMap })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil pengaturan' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const updates: Record<string, string> = {}

    for (const [key, value] of formData.entries()) {
      if (key === 'qris_image' && value instanceof File && value.size > 0) {
        const bytes = await value.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })
        const filename = `qris_${Date.now()}.${value.name.split('.').pop()}`
        await writeFile(path.join(uploadDir, filename), buffer)
        updates[key] = `/uploads/${filename}`
      } else if (typeof value === 'string') {
        updates[key] = value
      }
    }

    for (const [key, value] of Object.entries(updates)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    }

    return NextResponse.json({ success: true, message: 'Pengaturan berhasil disimpan' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal menyimpan pengaturan' }, { status: 500 })
  }
}

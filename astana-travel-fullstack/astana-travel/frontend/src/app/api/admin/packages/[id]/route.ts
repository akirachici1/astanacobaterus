// src/app/api/admin/packages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const pkg = await prisma.package.update({
      where: { id: Number(params.id) },
      data: body,
    })
    return NextResponse.json({ success: true, data: pkg })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal memperbarui paket' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.package.update({
      where: { id: Number(params.id) },
      data: { aktif: false },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal menghapus paket' }, { status: 500 })
  }
}

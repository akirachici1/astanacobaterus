// src/app/api/admin/registrations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const reg = await prisma.registration.findUnique({
      where: { id: Number(params.id) },
      include: { user: true, package: true, payments: true, invoice: true },
    })
    if (!reg) return NextResponse.json({ success: false, error: 'Tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ success: true, data: reg })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { status } = await req.json()
    const reg = await prisma.registration.update({
      where: { id: Number(params.id) },
      data: { status },
    })
    return NextResponse.json({ success: true, data: reg })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal memperbarui data' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    // Delete in order: payments -> invoice -> registration
    await prisma.payment.deleteMany({ where: { registration_id: Number(params.id) } })
    await prisma.invoice.deleteMany({ where: { registration_id: Number(params.id) } })
    await prisma.registration.delete({ where: { id: Number(params.id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal menghapus data' }, { status: 500 })
  }
}

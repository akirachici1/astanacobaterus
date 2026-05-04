// src/app/api/admin/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { user: { nama: { contains: search, mode: 'insensitive' } } },
        { user: { whatsapp: { contains: search } } },
      ]
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        user: true,
        package: true,
        payments: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const stats = {
      total: registrations.length,
      lunas: registrations.filter(r => r.status === 'LUNAS').length,
      pending: registrations.filter(r => r.status === 'MENUNGGU_PEMBAYARAN').length,
      totalPemasukan: registrations.flatMap(r => r.payments)
        .filter(p => p.status === 'VERIFIED')
        .reduce((sum, p) => sum + p.jumlah, 0),
    }

    return NextResponse.json({ success: true, data: registrations, stats })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 })
  }
}

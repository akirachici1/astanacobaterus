// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const [registrations, payments, packages] = await Promise.all([
      prisma.registration.findMany({
        include: { user: true, package: true, payments: true, invoice: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.findMany({
        where: { status: 'VERIFIED' },
        orderBy: { tanggal: 'asc' },
      }),
      prisma.package.findMany(),
    ])

    const totalPemasukan = payments.reduce((sum, p) => sum + p.jumlah, 0)

    // Monthly chart data
    const monthlyData: Record<string, number> = {}
    payments.forEach(p => {
      const month = new Date(p.tanggal).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      monthlyData[month] = (monthlyData[month] || 0) + p.jumlah
    })
    const chartData = Object.entries(monthlyData).map(([month, total]) => ({ month, total }))

    // Per package stats
    const packageStats = packages.map(pkg => {
      const regs = registrations.filter(r => r.package_id === pkg.id)
      return {
        id: pkg.id,
        tanggal: pkg.tanggal,
        hotel_mekkah: pkg.hotel_mekkah,
        harga: pkg.harga,
        jumlahPendaftar: regs.length,
        lunas: regs.filter(r => r.status === 'LUNAS').length,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalPendaftar: registrations.length,
        totalPemasukan,
        pendingVerifikasi: registrations.filter(r => r.status === 'MENUNGGU_VERIFIKASI').length,
        lunas: registrations.filter(r => r.status === 'LUNAS').length,
        chartData,
        packageStats,
        recentRegistrations: registrations.slice(0, 10),
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil statistik' }, { status: 500 })
  }
}

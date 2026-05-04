// src/app/api/admin/payments/[id]/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { action } = await req.json() // 'verify' | 'reject'

    const payment = await prisma.payment.update({
      where: { id: Number(params.id) },
      data: { status: action === 'verify' ? 'VERIFIED' : 'REJECTED' },
      include: { registration: { include: { payments: true } } },
    })

    if (action === 'verify') {
      const reg = payment.registration
      const totalVerified = reg.payments
        .filter(p => p.status === 'VERIFIED')
        .reduce((sum, p) => sum + p.jumlah, 0)

      let newStatus = reg.status
      const pct = totalVerified / reg.total

      if (pct >= 1) newStatus = 'LUNAS'
      else if (payment.cicilan_ke === 3) newStatus = 'CICILAN_3'
      else if (payment.cicilan_ke === 2) newStatus = 'CICILAN_2'
      else if (payment.cicilan_ke === 1) newStatus = 'CICILAN_1'
      else if (pct >= 0.5) newStatus = 'DP_LUNAS'

      await prisma.registration.update({
        where: { id: reg.id },
        data: { status: newStatus },
      })

      // Update invoice status
      await prisma.invoice.update({
        where: { registration_id: reg.id },
        data: { status: pct >= 1 ? 'LUNAS' : 'SEBAGIAN' },
      })
    }

    return NextResponse.json({ success: true, data: payment })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal memperbarui pembayaran' }, { status: 500 })
  }
}

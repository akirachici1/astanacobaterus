// src/app/api/tracking/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const nomor_invoice = searchParams.get('invoice')
    const whatsapp = searchParams.get('whatsapp')

    if (!nomor_invoice || !whatsapp) {
      return NextResponse.json({ success: false, error: 'Nomor invoice dan WhatsApp wajib diisi' }, { status: 400 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { nomor_invoice },
      include: {
        registration: {
          include: {
            user: true,
            package: true,
            payments: { orderBy: { tanggal: 'asc' } },
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice tidak ditemukan' }, { status: 404 })
    }

    // Verifikasi WA
    const userWa = invoice.registration.user.whatsapp.replace(/\D/g, '')
    const inputWa = whatsapp.replace(/\D/g, '')
    if (!userWa.includes(inputWa.slice(-8)) && !inputWa.includes(userWa.slice(-8))) {
      return NextResponse.json({ success: false, error: 'Data tidak cocok' }, { status: 403 })
    }

    const reg = invoice.registration
    const totalBayar = reg.payments
      .filter(p => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.jumlah, 0)
    const sisaTagihan = reg.total - totalBayar

    return NextResponse.json({
      success: true,
      data: {
        invoice,
        totalBayar,
        sisaTagihan,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 })
  }
}

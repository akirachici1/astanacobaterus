// src/app/api/invoice/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { nomor_invoice: params.id },
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

    return NextResponse.json({ success: true, data: invoice })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil invoice' }, { status: 500 })
  }
}

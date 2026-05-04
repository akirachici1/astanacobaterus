// src/app/api/payments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const registration_id = formData.get('registration_id') as string
    const jumlah = formData.get('jumlah') as string
    const cicilan_ke = formData.get('cicilan_ke') as string
    const bukti = formData.get('bukti_transfer') as File

    if (!registration_id || !jumlah) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }

    let buktiPath = null

    if (bukti && bukti.size > 0) {
      const bytes = await bukti.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })
      const filename = `payment_${Date.now()}_${bukti.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      await writeFile(path.join(uploadDir, filename), buffer)
      buktiPath = `/uploads/${filename}`
    }

    const payment = await prisma.payment.create({
      data: {
        registration_id: Number(registration_id),
        jumlah: Number(jumlah),
        bukti_transfer: buktiPath,
        status: 'PENDING',
        cicilan_ke: cicilan_ke ? Number(cicilan_ke) : null,
      },
    })

    // Update registration status
    await prisma.registration.update({
      where: { id: Number(registration_id) },
      data: { status: 'MENUNGGU_VERIFIKASI' },
    })

    return NextResponse.json({ success: true, data: payment }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

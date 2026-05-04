// src/app/api/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateInvoiceNumber, calculatePayment, sanitizeInput } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nama, ktp, tanggal_lahir, alamat, whatsapp, package_id, payment_type } = body

    // Validasi
    if (!nama || !ktp || !tanggal_lahir || !alamat || !whatsapp || !package_id || !payment_type) {
      return NextResponse.json({ success: false, error: 'Semua field wajib diisi' }, { status: 400 })
    }

    // Get package
    const pkg = await prisma.package.findUnique({ where: { id: Number(package_id) } })
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Paket tidak ditemukan' }, { status: 404 })
    }

    // Create or get user
    let user = await prisma.user.findFirst({ where: { ktp: sanitizeInput(ktp) } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          nama: sanitizeInput(nama),
          ktp: sanitizeInput(ktp),
          tanggal_lahir: new Date(tanggal_lahir),
          alamat: sanitizeInput(alamat),
          whatsapp: sanitizeInput(whatsapp),
        },
      })
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        user_id: user.id,
        package_id: pkg.id,
        payment_type,
        total: pkg.harga,
        status: 'MENUNGGU_PEMBAYARAN',
      },
    })

    // Create invoice
    const invoiceNumber = generateInvoiceNumber()
    const invoice = await prisma.invoice.create({
      data: {
        nomor_invoice: invoiceNumber,
        registration_id: registration.id,
        status: 'BELUM_LUNAS',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        registration,
        invoice,
        user,
        package: pkg,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ success: false, error: error.message || 'Gagal mendaftar' }, { status: 500 })
  }
}

// src/app/api/packages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      where: { aktif: true },
      orderBy: { tanggal: 'asc' },
    })
    return NextResponse.json({ success: true, data: packages })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data paket' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const pkg = await prisma.package.create({ data: body })
    return NextResponse.json({ success: true, data: pkg }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal membuat paket' }, { status: 500 })
  }
}

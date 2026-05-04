// src/app/api/settings/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.setting.findMany()
    const map = settings.reduce((acc: any, s) => ({ ...acc, [s.key]: s.value }), {})
    return NextResponse.json({ success: true, data: map })
  } catch {
    return NextResponse.json({ success: false, data: {} })
  }
}

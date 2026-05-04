// src/lib/utils.ts
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'd MMMM yyyy', { locale: id })
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `AST/UMR/${year}/${random}`
}

export function calculatePayment(total: number, type: string) {
  switch (type) {
    case 'DP':
      return {
        dp: Math.ceil(total * 0.5),
        cicilan: [],
        lunas: total,
        bayarSekarang: Math.ceil(total * 0.5),
        sisa: total - Math.ceil(total * 0.5),
      }
    case 'CICILAN':
      const dp = Math.ceil(total * 0.5)
      const sisa = total - dp
      const cicilan = Math.ceil(sisa / 3)
      return {
        dp,
        cicilan: [cicilan, cicilan, sisa - cicilan * 2],
        lunas: total,
        bayarSekarang: dp,
        sisa,
      }
    case 'LUNAS':
      return {
        dp: total,
        cicilan: [],
        lunas: total,
        bayarSekarang: total,
        sisa: 0,
      }
    default:
      return { dp: 0, cicilan: [], lunas: total, bayarSekarang: 0, sisa: total }
  }
}

export function getStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    MENUNGGU_PEMBAYARAN: { label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-800' },
    MENUNGGU_VERIFIKASI: { label: 'Menunggu Verifikasi', color: 'bg-blue-100 text-blue-800' },
    DP_LUNAS: { label: 'DP Lunas', color: 'bg-green-100 text-green-800' },
    CICILAN_1: { label: 'Cicilan ke-1 Lunas', color: 'bg-teal-100 text-teal-800' },
    CICILAN_2: { label: 'Cicilan ke-2 Lunas', color: 'bg-teal-100 text-teal-800' },
    CICILAN_3: { label: 'Cicilan ke-3 Lunas', color: 'bg-teal-100 text-teal-800' },
    LUNAS: { label: 'Lunas', color: 'bg-green-100 text-green-800' },
  }
  return map[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>'"]/g, '').trim()
}

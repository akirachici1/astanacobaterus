// src/app/tracking/page.tsx
'use client'
import { useState } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Search, CheckCircle, Clock, Upload, ChevronRight, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  MENUNGGU_PEMBAYARAN: { label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-800' },
  MENUNGGU_VERIFIKASI: { label: 'Menunggu Verifikasi', color: 'bg-blue-100 text-blue-800' },
  DP_LUNAS: { label: 'DP Lunas', color: 'bg-green-100 text-green-800' },
  CICILAN_1: { label: 'Cicilan ke-1 Lunas', color: 'bg-teal-100 text-teal-800' },
  CICILAN_2: { label: 'Cicilan ke-2 Lunas', color: 'bg-teal-100 text-teal-800' },
  CICILAN_3: { label: 'Cicilan ke-3 Lunas', color: 'bg-teal-100 text-teal-800' },
  LUNAS: { label: 'Lunas ✓', color: 'bg-green-100 text-green-800' },
}

export default function TrackingPage() {
  const [invoice, setInvoice] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showPayModal, setShowPayModal] = useState(false)
  const [bukti, setBukti] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoice || !whatsapp) { toast.error('Isi nomor invoice dan WhatsApp'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/tracking?invoice=${encodeURIComponent(invoice)}&whatsapp=${encodeURIComponent(whatsapp)}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setResult(data.data)
    } catch (e: any) {
      toast.error(e.message || 'Data tidak ditemukan')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadBayar = async () => {
    if (!bukti) { toast.error('Pilih file bukti'); return }
    setUploading(true)
    try {
      const reg = result.invoice.registration
      const fd = new FormData()
      fd.append('registration_id', String(reg.id))
      fd.append('jumlah', String(Math.ceil(reg.total * 0.5)))
      fd.append('bukti_transfer', bukti)
      const res = await fetch('/api/payments', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      toast.success('Bukti berhasil dikirim! Menunggu verifikasi.')
      setShowPayModal(false)
      handleSearch(new Event('submit') as any)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setUploading(false)
    }
  }

  const inv = result?.invoice
  const reg = inv?.registration
  const status = reg ? (STATUS_MAP[reg.status] || { label: reg.status, color: 'bg-gray-100 text-gray-800' }) : null

  return (
    <PublicLayout>
      <section className="bg-[#0A1931] py-20 relative overflow-hidden">
        <div className="absolute inset-0 arabic-pattern opacity-20" />
        <div className="relative max-w-2xl mx-auto text-center px-4">
          <h1 className="font-display text-4xl font-bold text-white mb-3">Cek Status Jamaah</h1>
          <p className="text-[#B3CFE5]">Masukkan nomor invoice dan WhatsApp untuk melihat status pendaftaran Anda</p>
        </div>
      </section>

      <section className="py-12 bg-[#F6FAFD]">
        <div className="max-w-2xl mx-auto px-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-[#B3CFE5]/30 shadow-sm p-6 mb-8">
            <h2 className="font-semibold text-[#0A1931] mb-5">Cari Data Jamaah</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Invoice</label>
                <input
                  value={invoice}
                  onChange={e => setInvoice(e.target.value)}
                  className="input-field"
                  placeholder="Contoh: AST/UMR/2026/1234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WhatsApp</label>
                <input
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="input-field"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#0A1931] hover:bg-[#4A7FA7] text-white py-3 rounded-xl font-semibold transition-all"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                {loading ? 'Mencari...' : 'Cek Status'}
              </button>
            </div>
          </form>

          {/* Result */}
          {result && inv && reg && (
            <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 shadow-sm overflow-hidden">
              {/* Status Header */}
              <div className="bg-[#0A1931] p-6 text-white">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-[#B3CFE5]/70 text-xs mb-1">Nomor Invoice</div>
                    <div className="font-bold text-lg">{inv.nomor_invoice}</div>
                    <div className="text-[#B3CFE5] text-sm mt-1">{reg.user.nama}</div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${status?.color}`}>
                    {status?.label}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Package Info */}
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-[#F6FAFD] rounded-xl p-4">
                    <div className="text-gray-500 mb-1">Paket Keberangkatan</div>
                    <div className="font-bold text-[#0A1931]">{formatDate(reg.package.tanggal)}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{reg.package.hotel_mekkah}</div>
                  </div>
                  <div className="bg-[#F6FAFD] rounded-xl p-4">
                    <div className="text-gray-500 mb-1">Metode Pembayaran</div>
                    <div className="font-bold text-[#0A1931]">{reg.payment_type}</div>
                    <div className="text-gray-500 text-xs mt-0.5">Total: {formatCurrency(reg.total)}</div>
                  </div>
                </div>

                {/* Payment Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress Pembayaran</span>
                    <span className="font-semibold text-[#0A1931]">{Math.round((result.totalBayar / reg.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-[#4A7FA7] h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (result.totalBayar / reg.total) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Dibayar: {formatCurrency(result.totalBayar)}</span>
                    <span>Sisa: {formatCurrency(result.sisaTagihan)}</span>
                  </div>
                </div>

                {/* Payment History */}
                {reg.payments.length > 0 && (
                  <div>
                    <div className="font-medium text-[#0A1931] text-sm mb-3">Riwayat Pembayaran</div>
                    <div className="space-y-2">
                      {reg.payments.map((pay: any) => (
                        <div key={pay.id} className="flex items-center justify-between p-3 bg-[#F6FAFD] rounded-lg text-sm">
                          <div className="flex items-center gap-2">
                            {pay.status === 'VERIFIED' ? <CheckCircle size={14} className="text-green-500" /> : <Clock size={14} className="text-yellow-500" />}
                            <div>
                              <div className="font-medium">{formatCurrency(pay.jumlah)}</div>
                              <div className="text-xs text-gray-400">{formatDate(pay.tanggal)}</div>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            pay.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                            pay.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {pay.status === 'VERIFIED' ? 'Terverifikasi' : pay.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href={`/invoice/${inv.nomor_invoice}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0A1931] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#4A7FA7] transition-all"
                  >
                    Lihat Invoice <ChevronRight size={14} />
                  </Link>
                  {result.sisaTagihan > 0 && (
                    <button
                      onClick={() => setShowPayModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#4A7FA7] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#1A3D63] transition-all"
                    >
                      <Upload size={14} /> Bayar Cicilan
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal Upload */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-bold text-[#0A1931]">Upload Bukti Pembayaran</h3>
              <button onClick={() => setShowPayModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Bukti Transfer</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => setBukti(e.target.files?.[0] || null)}
                  className="w-full border border-[#B3CFE5] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={handleUploadBayar}
                disabled={uploading || !bukti}
                className="w-full flex items-center justify-center gap-2 bg-[#4A7FA7] text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-[#1A3D63] transition-all"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? 'Mengirim...' : 'Kirim Bukti'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  )
}

// src/app/admin/pendaftar/page.tsx
'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Search, Eye, Trash2, CheckCircle, XCircle, Loader2, ChevronDown, ExternalLink } from 'lucide-react'
import Link from 'next/link'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  MENUNGGU_PEMBAYARAN: { label: 'Menunggu Bayar', color: 'bg-yellow-100 text-yellow-800' },
  MENUNGGU_VERIFIKASI: { label: 'Menunggu Verif', color: 'bg-blue-100 text-blue-800' },
  DP_LUNAS: { label: 'DP Lunas', color: 'bg-green-100 text-green-800' },
  CICILAN_1: { label: 'Cicilan 1', color: 'bg-teal-100 text-teal-800' },
  CICILAN_2: { label: 'Cicilan 2', color: 'bg-teal-100 text-teal-800' },
  CICILAN_3: { label: 'Cicilan 3', color: 'bg-teal-100 text-teal-800' },
  LUNAS: { label: 'Lunas', color: 'bg-green-100 text-green-800' },
}

export default function PendaftarPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''

  const fetchData = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (statusFilter) params.append('status', statusFilter)
    const res = await fetch(`/api/admin/registrations?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    const d = await res.json()
    setData(d.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [search, statusFilter])

  const handleVerify = async (paymentId: number, action: 'verify' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      toast.success(action === 'verify' ? 'Pembayaran terverifikasi!' : 'Pembayaran ditolak')
      fetchData()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus pendaftaran ini?')) return
    try {
      await fetch(`/api/admin/registrations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      toast.success('Berhasil dihapus')
      fetchData()
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1931]">Rekap Pendaftar</h1>
          <p className="text-gray-500 text-sm mt-1">{data.length} total pendaftar</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama / WhatsApp..."
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input-field py-2.5 text-sm w-auto min-w-40"
        >
          <option value="">Semua Status</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F6FAFD] border-b border-[#B3CFE5]/20">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jamaah</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Paket</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pembayaran</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B3CFE5]/20">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">
                  <Loader2 size={24} className="animate-spin mx-auto" />
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">Tidak ada data</td></tr>
              ) : data.map(reg => {
                const st = STATUS_MAP[reg.status] || { label: reg.status, color: 'bg-gray-100 text-gray-800' }
                const totalBayar = reg.payments.filter((p: any) => p.status === 'VERIFIED').reduce((s: number, p: any) => s + p.jumlah, 0)
                const pendingPayments = reg.payments.filter((p: any) => p.status === 'PENDING')

                return (
                  <>
                    <tr key={reg.id} className="hover:bg-[#F6FAFD] transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-sm text-[#0A1931]">{reg.user?.nama}</div>
                        <div className="text-xs text-gray-400">{reg.user?.whatsapp}</div>
                        <div className="text-xs text-gray-400">{reg.user?.ktp}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm text-gray-700">{reg.package ? formatDate(reg.package.tanggal) : '-'}</div>
                        <div className="text-xs text-gray-400">{reg.package?.hotel_mekkah}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm font-medium text-[#0A1931]">{formatCurrency(totalBayar)}</div>
                        <div className="text-xs text-gray-400">dari {formatCurrency(reg.total)}</div>
                        <div className="text-xs text-gray-400">{reg.payment_type}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        {reg.invoice && (
                          <Link
                            href={`/invoice/${reg.invoice.nomor_invoice}`}
                            target="_blank"
                            className="flex items-center gap-1 text-xs text-[#4A7FA7] hover:underline"
                          >
                            {reg.invoice.nomor_invoice.split('/').slice(-1)[0]}
                            <ExternalLink size={10} />
                          </Link>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {pendingPayments.length > 0 && (
                            <button
                              onClick={() => setExpanded(expanded === reg.id ? null : reg.id)}
                              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium hover:bg-blue-100"
                            >
                              {pendingPayments.length} Bukti <ChevronDown size={12} className={expanded === reg.id ? 'rotate-180' : ''} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(reg.id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded payment verification */}
                    {expanded === reg.id && pendingPayments.map((pay: any) => (
                      <tr key={`pay-${pay.id}`} className="bg-blue-50/50">
                        <td colSpan={6} className="px-5 py-3">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="text-sm">
                              <span className="text-gray-500">Bukti bayar:</span>
                              <span className="font-medium ml-2">{formatCurrency(pay.jumlah)}</span>
                              <span className="text-gray-400 ml-2 text-xs">{formatDate(pay.tanggal)}</span>
                            </div>
                            {pay.bukti_transfer && (
                              <a href={pay.bukti_transfer} target="_blank" className="text-xs text-[#4A7FA7] hover:underline flex items-center gap-1">
                                Lihat Bukti <ExternalLink size={10} />
                              </a>
                            )}
                            <div className="flex gap-2 ml-auto">
                              <button
                                onClick={() => handleVerify(pay.id, 'verify')}
                                className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700"
                              >
                                <CheckCircle size={12} /> Verifikasi
                              </button>
                              <button
                                onClick={() => handleVerify(pay.id, 'reject')}
                                className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600"
                              >
                                <XCircle size={12} /> Tolak
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// src/app/admin/pembayaran/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Download, Filter, TrendingUp, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PembayaranPage() {
  const [stats, setStats] = useState<any>(null)
  const [allPayments, setAllPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    Promise.all([
      fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/admin/registrations', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([s, r]) => {
      setStats(s.data)
      // Flatten all payments
      const payments: any[] = []
      ;(r.data || []).forEach((reg: any) => {
        reg.payments.forEach((pay: any) => {
          payments.push({ ...pay, reg_user: reg.user, reg_package: reg.package, nomor_invoice: reg.invoice?.nomor_invoice })
        })
      })
      payments.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      setAllPayments(payments)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = allPayments.filter(p => {
    if (dateFrom && new Date(p.tanggal) < new Date(dateFrom)) return false
    if (dateTo && new Date(p.tanggal) > new Date(dateTo + 'T23:59:59')) return false
    return true
  })

  const totalVerified = filtered.filter(p => p.status === 'VERIFIED').reduce((s, p) => s + p.jumlah, 0)
  const totalPending = filtered.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.jumlah, 0)
  const totalRejected = filtered.filter(p => p.status === 'REJECTED').reduce((s, p) => s + p.jumlah, 0)

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx')
      const rows = filtered.map(p => ({
        'Tanggal': formatDate(p.tanggal),
        'Nama Jamaah': p.reg_user?.nama,
        'No Invoice': p.nomor_invoice,
        'Paket': p.reg_package ? formatDate(p.reg_package.tanggal) : '-',
        'Jumlah': p.jumlah,
        'Cicilan ke': p.cicilan_ke || '-',
        'Status': p.status,
        'Bukti': p.bukti_transfer || '-',
      }))
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Pembayaran')
      XLSX.writeFile(wb, `Pembayaran_${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('Excel berhasil diunduh!')
    } catch (e) {
      toast.error('Gagal export Excel')
    }
  }

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default
      const doc = new jsPDF({ orientation: 'landscape' })

      doc.setFontSize(14)
      doc.text('ASTANA HAJJ & UMROH TRAVEL - Rekap Pembayaran', 14, 16)
      doc.setFontSize(9)
      doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 22)

      autoTable(doc, {
        startY: 28,
        head: [['Tanggal', 'Nama Jamaah', 'No Invoice', 'Paket', 'Jumlah', 'Status']],
        body: filtered.map(p => [
          formatDate(p.tanggal),
          p.reg_user?.nama,
          p.nomor_invoice || '-',
          p.reg_package ? formatDate(p.reg_package.tanggal) : '-',
          formatCurrency(p.jumlah),
          p.status,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [10, 25, 49] },
      })

      doc.save(`Rekap_Pembayaran_${new Date().toISOString().slice(0, 10)}.pdf`)
      toast.success('PDF berhasil diunduh!')
    } catch (e) {
      toast.error('Gagal export PDF')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-[#4A7FA7]" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1931]">Rekap Pembayaran</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} transaksi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            <Download size={14} /> Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Terverifikasi', value: formatCurrency(totalVerified), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          { label: 'Menunggu Verifikasi', value: formatCurrency(totalPending), icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
          { label: 'Total Ditolak', value: formatCurrency(totalRejected), icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl border ${s.border} p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm">{s.label}</span>
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
            </div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter Tanggal:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="border border-[#B3CFE5] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]"
            />
            <span className="text-gray-400 text-sm">s/d</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="border border-[#B3CFE5] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo('') }}
              className="text-sm text-red-500 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      {stats?.chartData?.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 shadow-sm p-6">
          <h3 className="font-semibold text-[#0A1931] mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#4A7FA7]" />
            Grafik Pemasukan Bulanan
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1e6).toFixed(0)}jt`} />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), 'Pemasukan']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="total" fill="#4A7FA7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#B3CFE5]/20">
          <h3 className="font-semibold text-[#0A1931]">Riwayat Transaksi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F6FAFD]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jamaah</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No Invoice</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Paket</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Keterangan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B3CFE5]/20">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-gray-400">Tidak ada data</td></tr>
              ) : filtered.map(pay => (
                <tr key={pay.id} className="hover:bg-[#F6FAFD] transition-colors">
                  <td className="px-5 py-3 text-sm text-gray-600">{formatDate(pay.tanggal)}</td>
                  <td className="px-5 py-3">
                    <div className="text-sm font-medium text-[#0A1931]">{pay.reg_user?.nama}</div>
                    <div className="text-xs text-gray-400">{pay.reg_user?.whatsapp}</div>
                  </td>
                  <td className="px-5 py-3 text-sm text-[#4A7FA7] font-mono">{pay.nomor_invoice || '-'}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {pay.reg_package ? formatDate(pay.reg_package.tanggal) : '-'}
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-[#0A1931]">{formatCurrency(pay.jumlah)}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {pay.cicilan_ke ? `Cicilan ke-${pay.cicilan_ke}` : 'DP / Lunas'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      pay.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                      pay.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {pay.status === 'VERIFIED' ? 'Terverifikasi' : pay.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {pay.bukti_transfer ? (
                      <a
                        href={pay.bukti_transfer}
                        target="_blank"
                        className="text-xs text-[#4A7FA7] hover:underline"
                      >
                        Lihat →
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-4 border-t border-[#B3CFE5]/20 bg-[#F6FAFD] flex justify-between items-center">
            <span className="text-sm text-gray-500">{filtered.length} transaksi</span>
            <span className="text-sm font-bold text-[#0A1931]">
              Total Terverifikasi: <span className="text-green-600">{formatCurrency(totalVerified)}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

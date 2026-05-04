// src/app/admin/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Users, CreditCard, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setStats(d.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-[#4A7FA7] border-t-transparent rounded-full" />
    </div>
  )

  const statCards = [
    { label: 'Total Pendaftar', value: stats?.totalPendaftar || 0, icon: Users, color: 'bg-blue-50 text-blue-700', bg: 'bg-blue-500' },
    { label: 'Total Pemasukan', value: formatCurrency(stats?.totalPemasukan || 0), icon: TrendingUp, color: 'bg-green-50 text-green-700', bg: 'bg-green-500' },
    { label: 'Pending Verifikasi', value: stats?.pendingVerifikasi || 0, icon: Clock, color: 'bg-yellow-50 text-yellow-700', bg: 'bg-yellow-500' },
    { label: 'Sudah Lunas', value: stats?.lunas || 0, icon: CheckCircle, color: 'bg-teal-50 text-teal-700', bg: 'bg-teal-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1931]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang di panel admin ASTANA Hajj & Umroh Travel</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#B3CFE5]/30 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm">{s.label}</span>
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon size={18} className="text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0A1931]">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#B3CFE5]/30 p-6 shadow-sm">
          <h3 className="font-semibold text-[#0A1931] mb-5">Pemasukan Bulanan</h3>
          {stats?.chartData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1e6).toFixed(0)}jt`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="total" fill="#4A7FA7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Belum ada data pembayaran</div>
          )}
        </div>

        {/* Package Stats */}
        <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 p-6 shadow-sm">
          <h3 className="font-semibold text-[#0A1931] mb-5">Per Paket</h3>
          <div className="space-y-3">
            {stats?.packageStats?.map((pkg: any) => (
              <div key={pkg.id} className="p-3 bg-[#F6FAFD] rounded-xl">
                <div className="text-xs font-medium text-[#0A1931]">
                  {new Date(pkg.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{pkg.jumlahPendaftar} pendaftar</span>
                  <span>{pkg.lunas} lunas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#B3CFE5]/20">
          <h3 className="font-semibold text-[#0A1931]">Pendaftaran Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F6FAFD]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Paket</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B3CFE5]/20">
              {stats?.recentRegistrations?.slice(0, 8).map((reg: any) => {
                const st = STATUS_MAP[reg.status] || { label: reg.status, color: 'bg-gray-100 text-gray-800' }
                return (
                  <tr key={reg.id} className="hover:bg-[#F6FAFD] transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-[#0A1931]">{reg.user?.nama}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {reg.package ? formatDate(reg.package.tanggal) : '-'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">{formatCurrency(reg.total)}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{formatDate(reg.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

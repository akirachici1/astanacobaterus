// src/app/paket/page.tsx
'use client'
import { useEffect, useState } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import Link from 'next/link'
import { Plane, Hotel, Calendar, Clock, ChevronRight, CheckCircle } from 'lucide-react'

interface Package {
  id: number
  tanggal: string
  hotel_mekkah: string
  hotel_madinah: string | null
  harga: number
  durasi: number
  maskapai: string
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const inclusions = [
  'Tiket pesawat PP Lion Air Premium',
  'Hotel bintang 3 di Mekkah & Madinah',
  'Visa Umroh',
  'Handling & airport tax',
  'Pembimbing ibadah berpengalaman',
  'Muthawif selama di Tanah Suci',
  'Konsumsi 3x sehari selama di hotel',
  'Asuransi perjalanan',
  'Transportasi AC selama tour',
  'Perlengkapan umroh (koper, kain ihram, dll)',
  'Manasik umroh sebelum berangkat',
  'Ziarah Mekkah & Madinah',
]

export default function PaketPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then(d => setPackages(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  // Fallback static data
  const staticPackages: Package[] = [
    { id: 1, tanggal: '2026-07-01', hotel_mekkah: 'Snoed / Srtf ★★★', hotel_madinah: 'Nada Salam / Srtf ★★★', harga: 28500000, durasi: 16, maskapai: 'Lion Air Premium (Direct)' },
    { id: 2, tanggal: '2026-07-15', hotel_mekkah: 'Daefa / Rehab', hotel_madinah: 'Nada Salam / Taqwa', harga: 29500000, durasi: 16, maskapai: 'Lion Air Premium (Direct)' },
    { id: 3, tanggal: '2026-08-01', hotel_mekkah: 'Daefa / Rehab', hotel_madinah: 'Nada Salam / Taqwa', harga: 31500000, durasi: 16, maskapai: 'Lion Air Premium (Direct)' },
    { id: 4, tanggal: '2026-09-05', hotel_mekkah: 'Daefa / Rehab', hotel_madinah: 'Nada Salam / Taqwa', harga: 34500000, durasi: 16, maskapai: 'Lion Air Premium (Direct)' },
  ]

  const displayPackages = packages.length > 0 ? packages : staticPackages

  return (
    <PublicLayout>
      {/* Header */}
      <section className="bg-[#0A1931] py-20 relative overflow-hidden">
        <div className="absolute inset-0 arabic-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <div className="inline-block bg-[#4A7FA7]/20 border border-[#4A7FA7]/30 text-[#B3CFE5] text-sm px-4 py-1.5 rounded-full mb-4">
            Keberangkatan 2026
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Paket Umroh Kami
          </h1>
          <p className="text-[#B3CFE5] text-lg">
            Pilih jadwal yang sesuai dengan Anda. Semua paket menggunakan Lion Air Premium penerbangan langsung.
          </p>
        </div>
      </section>

      {/* Packages Table */}
      <section className="py-16 bg-[#F6FAFD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 overflow-x-auto rounded-2xl shadow-sm border border-[#B3CFE5]/30">
            <table className="w-full bg-white">
              <thead>
                <tr className="bg-[#0A1931] text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Keberangkatan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Hotel Mekkah</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Hotel Madinah</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Durasi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Harga</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">DP (50%)</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">Memuat data paket...</td></tr>
                ) : displayPackages.map((pkg, i) => (
                  <tr key={pkg.id} className={`border-b border-[#B3CFE5]/20 hover:bg-[#F6FAFD] transition-colors ${i % 2 === 0 ? '' : 'bg-[#F6FAFD]/50'}`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#0A1931]">{formatDate(pkg.tanggal)}</div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Plane size={10} /> {pkg.maskapai}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 flex items-center gap-1">
                        <Hotel size={12} className="text-[#4A7FA7]" /> {pkg.hotel_mekkah}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 flex items-center gap-1">
                        <Hotel size={12} className="text-[#4A7FA7]" /> {pkg.hotel_madinah || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock size={12} /> {pkg.durasi} Hari
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0A1931]">{formatCurrency(pkg.harga)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#4A7FA7] font-semibold text-sm">{formatCurrency(Math.ceil(pkg.harga * 0.5))}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/daftar?paket=${pkg.id}`}
                        className="inline-flex items-center gap-1.5 bg-[#0A1931] hover:bg-[#4A7FA7] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                      >
                        Pilih Paket <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#1A3D63]/10 border border-[#4A7FA7]/20 rounded-xl p-4 text-sm text-[#1A3D63]">
            <strong>Catatan:</strong> Harga sudah termasuk biaya pengurusan visa, tiket pesawat PP, akomodasi hotel, dan pembimbing. Harga dapat berubah sewaktu-waktu. Setoran awal 4.000 USD langsung dapat porsi resmi.
          </div>
        </div>
      </section>

      {/* Inclusions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-[#0A1931] mb-3">Yang Sudah Termasuk</h2>
            <p className="text-gray-500">Semua kebutuhan ibadah Anda sudah kami siapkan</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {inclusions.map(item => (
              <div key={item} className="flex items-start gap-3 p-4 bg-[#F6FAFD] rounded-xl">
                <CheckCircle size={18} className="text-[#4A7FA7] mt-0.5 shrink-0" />
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/daftar"
              className="inline-flex items-center gap-2 bg-[#0A1931] hover:bg-[#4A7FA7] text-white px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              Daftar Sekarang
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

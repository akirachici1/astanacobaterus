// src/app/page.tsx
import PublicLayout from '@/components/layout/PublicLayout'
import Link from 'next/link'
import { Shield, Star, Users, Award, ChevronRight, Phone, MapPin, CheckCircle, Plane } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Legalitas Resmi',
    desc: 'Terdaftar resmi di KEMENHAJ RI dengan kuota pasti setiap tahunnya.',
  },
  {
    icon: Star,
    title: 'Hotel VIP',
    desc: 'Fasilitas hotel bintang 3 hingga VIP Movenpick untuk paket premium.',
  },
  {
    icon: Users,
    title: 'Pembimbing Berpengalaman',
    desc: 'Dibimbing ustadz berpengalaman sesuai tuntunan Sunnah Rasulullah ﷺ.',
  },
  {
    icon: Award,
    title: 'Penerbangan Langsung',
    desc: 'Lion Air Premium Direct tanpa transit, nyaman dan efisien.',
  },
]

const packages = [
  { tanggal: '01 Juli 2026', harga: 28500000 },
  { tanggal: '15 Juli 2026', harga: 29500000 },
  { tanggal: '01 Agustus 2026', harga: 31500000 },
  { tanggal: '05 September 2026', harga: 34500000 },
]

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0A1931]">
        {/* Background pattern */}
        <div className="absolute inset-0 arabic-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1931] via-[#1A3D63]/80 to-[#0A1931]" />

        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#4A7FA7]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#B3CFE5]/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#4A7FA7]/20 border border-[#4A7FA7]/40 text-[#B3CFE5] px-4 py-2 rounded-full text-sm mb-6">
                <CheckCircle size={14} className="text-[#4A7FA7]" />
                Kuota Resmi KEMENHAJ RI 2026
              </div>

              {/* Arabic text */}
              <p className="font-display text-2xl text-[#B3CFE5]/70 mb-3 italic">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
              </p>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                ASTANA
                <span className="block text-[#4A7FA7]">Hajj & Umroh</span>
                Travel
              </h1>

              <p className="text-[#B3CFE5] text-lg mb-2 italic font-display">
                "Perjalanan Satu Anda, Komitmen Kami"
              </p>

              <p className="text-[#B3CFE5]/70 text-base mb-8 max-w-lg leading-relaxed">
                Memberikan perjalanan ibadah yang aman, terjamin, berkualitas, dan nyaman sesuai tuntunan Sunnah. Berangkat dari Lamongan, Jawa Timur.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/paket"
                  className="inline-flex items-center justify-center gap-2 bg-[#4A7FA7] hover:bg-[#1A3D63] text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
                >
                  Lihat Paket Umroh
                  <ChevronRight size={18} />
                </Link>
                <a
                  href="https://wa.me/6281235270809"
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300"
                >
                  <Phone size={18} />
                  Konsultasi Gratis
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-10 pt-10 border-t border-[#1A3D63]">
                {[
                  { label: 'Tahun Berpengalaman', value: '10+' },
                  { label: 'Jamaah Diberangkatkan', value: '500+' },
                  { label: 'Kepuasan Jamaah', value: '99%' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-[#4A7FA7]">{stat.value}</div>
                    <div className="text-[#B3CFE5]/60 text-xs mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Package Preview */}
            <div className="hidden lg:block">
              <div className="bg-white/5 backdrop-blur-sm border border-[#4A7FA7]/20 rounded-3xl p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Plane size={20} className="text-[#4A7FA7]" />
                  <span className="text-white font-semibold">Jadwal Keberangkatan 2026</span>
                </div>
                <div className="space-y-3">
                  {packages.map((pkg, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-[#1A3D63]/40 rounded-xl p-4 hover:bg-[#1A3D63]/60 transition-colors"
                    >
                      <div>
                        <div className="text-white font-medium text-sm">{pkg.tanggal}</div>
                        <div className="text-[#B3CFE5]/60 text-xs mt-0.5">16 Hari · Lion Air Premium</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#4A7FA7] font-bold text-sm">{formatCurrency(pkg.harga)}</div>
                        <div className="text-[#B3CFE5]/50 text-xs">/jamaah</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/daftar"
                  className="mt-6 block text-center bg-[#4A7FA7] hover:bg-[#1A3D63] text-white py-3 rounded-xl font-semibold text-sm transition-all"
                >
                  Daftar Sekarang →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legalitas Banner */}
      <section className="bg-[#1A3D63] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#B3CFE5]">
            {[
              '✓ Kuota Resmi KEMENHAJ RI',
              '✓ Pembimbing Bersertifikat Syariat',
              '✓ Fasilitas VIP Movenpick',
              '✓ Setoran Awal 4.000 USD',
              '✓ Lion Air Premium Direct',
            ].map(item => (
              <span key={item} className="font-medium">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#F6FAFD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block bg-[#B3CFE5]/30 text-[#1A3D63] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Keunggulan Kami
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0A1931] mb-3">
              Mengapa Pilih ASTANA?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Kami hadir dengan komitmen penuh untuk memberikan pengalaman ibadah terbaik bagi setiap jamaah.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#B3CFE5]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-[#0A1931] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#4A7FA7] transition-colors">
                  <f.icon size={22} className="text-[#4A7FA7] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-[#0A1931] mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-[#B3CFE5]/30 text-[#1A3D63] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                Tentang Kami
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0A1931] mb-5 leading-tight">
                Amanah Dalam Setiap
                <span className="text-[#4A7FA7]"> Langkah Ibadah</span>
              </h2>
              <p className="text-gray-600 mb-5 leading-relaxed">
                ASTANA HAJJ & UMROH TRAVEL adalah perusahaan travel ibadah yang berdiri di Paciran, Lamongan, Jawa Timur. Dengan pengalaman lebih dari 10 tahun, kami telah memberangkatkan ratusan jamaah ke Tanah Suci dengan selamat dan berkah.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Visi kami adalah memberikan perjalanan ibadah yang aman, terjamin, berkualitas, dan nyaman sesuai tuntunan Sunnah Rasulullah ﷺ. Setiap jamaah adalah amanah yang kami emban dengan penuh tanggung jawab.
              </p>

              <div className="space-y-3">
                {[
                  'Izin resmi dari Kementerian Agama RI',
                  'Pembimbing ustadz berpengalaman & bersertifikat',
                  'Hotel strategis dekat Masjidil Haram & Nabawi',
                  'Pengurusan visa & dokumen lengkap',
                  'Asuransi perjalanan untuk semua jamaah',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#4A7FA7] rounded-full flex items-center justify-center shrink-0">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-[#0A1931] to-[#1A3D63] rounded-3xl p-8 text-white">
                <div className="font-display text-2xl text-center mb-8 text-[#B3CFE5]">
                  Paket Terjangkau, Ibadah Berkualitas
                </div>
                <div className="space-y-4">
                  {packages.map((pkg, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-[#1A3D63] pb-3 last:border-0">
                      <div>
                        <div className="font-medium">{pkg.tanggal}</div>
                        <div className="text-[#B3CFE5]/60 text-xs">16 Hari · Direct Flight</div>
                      </div>
                      <div className="font-bold text-[#4A7FA7]">{formatCurrency(pkg.harga)}</div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/paket"
                  className="mt-6 block text-center bg-[#4A7FA7] hover:bg-[#B3CFE5] hover:text-[#0A1931] text-white py-3 rounded-xl font-semibold text-sm transition-all"
                >
                  Lihat Detail Paket →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0A1931] relative overflow-hidden">
        <div className="absolute inset-0 arabic-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Wujudkan Impian Umroh Anda Bersama Kami
          </h2>
          <p className="text-[#B3CFE5] mb-8 text-lg">
            Segera daftarkan diri Anda dan dapatkan porsi keberangkatan terjamin dengan setoran awal hanya 4.000 USD.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/daftar"
              className="inline-flex items-center justify-center gap-2 bg-[#4A7FA7] hover:bg-[#B3CFE5] hover:text-[#0A1931] text-white px-10 py-4 rounded-xl font-bold text-base transition-all duration-300"
            >
              Daftar Sekarang
              <ChevronRight size={18} />
            </Link>
            <Link
              href="/kontak"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#4A7FA7] text-[#B3CFE5] hover:bg-[#4A7FA7] hover:text-white px-10 py-4 rounded-xl font-bold text-base transition-all duration-300"
            >
              Hubungi Kami
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-[#B3CFE5]/60 text-sm">
            <MapPin size={14} />
            Jl. Pondok No. 30, Paciran, Lamongan, Jawa Timur
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

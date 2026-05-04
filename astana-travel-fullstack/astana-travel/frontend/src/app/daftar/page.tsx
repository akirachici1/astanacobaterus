// src/app/daftar/page.tsx
'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PublicLayout from '@/components/layout/PublicLayout'
import toast from 'react-hot-toast'
import { User, FileText, MapPin, Phone, Package, CreditCard, ChevronRight, Loader2, Info } from 'lucide-react'
import Link from 'next/link'

interface Package {
  id: number
  tanggal: string
  hotel_mekkah: string
  hotel_madinah: string | null
  harga: number
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

function DaftarForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paketId = searchParams.get('paket')

  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

  const [form, setForm] = useState({
    nama: '',
    ktp: '',
    tanggal_lahir: '',
    alamat: '',
    whatsapp: '',
    package_id: paketId || '',
    payment_type: 'DP',
  })

  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then(d => {
        setPackages(d.data || [])
        if (paketId) {
          const pkg = d.data?.find((p: Package) => p.id === Number(paketId))
          if (pkg) setSelectedPackage(pkg)
        }
      })
  }, [paketId])

  useEffect(() => {
    if (form.package_id) {
      const pkg = packages.find(p => p.id === Number(form.package_id))
      setSelectedPackage(pkg || null)
    }
  }, [form.package_id, packages])

  const getPaymentInfo = () => {
    if (!selectedPackage) return null
    const total = selectedPackage.harga
    if (form.payment_type === 'DP') {
      const dp = Math.ceil(total * 0.5)
      return { bayarSekarang: dp, label: 'DP 50%', sisa: total - dp }
    }
    if (form.payment_type === 'CICILAN') {
      const dp = Math.ceil(total * 0.5)
      const sisa = total - dp
      const cicilan = Math.ceil(sisa / 3)
      return { bayarSekarang: dp, label: 'DP + 3x Cicilan', sisa, cicilan }
    }
    return { bayarSekarang: total, label: 'Lunas', sisa: 0 }
  }

  const payInfo = getPaymentInfo()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama || !form.ktp || !form.tanggal_lahir || !form.alamat || !form.whatsapp || !form.package_id) {
      toast.error('Semua field wajib diisi!')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      toast.success('Pendaftaran berhasil! Mengarahkan ke invoice...')
      router.push(`/invoice/${data.data.invoice.nomor_invoice}`)
    } catch (err: any) {
      toast.error(err.message || 'Pendaftaran gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
      {/* Left: Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Data Pribadi */}
        <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 p-6 shadow-sm">
          <h2 className="font-semibold text-[#0A1931] text-lg mb-5 flex items-center gap-2">
            <User size={18} className="text-[#4A7FA7]" /> Data Pribadi Jamaah
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap (sesuai KTP/Paspor) *</label>
              <input name="nama" value={form.nama} onChange={handleChange} className="input-field" placeholder="Nama sesuai dokumen resmi" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor KTP / Paspor *</label>
              <input name="ktp" value={form.ktp} onChange={handleChange} className="input-field" placeholder="16 digit KTP / Nomor Paspor" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Lahir *</label>
              <input type="date" name="tanggal_lahir" value={form.tanggal_lahir} onChange={handleChange} className="input-field" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap *</label>
              <textarea name="alamat" value={form.alamat} onChange={handleChange} rows={3} className="input-field resize-none" placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WhatsApp *</label>
              <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className="input-field" placeholder="08xxxxxxxxxx" required />
            </div>
          </div>
        </div>

        {/* Pilih Paket */}
        <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 p-6 shadow-sm">
          <h2 className="font-semibold text-[#0A1931] text-lg mb-5 flex items-center gap-2">
            <Package size={18} className="text-[#4A7FA7]" /> Pilih Paket
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Paket Keberangkatan *</label>
            <select name="package_id" value={form.package_id} onChange={handleChange} className="input-field" required>
              <option value="">-- Pilih Paket --</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {new Date(pkg.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} — {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.harga)}
                </option>
              ))}
            </select>
          </div>

          {selectedPackage && (
            <div className="mt-4 p-4 bg-[#F6FAFD] rounded-xl border border-[#B3CFE5]/40">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Hotel Mekkah:</span> <span className="font-medium text-[#0A1931]">{selectedPackage.hotel_mekkah}</span></div>
                <div><span className="text-gray-500">Hotel Madinah:</span> <span className="font-medium text-[#0A1931]">{selectedPackage.hotel_madinah || '-'}</span></div>
                <div><span className="text-gray-500">Total Harga:</span> <span className="font-bold text-[#4A7FA7]">{formatCurrency(selectedPackage.harga)}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Jenis Pembayaran */}
        <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 p-6 shadow-sm">
          <h2 className="font-semibold text-[#0A1931] text-lg mb-5 flex items-center gap-2">
            <CreditCard size={18} className="text-[#4A7FA7]" /> Jenis Pembayaran
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { value: 'DP', label: 'DP 50%', desc: 'Bayar 50% sekarang, sisa saat berangkat' },
              { value: 'CICILAN', label: 'Cicilan', desc: 'DP 50% + 3x cicilan' },
              { value: 'LUNAS', label: 'Lunas', desc: 'Bayar penuh sekarang' },
            ].map(opt => (
              <label key={opt.value} className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                form.payment_type === opt.value
                  ? 'border-[#4A7FA7] bg-[#4A7FA7]/10'
                  : 'border-[#B3CFE5]/40 hover:border-[#4A7FA7]/50'
              }`}>
                <input
                  type="radio"
                  name="payment_type"
                  value={opt.value}
                  checked={form.payment_type === opt.value}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className="font-semibold text-[#0A1931] text-sm">{opt.label}</div>
                <div className="text-gray-500 text-xs mt-1">{opt.desc}</div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Summary */}
      <div className="space-y-4">
        <div className="bg-[#0A1931] rounded-2xl p-6 text-white sticky top-24">
          <h3 className="font-display text-xl font-bold mb-6">Ringkasan Pendaftaran</h3>

          {selectedPackage ? (
            <>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#B3CFE5]">Paket</span>
                  <span className="font-medium">{new Date(selectedPackage.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#B3CFE5]">Total Harga</span>
                  <span className="font-medium">{formatCurrency(selectedPackage.harga)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#B3CFE5]">Metode</span>
                  <span className="font-medium">{payInfo?.label}</span>
                </div>
                <div className="border-t border-[#1A3D63] pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-[#B3CFE5]">Bayar Sekarang</span>
                    <span className="text-[#4A7FA7]">{payInfo ? formatCurrency(payInfo.bayarSekarang) : '-'}</span>
                  </div>
                </div>
                {payInfo?.sisa && payInfo.sisa > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B3CFE5]/70">Sisa Tagihan</span>
                    <span className="text-[#B3CFE5]">{formatCurrency(payInfo.sisa)}</span>
                  </div>
                ) : null}
                {payInfo?.cicilan ? (
                  <div className="text-xs text-[#B3CFE5]/60 mt-2">
                    3x cicilan @ {formatCurrency(payInfo.cicilan)}
                  </div>
                ) : null}
              </div>

              <div className="flex items-start gap-2 bg-[#4A7FA7]/20 rounded-lg p-3 mb-6 text-xs text-[#B3CFE5]">
                <Info size={12} className="mt-0.5 shrink-0" />
                <span>Setelah mendaftar, Anda akan mendapat invoice dan instruksi pembayaran.</span>
              </div>
            </>
          ) : (
            <div className="text-[#B3CFE5]/60 text-sm mb-6">
              Pilih paket dan metode pembayaran untuk melihat ringkasan.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedPackage}
            className="w-full flex items-center justify-center gap-2 bg-[#4A7FA7] hover:bg-[#B3CFE5] hover:text-[#0A1931] text-white py-4 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#B3CFE5]/30 p-4 text-sm text-gray-600">
          <p className="font-medium text-[#0A1931] mb-2">Butuh bantuan?</p>
          <a href="https://wa.me/6281235270809" target="_blank" className="text-green-600 hover:underline font-medium">
            Hubungi kami via WhatsApp →
          </a>
        </div>
      </div>
    </form>
  )
}

export default function DaftarPage() {
  return (
    <PublicLayout>
      <section className="bg-[#0A1931] py-16 relative overflow-hidden">
        <div className="absolute inset-0 arabic-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h1 className="font-display text-4xl font-bold text-white mb-3">Form Pendaftaran Umroh</h1>
          <p className="text-[#B3CFE5]">Lengkapi data diri Anda untuk mendapatkan porsi keberangkatan</p>
        </div>
      </section>

      <section className="py-12 bg-[#F6FAFD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="text-center py-10">Memuat formulir...</div>}>
            <DaftarForm />
          </Suspense>
        </div>
      </section>
    </PublicLayout>
  )
}

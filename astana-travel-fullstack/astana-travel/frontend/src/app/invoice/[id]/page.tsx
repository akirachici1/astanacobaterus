// src/app/invoice/[id]/page.tsx
'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import PublicLayout from '@/components/layout/PublicLayout'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Download, Printer, MessageCircle, Upload, CheckCircle, Clock, Loader2, X } from 'lucide-react'

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

export default function InvoicePage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPayModal, setShowPayModal] = useState(false)
  const [settings, setSettings] = useState<any>({})
  const [uploading, setUploading] = useState(false)
  const [bukti, setBukti] = useState<File | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/invoice/${id}`).then(r => r.json()),
      fetch('/api/settings').then(r => r.json()).catch(() => ({ data: {} })),
    ]).then(([inv, sett]) => {
      setInvoice(inv.data)
      setSettings(sett.data || {})
    }).finally(() => setLoading(false))
  }, [id])

  const handlePrint = () => window.print()

  const handleDownloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default
      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.setTextColor(10, 25, 49)
      doc.text('ASTANA HAJJ & UMROH TRAVEL', 20, 20)
      doc.setFontSize(11)
      doc.setTextColor(74, 127, 167)
      doc.text('Perjalanan Satu Anda, Komitmen Kami', 20, 28)
      doc.setTextColor(100, 100, 100)
      doc.text('Jl. Pondok No. 30, Paciran, Lamongan, Jawa Timur', 20, 35)

      doc.setFontSize(14)
      doc.setTextColor(10, 25, 49)
      doc.text('INVOICE', 20, 50)
      doc.setFontSize(10)
      doc.text(`No: ${invoice.nomor_invoice}`, 20, 57)
      doc.text(`Tanggal: ${formatDate(invoice.createdAt)}`, 20, 63)

      doc.setFontSize(12)
      doc.text('Data Jamaah:', 20, 78)
      doc.setFontSize(10)
      doc.text(`Nama: ${invoice.registration.user.nama}`, 20, 85)
      doc.text(`KTP/Paspor: ${invoice.registration.user.ktp}`, 20, 91)
      doc.text(`WhatsApp: ${invoice.registration.user.whatsapp}`, 20, 97)
      doc.text(`Alamat: ${invoice.registration.user.alamat}`, 20, 103)

      const pkg = invoice.registration.package
      doc.setFontSize(12)
      doc.text('Detail Paket:', 20, 118)
      autoTable(doc, {
        startY: 122,
        head: [['Paket', 'Hotel Mekkah', 'Hotel Madinah', 'Durasi', 'Harga']],
        body: [[
          formatDate(pkg.tanggal),
          pkg.hotel_mekkah,
          pkg.hotel_madinah || '-',
          `${pkg.durasi} Hari`,
          formatCurrency(pkg.harga),
        ]],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [10, 25, 49] },
      })

      const finalY = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(12)
      doc.text('Rincian Pembayaran:', 20, finalY)
      doc.setFontSize(10)
      doc.text(`Metode: ${invoice.registration.payment_type}`, 20, finalY + 7)
      doc.text(`Total: ${formatCurrency(invoice.registration.total)}`, 20, finalY + 14)

      const totalBayar = invoice.registration.payments
        .filter((p: any) => p.status === 'VERIFIED')
        .reduce((s: number, p: any) => s + p.jumlah, 0)
      doc.text(`Total Dibayar: ${formatCurrency(totalBayar)}`, 20, finalY + 21)
      doc.text(`Sisa: ${formatCurrency(invoice.registration.total - totalBayar)}`, 20, finalY + 28)

      doc.save(`Invoice_${invoice.nomor_invoice}.pdf`)
      toast.success('PDF berhasil diunduh')
    } catch (e) {
      toast.error('Gagal membuat PDF')
    }
  }

  const handleSendWA = () => {
    const reg = invoice.registration
    const msg = `Assalamu'alaikum, saya ingin konfirmasi pembayaran umroh.\n\nNo. Invoice: ${invoice.nomor_invoice}\nNama: ${reg.user.nama}\nPaket: ${formatDate(reg.package.tanggal)}\nTotal: ${formatCurrency(reg.total)}\n\nMohon konfirmasi pembayaran kami. Terima kasih.`
    window.open(`https://wa.me/6281235270809?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleUploadBukti = async () => {
    if (!bukti) { toast.error('Pilih file bukti transfer'); return }
    setUploading(true)
    try {
      const reg = invoice.registration
      const totalBayar = reg.payments.filter((p: any) => p.status === 'VERIFIED').reduce((s: number, p: any) => s + p.jumlah, 0)
      let jumlah = 0
      let cicilan_ke = null
      if (reg.payment_type === 'LUNAS') {
        jumlah = reg.total
      } else {
        jumlah = Math.ceil(reg.total * 0.5)
        if (totalBayar >= jumlah) {
          const sisa = reg.total - jumlah
          cicilan_ke = totalBayar >= jumlah + Math.ceil(sisa / 3) ? (totalBayar >= jumlah + Math.ceil(sisa / 3) * 2 ? 3 : 2) : 1
          jumlah = Math.ceil(sisa / 3)
        }
      }

      const fd = new FormData()
      fd.append('registration_id', String(reg.id))
      fd.append('jumlah', String(jumlah))
      if (cicilan_ke) fd.append('cicilan_ke', String(cicilan_ke))
      fd.append('bukti_transfer', bukti)

      const res = await fetch('/api/payments', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      toast.success('Bukti transfer berhasil dikirim! Menunggu verifikasi admin.')
      setShowPayModal(false)
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message || 'Gagal upload bukti')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#4A7FA7]" />
        </div>
      </PublicLayout>
    )
  }

  if (!invoice) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          <p className="text-gray-600">Invoice tidak ditemukan</p>
          <Link href="/" className="btn-primary">Kembali ke Beranda</Link>
        </div>
      </PublicLayout>
    )
  }

  const reg = invoice.registration
  const pkg = reg.package
  const user = reg.user
  const totalBayar = reg.payments.filter((p: any) => p.status === 'VERIFIED').reduce((s: number, p: any) => s + p.jumlah, 0)
  const sisa = reg.total - totalBayar
  const status = STATUS_MAP[reg.status] || { label: reg.status, color: 'bg-gray-100 text-gray-800' }

  return (
    <PublicLayout>
      {/* Actions bar */}
      <div className="bg-white border-b border-[#B3CFE5]/30 py-4 print:hidden">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap gap-3 items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Invoice</div>
            <div className="font-bold text-[#0A1931]">{invoice.nomor_invoice}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Printer size={14} /> Print
            </button>
            <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 bg-[#0A1931] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1A3D63] transition-colors">
              <Download size={14} /> Download PDF
            </button>
            <button onClick={handleSendWA} className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
              <MessageCircle size={14} /> Kirim WA
            </button>
            {sisa > 0 && (
              <button onClick={() => setShowPayModal(true)} className="flex items-center gap-1.5 bg-[#4A7FA7] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1A3D63] transition-colors">
                <Upload size={14} /> Upload Bukti Bayar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="py-10 bg-[#F6FAFD] print:bg-white print:py-0">
        <div ref={printRef} className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-[#B3CFE5]/30 overflow-hidden print:shadow-none print:border-0">
            {/* Invoice Header */}
            <div className="bg-[#0A1931] p-8 text-white">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold">ASTANA HAJJ & UMROH TRAVEL</h1>
                  <p className="text-[#B3CFE5] text-sm mt-1">Perjalanan Satu Anda, Komitmen Kami</p>
                  <p className="text-[#B3CFE5]/70 text-xs mt-2">Jl. Pondok No. 30, Paciran, Lamongan, Jawa Timur</p>
                  <p className="text-[#B3CFE5]/70 text-xs">WA: 0812-352-70809 | astanatourpaciran@gmail.com</p>
                </div>
                <div className="text-right">
                  <div className="text-[#B3CFE5]/70 text-xs">No. Invoice</div>
                  <div className="font-bold text-lg text-[#4A7FA7]">{invoice.nomor_invoice}</div>
                  <div className="text-[#B3CFE5]/70 text-xs mt-2">Tanggal</div>
                  <div className="text-sm">{formatDate(invoice.createdAt)}</div>
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Jamaah Data */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-[#0A1931] text-sm uppercase tracking-wide mb-3 border-b border-[#B3CFE5]/30 pb-2">Data Jamaah</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Nama</dt><dd className="font-medium text-[#0A1931]">{user.nama}</dd></div>
                    <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">KTP/Paspor</dt><dd className="font-medium text-[#0A1931]">{user.ktp}</dd></div>
                    <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Tgl Lahir</dt><dd className="font-medium text-[#0A1931]">{formatDate(user.tanggal_lahir)}</dd></div>
                    <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">WhatsApp</dt><dd className="font-medium text-[#0A1931]">{user.whatsapp}</dd></div>
                    <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Alamat</dt><dd className="font-medium text-[#0A1931]">{user.alamat}</dd></div>
                  </dl>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0A1931] text-sm uppercase tracking-wide mb-3 border-b border-[#B3CFE5]/30 pb-2">Detail Paket</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex gap-2"><dt className="text-gray-500 w-28 shrink-0">Keberangkatan</dt><dd className="font-medium text-[#0A1931]">{formatDate(pkg.tanggal)}</dd></div>
                    <div className="flex gap-2"><dt className="text-gray-500 w-28 shrink-0">Hotel Mekkah</dt><dd className="font-medium text-[#0A1931]">{pkg.hotel_mekkah}</dd></div>
                    <div className="flex gap-2"><dt className="text-gray-500 w-28 shrink-0">Hotel Madinah</dt><dd className="font-medium text-[#0A1931]">{pkg.hotel_madinah || '-'}</dd></div>
                    <div className="flex gap-2"><dt className="text-gray-500 w-28 shrink-0">Durasi</dt><dd className="font-medium text-[#0A1931]">{pkg.durasi} Hari</dd></div>
                    <div className="flex gap-2"><dt className="text-gray-500 w-28 shrink-0">Maskapai</dt><dd className="font-medium text-[#0A1931]">{pkg.maskapai}</dd></div>
                  </dl>
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold text-[#0A1931] text-sm uppercase tracking-wide mb-3 border-b border-[#B3CFE5]/30 pb-2">Rincian Pembayaran</h3>
                <div className="bg-[#F6FAFD] rounded-xl p-5">
                  <div className="flex justify-between py-2 text-sm border-b border-[#B3CFE5]/20">
                    <span className="text-gray-600">Total Harga Paket</span>
                    <span className="font-semibold">{formatCurrency(reg.total)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm border-b border-[#B3CFE5]/20">
                    <span className="text-gray-600">Metode Pembayaran</span>
                    <span className="font-semibold">{reg.payment_type}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm border-b border-[#B3CFE5]/20">
                    <span className="text-gray-600">Total Dibayar</span>
                    <span className="font-semibold text-green-600">{formatCurrency(totalBayar)}</span>
                  </div>
                  <div className="flex justify-between py-3 text-base font-bold">
                    <span className="text-[#0A1931]">Sisa Tagihan</span>
                    <span className={sisa > 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(sisa)}</span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {reg.payments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#0A1931] text-sm uppercase tracking-wide mb-3 border-b border-[#B3CFE5]/30 pb-2">Riwayat Pembayaran</h3>
                  <div className="space-y-2">
                    {reg.payments.map((pay: any) => (
                      <div key={pay.id} className="flex items-center justify-between p-3 bg-[#F6FAFD] rounded-lg text-sm">
                        <div className="flex items-center gap-3">
                          {pay.status === 'VERIFIED'
                            ? <CheckCircle size={16} className="text-green-500" />
                            : <Clock size={16} className="text-yellow-500" />
                          }
                          <div>
                            <div className="font-medium">{formatCurrency(pay.jumlah)}</div>
                            <div className="text-gray-400 text-xs">{formatDate(pay.tanggal)}{pay.cicilan_ke ? ` · Cicilan ke-${pay.cicilan_ke}` : ''}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
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

              {/* QRIS / Payment Info */}
              {sisa > 0 && (
                <div className="border border-[#4A7FA7]/20 rounded-xl p-5 bg-[#F6FAFD]">
                  <h3 className="font-semibold text-[#0A1931] mb-3">Informasi Pembayaran</h3>
                  <p className="text-sm text-gray-600 mb-3">Transfer ke rekening berikut:</p>
                  <div className="text-sm space-y-1">
                    <div><span className="text-gray-500">Bank:</span> <span className="font-medium">{settings.bank_name || 'Bank Syariah Indonesia'}</span></div>
                    <div><span className="text-gray-500">No. Rekening:</span> <span className="font-bold text-[#0A1931]">{settings.bank_account || '7123456789'}</span></div>
                    <div><span className="text-gray-500">Atas Nama:</span> <span className="font-medium">{settings.bank_holder || 'ASTANA HAJJ & UMROH TRAVEL'}</span></div>
                  </div>
                  {settings.qris_image && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Atau scan QRIS:</p>
                      <img src={settings.qris_image} alt="QRIS" className="w-40 h-40 object-contain border rounded-lg" />
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-3">Mohon cantumkan nomor invoice pada keterangan transfer: <strong>{invoice.nomor_invoice}</strong></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Upload Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-[#0A1931]">Upload Bukti Pembayaran</h3>
              <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[#F6FAFD] rounded-xl p-4 text-sm">
                <div className="font-medium text-[#0A1931] mb-1">Jumlah yang harus dibayar</div>
                <div className="text-2xl font-bold text-[#4A7FA7]">{formatCurrency(Math.min(sisa, Math.ceil(reg.total * 0.5)))}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Bukti Transfer</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => setBukti(e.target.files?.[0] || null)}
                  className="w-full border border-[#B3CFE5] rounded-lg px-3 py-2 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, PDF. Maks 5MB</p>
              </div>
              <button
                onClick={handleUploadBukti}
                disabled={uploading || !bukti}
                className="w-full flex items-center justify-center gap-2 bg-[#4A7FA7] text-white py-3 rounded-xl font-semibold hover:bg-[#1A3D63] transition-all disabled:opacity-50"
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

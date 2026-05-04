// src/app/admin/pengaturan/page.tsx
'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Upload, Plus, Edit2, Loader2, Package, Settings, Phone, QrCode } from 'lucide-react'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

interface Package {
  id: number
  tanggal: string
  hotel_mekkah: string
  hotel_madinah: string | null
  harga: number
  durasi: number
  maskapai: string
  aktif: boolean
}

export default function PengaturanPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [qrisFile, setQrisFile] = useState<File | null>(null)
  const [qrisPreview, setQrisPreview] = useState<string>('')
  const [editPkg, setEditPkg] = useState<Package | null>(null)
  const [showAddPkg, setShowAddPkg] = useState(false)
  const [newPkg, setNewPkg] = useState({ tanggal: '', hotel_mekkah: '', hotel_madinah: '', harga: '', durasi: '16', maskapai: 'Lion Air Premium (Direct)' })

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/packages').then(r => r.json()),
    ]).then(([s, p]) => {
      setSettings(s.data || {})
      setQrisPreview(s.data?.qris_image || '')
      setPackages(p.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(settings).forEach(([k, v]) => {
        if (k !== 'qris_image') fd.append(k, v)
      })
      if (qrisFile) fd.append('qris_image', qrisFile)

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      toast.success('Pengaturan berhasil disimpan!')
    } catch (e: any) {
      toast.error(e.message || 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleQrisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setQrisFile(file)
    const reader = new FileReader()
    reader.onload = () => setQrisPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleUpdatePkg = async () => {
    if (!editPkg) return
    try {
      const res = await fetch(`/api/admin/packages/${editPkg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          hotel_mekkah: editPkg.hotel_mekkah,
          hotel_madinah: editPkg.hotel_madinah,
          harga: Number(editPkg.harga),
          durasi: Number(editPkg.durasi),
          maskapai: editPkg.maskapai,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      toast.success('Paket berhasil diperbarui!')
      setEditPkg(null)
      const p = await fetch('/api/packages').then(r => r.json())
      setPackages(p.data || [])
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleAddPkg = async () => {
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tanggal: new Date(newPkg.tanggal),
          hotel_mekkah: newPkg.hotel_mekkah,
          hotel_madinah: newPkg.hotel_madinah || null,
          harga: Number(newPkg.harga),
          durasi: Number(newPkg.durasi),
          maskapai: newPkg.maskapai,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      toast.success('Paket baru berhasil ditambahkan!')
      setShowAddPkg(false)
      setNewPkg({ tanggal: '', hotel_mekkah: '', hotel_madinah: '', harga: '', durasi: '16', maskapai: 'Lion Air Premium (Direct)' })
      const p = await fetch('/api/packages').then(r => r.json())
      setPackages(p.data || [])
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleDeletePkg = async (id: number) => {
    if (!confirm('Nonaktifkan paket ini?')) return
    try {
      await fetch(`/api/admin/packages/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      toast.success('Paket dinonaktifkan')
      const p = await fetch('/api/packages').then(r => r.json())
      setPackages(p.data || [])
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-[#4A7FA7]" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1931]">Pengaturan</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola informasi kontak, QRIS, dan paket umroh</p>
      </div>

      {/* Kontak & Bank Settings */}
      <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 shadow-sm p-6">
        <h2 className="font-semibold text-[#0A1931] mb-5 flex items-center gap-2">
          <Settings size={18} className="text-[#4A7FA7]" /> Pengaturan Umum
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            { key: 'bank_name', label: 'Nama Bank', placeholder: 'Bank Syariah Indonesia' },
            { key: 'bank_account', label: 'No. Rekening', placeholder: '7123456789' },
            { key: 'bank_holder', label: 'Atas Nama', placeholder: 'ASTANA HAJJ & UMROH TRAVEL' },
            { key: 'whatsapp', label: 'Nomor WhatsApp', placeholder: '081235270809' },
            { key: 'email', label: 'Email', placeholder: 'astanatourpaciran@gmail.com' },
            { key: 'alamat', label: 'Alamat', placeholder: 'Jl. Pondok No. 30...' },
          ].map(field => (
            <div key={field.key} className={field.key === 'alamat' ? 'sm:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
              <input
                value={settings[field.key] || ''}
                onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                className="input-field"
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* QRIS */}
      <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 shadow-sm p-6">
        <h2 className="font-semibold text-[#0A1931] mb-5 flex items-center gap-2">
          <QrCode size={18} className="text-[#4A7FA7]" /> Upload QRIS
        </h2>
        <div className="flex flex-wrap gap-6 items-start">
          {qrisPreview && (
            <div className="border border-[#B3CFE5]/40 rounded-xl p-3 bg-[#F6FAFD]">
              <img src={qrisPreview} alt="QRIS Preview" className="w-40 h-40 object-contain" />
              <p className="text-xs text-gray-400 text-center mt-2">QRIS Saat Ini</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload QRIS Baru</label>
            <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-[#4A7FA7]/30 hover:border-[#4A7FA7] text-[#4A7FA7] px-5 py-3 rounded-xl text-sm font-medium transition-colors">
              <Upload size={16} />
              Pilih File Gambar
              <input type="file" accept="image/*" onChange={handleQrisChange} className="hidden" />
            </label>
            {qrisFile && <p className="text-xs text-gray-500 mt-2">✓ {qrisFile.name}</p>}
            <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG. Rekomendasi: 400×400px</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 bg-[#0A1931] hover:bg-[#4A7FA7] text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>

      {/* Package Management */}
      <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#B3CFE5]/20 flex items-center justify-between">
          <h2 className="font-semibold text-[#0A1931] flex items-center gap-2">
            <Package size={18} className="text-[#4A7FA7]" /> Manajemen Paket
          </h2>
          <button
            onClick={() => setShowAddPkg(!showAddPkg)}
            className="flex items-center gap-1.5 bg-[#0A1931] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#4A7FA7] transition-colors"
          >
            <Plus size={14} /> Tambah Paket
          </button>
        </div>

        {/* Add Package Form */}
        {showAddPkg && (
          <div className="p-6 bg-[#F6FAFD] border-b border-[#B3CFE5]/20">
            <h3 className="font-medium text-[#0A1931] mb-4 text-sm">Form Paket Baru</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'tanggal', label: 'Tanggal Keberangkatan', type: 'date' },
                { key: 'hotel_mekkah', label: 'Hotel Mekkah', type: 'text', placeholder: 'Nama Hotel' },
                { key: 'hotel_madinah', label: 'Hotel Madinah', type: 'text', placeholder: 'Nama Hotel' },
                { key: 'harga', label: 'Harga (Rp)', type: 'number', placeholder: '28500000' },
                { key: 'durasi', label: 'Durasi (Hari)', type: 'number', placeholder: '16' },
                { key: 'maskapai', label: 'Maskapai', type: 'text', placeholder: 'Lion Air Premium' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(newPkg as any)[f.key]}
                    onChange={e => setNewPkg(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={(f as any).placeholder}
                    className="input-field text-sm py-2.5"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAddPkg} className="flex items-center gap-2 bg-[#4A7FA7] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#1A3D63]">
                <Plus size={14} /> Tambahkan
              </button>
              <button onClick={() => setShowAddPkg(false)} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                Batal
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F6FAFD]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Keberangkatan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hotel Mekkah</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hotel Madinah</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Harga</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Durasi</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B3CFE5]/20">
              {packages.map(pkg => (
                editPkg?.id === pkg.id ? (
                  <tr key={pkg.id} className="bg-blue-50/40">
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {new Date(pkg.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <input
                        value={editPkg.hotel_mekkah}
                        onChange={e => setEditPkg(p => p ? { ...p, hotel_mekkah: e.target.value } : null)}
                        className="border border-[#B3CFE5] rounded-lg px-2 py-1 text-sm w-full"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        value={editPkg.hotel_madinah || ''}
                        onChange={e => setEditPkg(p => p ? { ...p, hotel_madinah: e.target.value } : null)}
                        className="border border-[#B3CFE5] rounded-lg px-2 py-1 text-sm w-full"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        value={editPkg.harga}
                        onChange={e => setEditPkg(p => p ? { ...p, harga: Number(e.target.value) } : null)}
                        className="border border-[#B3CFE5] rounded-lg px-2 py-1 text-sm w-32"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        value={editPkg.durasi}
                        onChange={e => setEditPkg(p => p ? { ...p, durasi: Number(e.target.value) } : null)}
                        className="border border-[#B3CFE5] rounded-lg px-2 py-1 text-sm w-16"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={handleUpdatePkg} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-700">
                          Simpan
                        </button>
                        <button onClick={() => setEditPkg(null)} className="border border-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs hover:bg-gray-50">
                          Batal
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={pkg.id} className="hover:bg-[#F6FAFD] transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-[#0A1931]">
                      {new Date(pkg.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{pkg.hotel_mekkah}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{pkg.hotel_madinah || '-'}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-[#0A1931]">{formatCurrency(pkg.harga)}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{pkg.durasi} hari</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditPkg(pkg)}
                          className="flex items-center gap-1 bg-[#4A7FA7]/10 text-[#4A7FA7] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#4A7FA7]/20"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeletePkg(pkg.id)}
                          className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100"
                        >
                          Nonaktifkan
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// src/app/kontak/page.tsx
import PublicLayout from '@/components/layout/PublicLayout'
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'

export default function KontakPage() {
  return (
    <PublicLayout>
      <section className="bg-[#0A1931] py-20 relative overflow-hidden">
        <div className="absolute inset-0 arabic-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h1 className="font-display text-4xl font-bold text-white mb-3">Hubungi Kami</h1>
          <p className="text-[#B3CFE5]">Kami siap membantu Anda merencanakan perjalanan ibadah yang berkesan</p>
        </div>
      </section>

      <section className="py-16 bg-[#F6FAFD]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#0A1931] mb-6">Informasi Kontak</h2>
              </div>

              {[
                {
                  icon: MapPin,
                  title: 'Alamat Kantor',
                  content: 'Jl. Pondok No. 30, Paciran, Lamongan, Jawa Timur',
                  sub: 'Kunjungi kami pada jam operasional',
                },
                {
                  icon: Phone,
                  title: 'WhatsApp',
                  content: '0812-352-70809',
                  sub: 'Hubungi untuk konsultasi gratis',
                  href: 'https://wa.me/6281235270809',
                },
                {
                  icon: Mail,
                  title: 'Email',
                  content: 'astanatourpaciran@gmail.com',
                  sub: 'Kirim pertanyaan melalui email',
                  href: 'mailto:astanatourpaciran@gmail.com',
                },
                {
                  icon: Clock,
                  title: 'Jam Operasional',
                  content: 'Senin – Sabtu: 08.00 – 17.00 WIB',
                  sub: 'Ahad & hari libur nasional: tutup',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-white rounded-2xl p-5 shadow-sm border border-[#B3CFE5]/30">
                  <div className="w-10 h-10 bg-[#0A1931] rounded-xl flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-[#4A7FA7]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#0A1931] text-sm">{item.title}</div>
                    {item.href ? (
                      <a href={item.href} target="_blank" className="text-[#4A7FA7] hover:underline font-medium mt-0.5 block">
                        {item.content}
                      </a>
                    ) : (
                      <div className="text-gray-700 mt-0.5">{item.content}</div>
                    )}
                    <div className="text-gray-400 text-xs mt-0.5">{item.sub}</div>
                  </div>
                </div>
              ))}

              <a
                href="https://wa.me/6281235270809"
                target="_blank"
                className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-base transition-all w-full"
              >
                <MessageCircle size={20} />
                Chat WhatsApp Sekarang
              </a>
            </div>

            {/* Map + Additional Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#B3CFE5]/30 shadow-sm overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.5!2d112.40!3d-6.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTMnMDAuMCJTIDExMsKwMjQnMDAuMCJF!5e0!3m2!1sid!2sid!4v1234567890"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-600">Jl. Pondok No. 30, Paciran, Lamongan, Jawa Timur</p>
                </div>
              </div>

              <div className="bg-[#0A1931] rounded-2xl p-6 text-white">
                <h3 className="font-display text-xl font-bold mb-4">Konsultasi Umroh Gratis</h3>
                <p className="text-[#B3CFE5] text-sm mb-5 leading-relaxed">
                  Ingin tahu lebih lanjut tentang paket umroh kami? Tim kami siap membantu Anda memilih paket terbaik sesuai kebutuhan dan budget Anda.
                </p>
                <ul className="space-y-2 text-sm text-[#B3CFE5]">
                  {[
                    'Konsultasi gratis tanpa syarat',
                    'Informasi lengkap paket & harga',
                    'Panduan dokumen & persyaratan',
                    'Estimasi biaya & jadwal',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-[#4A7FA7]">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

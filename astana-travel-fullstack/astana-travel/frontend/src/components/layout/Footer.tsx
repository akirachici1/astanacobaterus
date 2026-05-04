// src/components/layout/Footer.tsx
import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0A1931] text-white">
      <div className="arabic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4A7FA7] to-[#B3CFE5] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <div>
                  <div className="font-display font-bold text-xl">ASTANA</div>
                  <div className="text-[#B3CFE5] text-sm">Hajj & Umroh Travel</div>
                </div>
              </div>
              <p className="text-[#B3CFE5] text-sm leading-relaxed mb-4 max-w-sm">
                Memberikan perjalanan ibadah yang aman, terjamin, berkualitas, dan nyaman sesuai tuntunan Sunnah.
              </p>
              <div className="flex items-start gap-2 text-[#B3CFE5] text-sm">
                <MapPin size={16} className="mt-0.5 text-[#4A7FA7] shrink-0" />
                <span>Jl. Pondok No. 30, Paciran, Lamongan, Jawa Timur</span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Navigasi</h4>
              <ul className="space-y-2">
                {[
                  { href: '/', label: 'Beranda' },
                  { href: '/paket', label: 'Paket Umroh' },
                  { href: '/daftar', label: 'Pendaftaran' },
                  { href: '/tracking', label: 'Cek Status Jamaah' },
                  { href: '/kontak', label: 'Hubungi Kami' },
                ].map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[#B3CFE5] hover:text-white text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4">Kontak</h4>
              <div className="space-y-3">
                <a
                  href="https://wa.me/6281235270809"
                  className="flex items-center gap-2 text-[#B3CFE5] hover:text-white text-sm transition-colors"
                >
                  <Phone size={14} className="text-[#4A7FA7]" />
                  0812-352-70809
                </a>
                <a
                  href="mailto:astanatourpaciran@gmail.com"
                  className="flex items-center gap-2 text-[#B3CFE5] hover:text-white text-sm transition-colors"
                >
                  <Mail size={14} className="text-[#4A7FA7]" />
                  astanatourpaciran@gmail.com
                </a>
              </div>
              <div className="mt-6">
                <p className="text-[#B3CFE5] text-xs mb-2">Legalitas:</p>
                <div className="space-y-1">
                  <div className="text-xs text-[#4A7FA7] font-medium">✓ Kuota Resmi KEMENHAJ RI</div>
                  <div className="text-xs text-[#4A7FA7] font-medium">✓ Setoran Awal 4.000 USD</div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1A3D63] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#B3CFE5] text-xs">
              © {new Date().getFullYear()} ASTANA HAJJ & UMROH TRAVEL. All rights reserved.
            </p>
            <p className="text-[#4A7FA7] text-xs font-display italic">
              "Perjalanan Satu Anda, Komitmen Kami"
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

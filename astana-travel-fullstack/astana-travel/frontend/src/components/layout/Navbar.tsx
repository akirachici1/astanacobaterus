'use client'
// src/components/layout/Navbar.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/paket', label: 'Paket Umroh' },
  { href: '/tracking', label: 'Cek Status' },
  { href: '/kontak', label: 'Kontak' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0A1931] shadow-xl' : 'bg-[#0A1931]/90 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4A7FA7] to-[#B3CFE5] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <div className="text-white font-display font-bold text-base leading-tight">ASTANA</div>
              <div className="text-[#B3CFE5] text-xs leading-tight">Hajj & Umroh Travel</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#B3CFE5] hover:text-white text-sm font-medium transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4A7FA7] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="https://wa.me/6281235270809"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              <Phone size={14} />
              Hubungi Kami
            </a>
            <Link
              href="/daftar"
              className="bg-[#4A7FA7] hover:bg-[#1A3D63] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg"
            >
              Daftar Sekarang
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-white p-2"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#0A1931] border-t border-[#1A3D63] px-4 py-4 space-y-3">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-[#B3CFE5] hover:text-white py-2 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <a
              href="https://wa.me/6281235270809"
              target="_blank"
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold"
            >
              <Phone size={14} /> Hubungi Kami
            </a>
            <Link
              href="/daftar"
              onClick={() => setOpen(false)}
              className="text-center bg-[#4A7FA7] text-white px-4 py-2.5 rounded-lg text-sm font-semibold"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

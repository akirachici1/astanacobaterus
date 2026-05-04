// prisma/seed.ts
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Seed Admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.admin.upsert({
    where: { email: 'admin@astana.com' },
    update: {},
    create: {
      email: 'admin@astana.com',
      password: hashedPassword,
      nama: 'Administrator',
    },
  })

  // Seed Packages
  const packages = [
    {
      tanggal: new Date('2026-07-01'),
      hotel_mekkah: 'Snoed / Srtf *3',
      hotel_madinah: 'Nada Salam / Srtf *3',
      harga: 28500000,
    },
    {
      tanggal: new Date('2026-07-15'),
      hotel_mekkah: 'Daefa / Rehab',
      hotel_madinah: 'Nada Salam / Taqwa',
      harga: 29500000,
    },
    {
      tanggal: new Date('2026-08-01'),
      hotel_mekkah: 'Daefa / Rehab',
      hotel_madinah: 'Nada Salam / Taqwa',
      harga: 31500000,
    },
    {
      tanggal: new Date('2026-09-05'),
      hotel_mekkah: 'Daefa / Rehab',
      hotel_madinah: 'Nada Salam / Taqwa',
      harga: 34500000,
    },
  ]

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { id: packages.indexOf(pkg) + 1 },
      update: {},
      create: pkg,
    })
  }

  // Seed Settings
  const settings = [
    { key: 'qris_image', value: '/qris-placeholder.png' },
    { key: 'bank_name', value: 'Bank Syariah Indonesia' },
    { key: 'bank_account', value: '7123456789' },
    { key: 'bank_holder', value: 'ASTANA HAJJ & UMROH TRAVEL' },
    { key: 'whatsapp', value: '081235270809' },
    { key: 'email', value: 'astanatourpaciran@gmail.com' },
    { key: 'alamat', value: 'Jl. Pondok No. 30, Paciran, Lamongan, Jawa Timur' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

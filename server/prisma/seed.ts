// ============================================================
// 🌱 seed.ts — Đổ dữ liệu mẫu thực tế cho Nexus Auto Showroom
// ============================================================

import { PrismaClient } from '../src/generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu dọn dẹp và đổ dữ liệu mẫu thực tế...');

  // 1. Dọn dẹp dữ liệu cũ theo đúng thứ tự ràng buộc khóa ngoại
  await prisma.customerInteraction.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.financeApplication.deleteMany();
  await prisma.testDrive.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.vehicleImage.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Đã dọn sạch dữ liệu cũ.');

  // ── 2. Tài khoản & Phân quyền ──────────────────────────────
  const pw = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@nexusauto.vn',
      passwordHash: pw,
      fullName: 'Nguyễn Quản Trị',
      phone: '0988888888',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const sales1 = await prisma.user.create({
    data: {
      email: 'sales1@nexusauto.vn',
      passwordHash: pw,
      fullName: 'Trần Văn Sales',
      phone: '0912345678',
      role: 'SALES',
      isActive: true,
    },
  });

  const sales2 = await prisma.user.create({
    data: {
      email: 'sales2@nexusauto.vn',
      passwordHash: pw,
      fullName: 'Lê Thị Thuỳ Dung',
      phone: '0934567890',
      role: 'SALES',
      isActive: true,
    },
  });

  console.log('✅ 3 tài khoản: Admin + 2 Sales (password: 123456)');

  // ── 3. Hãng xe (Brands) ────────────────────────────────────
  const [ford, toyota, mercedes, vinfast, porsche, audi] = await Promise.all([
    prisma.brand.create({ data: { name: 'Ford', country: 'Mỹ', logoUrl: '/images/brands/ford.png' } }),
    prisma.brand.create({ data: { name: 'Toyota', country: 'Nhật Bản', logoUrl: '/images/brands/toyota.png' } }),
    prisma.brand.create({ data: { name: 'Mercedes-Benz', country: 'Đức', logoUrl: '/images/brands/mercedes.png' } }),
    prisma.brand.create({ data: { name: 'VinFast', country: 'Việt Nam', logoUrl: '/images/brands/vinfast.png' } }),
    prisma.brand.create({ data: { name: 'Porsche', country: 'Đức', logoUrl: '/images/brands/porsche.png' } }),
    prisma.brand.create({ data: { name: 'Audi', country: 'Đức', logoUrl: '/images/brands/audi.png' } }),
  ]);
  console.log('✅ 6 hãng xe');

  // ── 4. Phân khúc (Categories) ──────────────────────────────
  const [catSUV, catSedan, catCoupe, catEV, catMPV] = await Promise.all([
    prisma.category.create({ data: { name: 'SUV / Crossover', description: 'Gầm cao đa dụng, mạnh mẽ cho gia đình và địa hình' } }),
    prisma.category.create({ data: { name: 'Sedan', description: 'Lịch lãm, sang trọng, êm ái cho đô thị và doanh nhân' } }),
    prisma.category.create({ data: { name: 'Coupe / Thể thao', description: 'Hiệu suất cao, kiểu dáng khí động học đột phá' } }),
    prisma.category.create({ data: { name: 'Xe điện (EV)', description: 'Công nghệ tương lai, không phát thải, tăng tốc tức thì' } }),
    prisma.category.create({ data: { name: 'MPV', description: 'Đa dụng 7 chỗ rộng rãi tối ưu cho gia đình lớn' } }),
  ]);
  console.log('✅ 5 phân khúc xe');

  // ── 5. Xe mẫu (8 Vehicles) ─────────────────────────────────
  const vehicles = await Promise.all([
    // 1. Ford Everest
    prisma.vehicle.create({
      data: {
        vin: '1FA6P8CF9H5100001', brandId: ford.id, categoryId: catSUV.id,
        model: 'Everest', trim: 'Titanium+ 2.0L Bi-Turbo 4x4', year: 2024,
        condition: 'NEW', price: 1499000000, costPrice: 1380000000,
        fuelType: 'DIESEL', transmission: 'AUTOMATIC', drivetrain: 'FOUR_WD',
        color: 'Đen Ánh Kim', interiorColor: 'Nâu Da Bò',
        engine: '2.0L Bi-Turbo Diesel', seats: 7,
        warrantyInfo: '3 năm hoặc 100.000 km',
        description: 'Mẫu SUV 7 chỗ hàng đầu phân khúc với dẫn động 2 cầu, hỗ trợ lái Ford Co-Pilot360.',
        status: 'AVAILABLE', featured: true,
        images: { create: [
          { imageUrl: '/images/everest.jpg', isPrimary: true, sortOrder: 0 },
          { imageUrl: '/images/car-1.jpg', isPrimary: false, sortOrder: 1 },
        ]},
      },
    }),
    // 2. Toyota Camry
    prisma.vehicle.create({
      data: {
        vin: 'JTMBD31V9L0200002', brandId: toyota.id, categoryId: catSedan.id,
        model: 'Camry', trim: '2.5Q AT', year: 2024,
        condition: 'NEW', price: 1405000000, costPrice: 1300000000,
        fuelType: 'GASOLINE', transmission: 'AUTOMATIC', drivetrain: 'FWD',
        color: 'Trắng Ngọc Trai', interiorColor: 'Đen Sang Trọng',
        engine: '2.5L 4 xy-lanh', seats: 5,
        warrantyInfo: '5 năm hoặc 150.000 km',
        description: 'Sedan hạng D chuẩn mực, Toyota Safety Sense thế hệ mới.',
        status: 'AVAILABLE', featured: true,
        images: { create: [
          { imageUrl: '/images/camry.jpg', isPrimary: true, sortOrder: 0 },
          { imageUrl: '/images/car-2.jpg', isPrimary: false, sortOrder: 1 },
        ]},
      },
    }),
    // 3. VinFast VF 8
    prisma.vehicle.create({
      data: {
        vin: 'VF8NAE129P0300003', brandId: vinfast.id, categoryId: catEV.id,
        model: 'VF 8', trim: 'Plus Dual Motor AWD', year: 2024,
        condition: 'NEW', price: 1309000000, costPrice: 1190000000,
        fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', drivetrain: 'AWD',
        color: 'Xanh Crimson Red', interiorColor: 'Nâu Saddle',
        engine: 'Dual Motor 402hp', seats: 5,
        warrantyInfo: '10 năm hoặc 200.000 km',
        description: 'SUV điện thông minh, trợ lý ảo tiếng Việt, ADAS cấp độ 2.',
        status: 'AVAILABLE', featured: true,
        images: { create: [
          { imageUrl: '/images/vf8.jpg', isPrimary: true, sortOrder: 0 },
          { imageUrl: '/images/car-3.jpg', isPrimary: false, sortOrder: 1 },
        ]},
      },
    }),
    // 4. Mercedes C-Class
    prisma.vehicle.create({
      data: {
        vin: 'WDD2050401F400004', brandId: mercedes.id, categoryId: catSedan.id,
        model: 'C-Class', trim: 'C 300 AMG Line', year: 2024,
        condition: 'NEW', price: 2099000000, costPrice: 1920000000,
        fuelType: 'GASOLINE', transmission: 'AUTOMATIC', drivetrain: 'RWD',
        color: 'Xám Selenite', interiorColor: 'Đỏ Nappa',
        engine: '2.0L Turbo EQ Boost 258hp', seats: 5,
        warrantyInfo: '3 năm không giới hạn km',
        description: 'Phong cách AMG thể thao, màn hình 11.9 inch.',
        status: 'AVAILABLE', featured: true,
        images: { create: [{ imageUrl: '/images/car-1.jpg', isPrimary: true, sortOrder: 0 }] },
      },
    }),
    // 5. Porsche 911 Carrera
    prisma.vehicle.create({
      data: {
        vin: 'WP0AB2A93PS500005', brandId: porsche.id, categoryId: catCoupe.id,
        model: '911 Carrera', trim: 'S Coupé', year: 2024,
        condition: 'NEW', price: 8500000000, costPrice: 7800000000,
        fuelType: 'GASOLINE', transmission: 'AUTOMATIC', drivetrain: 'RWD',
        color: 'Đỏ Guards Red', interiorColor: 'Đen/Đỏ Club',
        engine: '3.0L Twin-Turbo Flat-6 450hp', seats: 4,
        warrantyInfo: '4 năm hoặc 100.000 km',
        description: 'Biểu tượng thể thao Đức, 0-100km/h 3.5 giây.',
        status: 'AVAILABLE', featured: true,
        images: { create: [{ imageUrl: '/images/car-2.jpg', isPrimary: true, sortOrder: 0 }] },
      },
    }),
    // 6. Audi Q5
    prisma.vehicle.create({
      data: {
        vin: 'WA1VAAF79PD600006', brandId: audi.id, categoryId: catSUV.id,
        model: 'Q5', trim: '55 TFSI quattro S line', year: 2024,
        condition: 'NEW', price: 3200000000, costPrice: 2950000000,
        fuelType: 'GASOLINE', transmission: 'AUTOMATIC', drivetrain: 'AWD',
        color: 'Xanh Navarra', interiorColor: 'Beige Okapi',
        engine: '2.0L TFSI 265hp quattro', seats: 5,
        warrantyInfo: '3 năm hoặc 100.000 km',
        description: 'SUV sang trọng quattro, Virtual Cockpit Plus.',
        status: 'AVAILABLE', featured: false,
        images: { create: [{ imageUrl: '/images/car-3.jpg', isPrimary: true, sortOrder: 0 }] },
      },
    }),
    // 7. Toyota Fortuner (Xe lướt)
    prisma.vehicle.create({
      data: {
        vin: 'MR0DB3CD5P0700007', brandId: toyota.id, categoryId: catSUV.id,
        model: 'Fortuner', trim: '2.8L 4x4 AT Legender', year: 2023,
        condition: 'USED', price: 1050000000, costPrice: 980000000,
        mileage: 18000, fuelType: 'DIESEL', transmission: 'AUTOMATIC', drivetrain: 'FOUR_WD',
        color: 'Bạc', interiorColor: 'Đen',
        engine: '2.8L Turbo Diesel', seats: 7,
        warrantyInfo: 'Bảo hành hãng còn 1 năm',
        description: 'Xe lướt chính hãng, 18.000km, bảo dưỡng đầy đủ tại hãng.',
        status: 'AVAILABLE', featured: false,
        images: { create: [{ imageUrl: '/images/car-1.jpg', isPrimary: true, sortOrder: 0 }] },
      },
    }),
    // 8. VinFast VF e34
    prisma.vehicle.create({
      data: {
        vin: 'VF34A1B2C3D00008', brandId: vinfast.id, categoryId: catEV.id,
        model: 'VF e34', trim: 'Standard', year: 2024,
        condition: 'NEW', price: 729000000, costPrice: 660000000,
        fuelType: 'ELECTRIC', transmission: 'AUTOMATIC', drivetrain: 'FWD',
        color: 'Trắng', interiorColor: 'Đen',
        engine: 'Single Motor 147hp', seats: 5,
        warrantyInfo: '10 năm hoặc 200.000 km',
        description: 'Crossover điện phổ thông, sạc nhanh 30 phút 80%.',
        status: 'AVAILABLE', featured: false,
        images: { create: [{ imageUrl: '/images/car-2.jpg', isPrimary: true, sortOrder: 0 }] },
      },
    }),
  ]);
  console.log(`✅ ${vehicles.length} xe mẫu`);

  const [v1, v2, v3, v4, v5] = vehicles;

  // ── 6. Leads (4 khách hàng tiềm năng) ──────────────────────
  await Promise.all([
    prisma.lead.create({ data: {
      vehicleId: v1.id, assignedToId: sales1.id,
      guestName: 'Phạm Minh Hoàng', guestPhone: '0909123456', guestEmail: 'hoang.pm@gmail.com',
      type: 'TEST_DRIVE', status: 'CONTACTED',
      preferredDate: new Date(Date.now() + 2 * 86400000),
      notes: 'Muốn lái thử Everest sáng thứ Bảy.',
    }}),
    prisma.lead.create({ data: {
      vehicleId: v3.id, assignedToId: sales2.id,
      guestName: 'Đặng Mai Phương', guestPhone: '0987654321', guestEmail: 'phuong.dm@hotmail.com',
      type: 'FINANCE', status: 'NEW',
      notes: 'Tư vấn vay 80% VF8 trong 5 năm.',
    }}),
    prisma.lead.create({ data: {
      vehicleId: v4.id, assignedToId: sales1.id,
      guestName: 'Trương Đình Khoa', guestPhone: '0976543210', guestEmail: 'khoa.truong@gmail.com',
      type: 'INQUIRY', status: 'QUALIFIED',
      notes: 'Doanh nhân quan tâm C-Class AMG, cần báo giá lăn bánh.',
    }}),
    prisma.lead.create({ data: {
      assignedToId: sales2.id,
      guestName: 'Ngô Thị Lan Anh', guestPhone: '0965432109',
      type: 'INQUIRY', status: 'NEW',
      notes: 'Hỏi chung về chính sách ưu đãi tháng.',
    }}),
  ]);
  console.log('✅ 4 Leads mẫu');

  // ── 7. TestDrive (2 lịch) ──────────────────────────────────
  await Promise.all([
    prisma.testDrive.create({ data: {
      vehicleId: v1.id, assignedToId: sales1.id,
      customerName: 'Phạm Minh Hoàng', customerPhone: '0909123456', customerEmail: 'hoang.pm@gmail.com',
      scheduledDate: new Date(Date.now() + 2 * 86400000), scheduledTime: '09:30',
      status: 'CONFIRMED', notes: 'Xe Everest đã chuẩn bị sẵn.',
    }}),
    prisma.testDrive.create({ data: {
      vehicleId: v5.id, assignedToId: sales2.id,
      customerName: 'Nguyễn Quốc Bảo', customerPhone: '0944332211',
      scheduledDate: new Date(Date.now() + 5 * 86400000), scheduledTime: '14:00',
      status: 'PENDING', notes: 'Khách muốn trải nghiệm Porsche 911.',
    }}),
  ]);
  console.log('✅ 2 lịch lái thử');

  // ── 8. Promotions (2 chương trình) ─────────────────────────
  await Promise.all([
    prisma.promotion.create({ data: {
      title: 'Tri Ân Khách Hàng — Ưu đãi 50% Phí Trước Bạ',
      description: 'Tặng 50% lệ phí trước bạ cho Ford và Toyota ký HĐ trong tháng.',
      discountType: 'PERCENTAGE', discountValue: 50,
      startDate: new Date(), endDate: new Date(Date.now() + 30 * 86400000),
      isActive: true, imageUrl: '/images/cta-banner.png',
    }}),
    prisma.promotion.create({ data: {
      title: 'Lái thử Porsche — Nhận quà đẳng cấp',
      description: 'Đăng ký lái thử Porsche 911, nhận voucher 50 triệu phụ kiện.',
      discountType: 'FIXED', discountValue: 50000000,
      startDate: new Date(), endDate: new Date(Date.now() + 14 * 86400000),
      isActive: true,
    }}),
  ]);
  console.log('✅ 2 Khuyến mãi');

  // ── 9. Blog Post (1 bài) ───────────────────────────────────
  await prisma.blogPost.create({ data: {
    title: 'Xu hướng xe điện 2025: Cuộc cách mạng xanh tại Việt Nam',
    slug: 'xu-huong-xe-dien-2025',
    content: `Thị trường ô tô điện Việt Nam đang chứng kiến sự bùng nổ chưa từng có. Với sự góp mặt của VinFast, các hãng xe châu Âu và chính sách ưu đãi thuế, năm 2025 hứa hẹn là bước ngoặt cho giao thông xanh.

## Tại sao xe điện lên ngôi?

Chi phí vận hành thấp hơn 60% so với xe xăng, hạ tầng trạm sạc mở rộng nhanh chóng, và ý thức bảo vệ môi trường ngày càng cao là ba yếu tố chính thúc đẩy người tiêu dùng chuyển sang xe điện.

## Các mẫu xe đáng chú ý

VinFast VF 8, VF e34 đang dẫn đầu phân khúc với giá hợp lý. Các thương hiệu châu Âu như Mercedes EQS, Audi e-tron cũng bắt đầu gia nhập thị trường.

## Lời khuyên cho người mua

Hãy cân nhắc nhu cầu di chuyển hàng ngày, khoảng cách sạc và chi phí tổng sở hữu trước khi quyết định.`,
    excerpt: 'Thị trường xe điện Việt Nam bùng nổ — phân tích xu hướng, mẫu xe hot và lời khuyên mua sắm.',
    coverImage: '/images/blog-1.jpg',
    authorId: admin.id,
    isPublished: true,
    publishedAt: new Date(),
  }});
  console.log('✅ 1 Blog Post');

  // ── 10. Deposit (1 biên lai cọc) ───────────────────────────
  const dep = await prisma.deposit.create({ data: {
    vehicleId: v2.id, createdById: sales1.id,
    customerName: 'Võ Thanh Tùng', customerPhone: '0977888999', customerEmail: 'tung.vo@gmail.com',
    amount: 50000000, status: 'CONFIRMED',
    expiresAt: new Date(Date.now() + 7 * 86400000),
    notes: 'Khách đặt cọc Toyota Camry 2.5Q, giữ xe 7 ngày.',
  }});
  console.log('✅ 1 Deposit');

  // ── 11. Quotation (1 báo giá) ──────────────────────────────
  const quo = await prisma.quotation.create({ data: {
    vehicleId: v1.id, createdById: admin.id,
    customerName: 'Phạm Minh Hoàng', customerPhone: '0909123456', customerEmail: 'hoang.pm@gmail.com',
    vehiclePrice: 1499000000, registrationFee: 150000000,
    insuranceFee: 25000000, accessories: 15000000, discount: 30000000,
    totalAmount: 1659000000, status: 'SENT',
    validUntil: new Date(Date.now() + 15 * 86400000),
    notes: 'Báo giá lăn bánh Ford Everest Titanium+ tại TP.HCM.',
  }});
  console.log('✅ 1 Quotation');

  // ── 12. Invoice (1 hóa đơn) ────────────────────────────────
  const inv = await prisma.invoice.create({ data: {
    invoiceNumber: 'INV-20241112-0001',
    vehicleId: v3.id, createdById: admin.id,
    customerName: 'Đặng Mai Phương', customerPhone: '0987654321',
    customerEmail: 'phuong.dm@hotmail.com', customerAddress: '123 Nguyễn Huệ, Q.1, TP.HCM',
    subtotal: 1309000000, tax: 130900000,
    totalAmount: 1439900000, status: 'PAID',
    issuedAt: new Date(),
    notes: 'Hóa đơn mua VinFast VF 8 Plus.',
  }});
  console.log('✅ 1 Invoice');

  // ── 13. Payment (2 thanh toán) ─────────────────────────────
  await Promise.all([
    prisma.payment.create({ data: {
      vehicleId: v2.id, depositId: dep.id,
      customerName: 'Võ Thanh Tùng', customerPhone: '0977888999',
      amount: 50000000, method: 'BANK_TRANSFER', status: 'COMPLETED',
      transactionId: 'VCB-20241112-8899',
      paidAt: new Date(), notes: 'Thanh toán đặt cọc Camry.',
    }}),
    prisma.payment.create({ data: {
      vehicleId: v3.id, invoiceId: inv.id,
      customerName: 'Đặng Mai Phương', customerPhone: '0987654321',
      amount: 1439900000, method: 'BANK_TRANSFER', status: 'COMPLETED',
      transactionId: 'TCB-20241112-1122',
      paidAt: new Date(), notes: 'Thanh toán toàn bộ VF 8.',
    }}),
  ]);
  console.log('✅ 2 Payments');

  console.log('\n🎉 TOÀN BỘ DỮ LIỆU SEED HOÀN TẤT!');
}

main()
  .catch((e) => { console.error('❌ Lỗi seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

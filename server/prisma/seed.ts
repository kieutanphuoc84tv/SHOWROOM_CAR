// ============================================================
// 🌱 seed.ts — Đổ dữ liệu mẫu vào Database
// 🌱 seed.ts — Đổ dữ liệu mẫu thực tế cho Nexus Auto Showroom
// ============================================================

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../src/generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient()
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu đổ dữ liệu mẫu...')
  console.log('🌱 Bắt đầu dọn dẹp và đổ dữ liệu mẫu thực tế...');

  // 1. Dọn dẹp dữ liệu cũ (Xóa theo thứ tự để không dính Foreign Key)
  await prisma.lead.deleteMany()
  await prisma.vehicleImage.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.user.deleteMany()
  // 1. Dọn dẹp dữ liệu cũ theo đúng thứ tự ràng buộc khóa ngoại (Foreign Keys)
  await prisma.auditLog.deleteMany();
  await prisma.customerInteraction.deleteMany();
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
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // 2. Tạo Admin User để test Đăng nhập
  const passwordHash = await bcrypt.hash('123456', 10)
  console.log('🧹 Đã dọn sạch dữ liệu cũ.');

  // 2. Tạo Tài khoản Người dùng & Phân quyền (RBAC)
  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@nexusauto.vn',
      passwordHash,
      fullName: 'Quản trị viên',
      fullName: 'Nguyễn Quản Trị',
      phone: '0988888888',
      role: 'ADMIN',
      isActive: true,
    },
  })
  console.log('✅ Đã tạo Admin user (admin@nexusauto.vn / 123456)')
  });

  // 3. Tạo Brands (Hãng xe)
  const sales1 = await prisma.user.create({
    data: {
      email: 'sales1@nexusauto.vn',
      passwordHash,
      fullName: 'Trần Văn Sales',
      phone: '0912345678',
      role: 'SALES',
      isActive: true,
    },
  });

  const sales2 = await prisma.user.create({
    data: {
      email: 'sales2@nexusauto.vn',
      passwordHash,
      fullName: 'Lê Thị Thuỳ Dung',
      phone: '0934567890',
      role: 'SALES',
      isActive: true,
    },
  });

  console.log('✅ Đã tạo tài khoản: Admin (admin@nexusauto.vn), 2 Sales (sales1, sales2 / 123456)');

  // 3. Tạo Hãng xe (Brands)
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: 'Toyota', country: 'Nhật Bản' } }),
    prisma.brand.create({ data: { name: 'Mercedes-Benz', country: 'Đức' } }),
    prisma.brand.create({ data: { name: 'Ford', country: 'Mỹ' } }),
  ])
  console.log('✅ Đã tạo Hãng xe (Brands)')
    prisma.brand.create({ data: { name: 'Ford', country: 'Mỹ', logoUrl: '/images/brands/ford.png' } }),
    prisma.brand.create({ data: { name: 'Toyota', country: 'Nhật Bản', logoUrl: '/images/brands/toyota.png' } }),
    prisma.brand.create({ data: { name: 'Mercedes-Benz', country: 'Đức', logoUrl: '/images/brands/mercedes.png' } }),
    prisma.brand.create({ data: { name: 'VinFast', country: 'Việt Nam', logoUrl: '/images/brands/vinfast.png' } }),
    prisma.brand.create({ data: { name: 'Porsche', country: 'Đức', logoUrl: '/images/brands/porsche.png' } }),
    prisma.brand.create({ data: { name: 'Audi', country: 'Đức', logoUrl: '/images/brands/audi.png' } }),
  ]);
  console.log(`✅ Đã tạo ${brands.length} hãng xe.`);

  // 4. Tạo Categories (Loại xe)
  // 4. Tạo Phân khúc xe (Categories)
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Sedan' } }),
    prisma.category.create({ data: { name: 'SUV' } }),
  ])
  console.log('✅ Đã tạo Loại xe (Categories)')
    prisma.category.create({ data: { name: 'SUV / Crossover', description: 'Gầm cao đa dụng, mạnh mẽ cho gia đình và địa hình' } }),
    prisma.category.create({ data: { name: 'Sedan', description: 'Lịch lãm, sang trọng, êm ái cho đô thị và doanh nhân' } }),
    prisma.category.create({ data: { name: 'Coupe / Thể thao', description: 'Hiệu suất cao, kiểu dáng khí động học đột phá' } }),
    prisma.category.create({ data: { name: 'Xe điện (EV)', description: 'Công nghệ tương lai, không phát thải, tăng tốc tức thì' } }),
    prisma.category.create({ data: { name: 'MPV', description: 'Đa dụng 7 chỗ rộng rãi tối ưu cho gia đình lớn' } }),
  ]);
  console.log(`✅ Đã tạo ${categories.length} phân khúc xe.`);

  // 5. Tạo xe mẫu
  const vehicle = await prisma.vehicle.create({
  // 5. Tạo Xe mẫu chi tiết kèm thông số kỹ thuật thực tế
  const v1 = await prisma.vehicle.create({
    data: {
      brandId: brands[2].id, // Ford
      categoryId: categories[1].id, // SUV
      model: 'Everest Titanium',
      vin: '1FA6P8CF9H5100001',
      brandId: brands[0].id, // Ford
      categoryId: categories[0].id, // SUV
      model: 'Everest',
      trim: 'Titanium+ 2.0L Bi-Turbo 4x4',
      year: 2024,
      price: 1500000000,
      condition: 'NEW',
      price: 1499000000,
      costPrice: 1380000000,
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      color: 'Đen',
      engine: '2.0L Bi-Turbo',
      description: 'SUV 7 chỗ hầm hố của Ford.',
      drivetrain: 'FOUR_WD',
      color: 'Đen Ánh Kim',
      interiorColor: 'Nâu Da Bò',
      engine: '2.0L Bi-Turbo Diesel',
      seats: 7,
      warrantyInfo: '3 năm hoặc 100.000 km',
      description: 'Mẫu SUV 7 chỗ hàng đầu phân khúc với dẫn động 2 cầu toàn thời gian, hỗ trợ lái thông minh Ford Co-Pilot360.',
      status: 'AVAILABLE',
      featured: true,
    }
  })
  console.log('✅ Đã tạo Xe mẫu (Vehicles)')
      images: {
        create: [
          { imageUrl: '/images/everest.jpg', isPrimary: true, sortOrder: 0 },
          { imageUrl: '/images/car-1.jpg', isPrimary: false, sortOrder: 1 },
        ],
      },
    },
  });

  // 6. Tạo một Lead mẫu (Khách vãng lai gửi form)
  const v2 = await prisma.vehicle.create({
    data: {
      vin: 'JTMBD31V9L0200002',
      brandId: brands[1].id, // Toyota
      categoryId: categories[1].id, // Sedan
      model: 'Camry',
      trim: '2.5Q AT',
      year: 2024,
      condition: 'NEW',
      price: 1405000000,
      costPrice: 1300000000,
      fuelType: 'GASOLINE',
      transmission: 'AUTOMATIC',
      drivetrain: 'FWD',
      color: 'Trắng Ngọc Trai',
      interiorColor: 'Đen Sang Trọng',
      engine: '2.5L 4 xy-lanh thẳng hàng',
      seats: 5,
      warrantyInfo: '5 năm hoặc 150.000 km',
      description: 'Sedan hạng D chuẩn mực của sự êm ái, trang bị Toyota Safety Sense thế hệ mới nhất.',
      status: 'AVAILABLE',
      featured: true,
      images: {
        create: [
          { imageUrl: '/images/camry.jpg', isPrimary: true, sortOrder: 0 },
          { imageUrl: '/images/car-2.jpg', isPrimary: false, sortOrder: 1 },
        ],
      },
    },
  });

  const v3 = await prisma.vehicle.create({
    data: {
      vin: 'VF8NAE129P0300003',
      brandId: brands[3].id, // VinFast
      categoryId: categories[3].id, // EV
      model: 'VF 8',
      trim: 'Plus Dual Motor AWD',
      year: 2024,
      condition: 'NEW',
      price: 1309000000,
      costPrice: 1190000000,
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      drivetrain: 'AWD',
      color: 'Xanh Crimson Red',
      interiorColor: 'Nâu Saddle',
      engine: 'Hai mô-tơ điện công suất 402 mã lực',
      seats: 5,
      warrantyInfo: '10 năm hoặc 200.000 km',
      description: 'SUV điện thông minh toàn cầu, trợ lý ảo tiếng Việt, hệ thống hỗ trợ lái nâng cao ADAS cấp độ 2.',
      status: 'AVAILABLE',
      featured: true,
      images: {
        create: [
          { imageUrl: '/images/vf8.jpg', isPrimary: true, sortOrder: 0 },
          { imageUrl: '/images/car-3.jpg', isPrimary: false, sortOrder: 1 },
        ],
      },
    },
  });

  const v4 = await prisma.vehicle.create({
    data: {
      vin: 'WDD2050401F400004',
      brandId: brands[2].id, // Mercedes-Benz
      categoryId: categories[1].id, // Sedan
      model: 'C-Class',
      trim: 'C 300 AMG Line',
      year: 2024,
      condition: 'NEW',
      price: 2099000000,
      costPrice: 1920000000,
      fuelType: 'GASOLINE',
      transmission: 'AUTOMATIC',
      drivetrain: 'RWD',
      color: 'Xám Selenite',
      interiorColor: 'Đỏ Nappa',
      engine: '2.0L Turbo Mild-Hybrid EQ Boost (258 hp)',
      seats: 5,
      warrantyInfo: '3 năm không giới hạn km',
      description: 'Phong cách thể thao AMG thể hiện quyền lực, màn hình cảm ứng trung tâm 11.9 inch độ nét cao.',
      status: 'AVAILABLE',
      featured: true,
      images: {
        create: [
          { imageUrl: '/images/car-1.jpg', isPrimary: true, sortOrder: 0 },
        ],
      },
    },
  });

  console.log('✅ Đã tạo 4 xe mẫu chuẩn Showroom kèm ảnh và thông số.');

  // 6. Tạo Khách hàng tiềm năng (Leads)
  await prisma.lead.create({
    data: {
      guestName: 'Nguyễn Văn Khách',
      guestPhone: '0901234567',
      vehicleId: v1.id,
      assignedToId: sales1.id,
      guestName: 'Phạm Minh Hoàng',
      guestPhone: '0909123456',
      guestEmail: 'hoang.pm@gmail.com',
      type: 'TEST_DRIVE',
      notes: 'Tôi muốn lái thử vào thứ 7 tuần này',
      vehicleId: vehicle.id,
    }
  })
  console.log('✅ Đã tạo Lead mẫu')
      status: 'CONTACTED',
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      notes: 'Khách quan tâm Ford Everest màu đen, muốn lái thử vào sáng thứ Bảy.',
    },
  });

  console.log('🎉 Hoàn thành đổ dữ liệu mẫu!')
  await prisma.lead.create({
    data: {
      vehicleId: v3.id,
      assignedToId: sales2.id,
      guestName: 'Đặng Mai Phương',
      guestPhone: '0987654321',
      guestEmail: 'phuong.dm@hotmail.com',
      type: 'FINANCE',
      status: 'NEW',
      notes: 'Cần tư vấn gói vay trả góp 80% xe điện VF8 trong 5 năm.',
    },
  });
  console.log('✅ Đã tạo 2 Leads mẫu phân công cho nhân viên Sales.');

  // 7. Tạo Lịch lái thử (TestDrive)
  await prisma.testDrive.create({
    data: {
      vehicleId: v1.id,
      assignedToId: sales1.id,
      customerName: 'Phạm Minh Hoàng',
      customerPhone: '0909123456',
      customerEmail: 'hoang.pm@gmail.com',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      scheduledTime: '09:30',
      status: 'CONFIRMED',
      notes: 'Đã chuẩn bị xe Everest Titanium sạch sẽ trước giờ hẹn.',
    },
  });

  // 8. Tạo Chương trình Khuyến mãi (Promotions)
  await prisma.promotion.create({
    data: {
      title: 'Tri Ân Khách Hàng — Ưu đãi 50% Phí Trước Bạ',
      description: 'Tặng 50% lệ phí trước bạ cho toàn bộ các dòng xe Ford và Toyota ký hợp đồng trong tháng.',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      imageUrl: '/images/cta-banner.png',
    },
  });
  console.log('✅ Đã tạo Khuyến mãi và Lịch lái thử mẫu.');

  console.log('🎉 TOÀN BỘ DỮ LIỆU SEED ĐÃ HOÀN TẤT THÀNH CÔNG!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
    console.error('❌ Lỗi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
    await prisma.$disconnect();
  });

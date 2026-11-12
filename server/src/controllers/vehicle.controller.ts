import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Lấy danh sách xe kèm bộ lọc và phân trang (Public)
export const getVehicles = async (req: Request, res: Response) => {
  try {
    const {
      brandId,
      categoryId,
      fuelType,
      transmission,
      condition,
      status,
      minPrice,
      maxPrice,
      search,
      featured,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query as Record<string, string | undefined>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isDeleted: false,
    };

    if (brandId) where.brandId = parseInt(brandId);
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;
    if (condition) where.condition = condition;
    if (status) where.status = status;
    if (featured !== undefined) where.featured = featured === 'true';

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { model: { contains: search, mode: 'insensitive' } },
        { trim: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['price', 'year', 'createdAt', 'mileage'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const [total, vehicles] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({
        where,
        include: {
          brand: true,
          category: true,
          images: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          },
        },
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      data: vehicles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[getVehicles] Error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách xe', details: error.message });
  }
};

// Lấy chi tiết 1 xe theo ID (Public)
export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin xe hoặc xe đã ngừng kinh doanh' });
    }

    res.json(vehicle);
  } catch (error: any) {
    console.error('[getVehicleById] Error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy chi tiết xe', details: error.message });
  }
};

// Thêm xe mới (Admin)
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const {
      brandId,
      categoryId,
      model,
      trim,
      vin,
      engineNumber,
      licensePlate,
      year,
      price,
      costPrice,
      mileage,
      fuelType,
      transmission,
      drivetrain,
      color,
      interiorColor,
      engine,
      seats,
      description,
      warrantyInfo,
      condition,
      status,
      featured,
    } = req.body;

    if (!brandId || !categoryId || !model || !year || !price) {
      return res.status(400).json({
        error: 'Vui lòng cung cấp đầy đủ: Hãng, Phân khúc, Tên dòng xe, Năm sản xuất và Giá bán',
      });
    }

    const files = req.files as Express.Multer.File[];

    // Lưu URL dạng tương đối (/uploads/filename) — an toàn, tương thích mọi domain
    const imageCreateData =
      files && files.length > 0
        ? files.map((file, index) => ({
            imageUrl: `/uploads/${file.filename}`,
            isPrimary: index === 0,
            sortOrder: index,
          }))
        : [];

    const vehicle = await prisma.vehicle.create({
      data: {
        brandId: parseInt(brandId),
        categoryId: parseInt(categoryId),
        model: model.trim(),
        trim: trim ? trim.trim() : null,
        vin: vin ? vin.trim() : null,
        engineNumber: engineNumber ? engineNumber.trim() : null,
        licensePlate: licensePlate ? licensePlate.trim() : null,
        year: parseInt(year),
        condition: condition || 'NEW',
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : null,
        mileage: mileage ? parseInt(mileage) : 0,
        fuelType: fuelType || 'GASOLINE',
        transmission: transmission || 'AUTOMATIC',
        drivetrain: drivetrain || null,
        color: color ? color.trim() : 'Trắng',
        interiorColor: interiorColor ? interiorColor.trim() : null,
        engine: engine ? engine.trim() : null,
        seats: seats ? parseInt(seats) : 5,
        warrantyInfo: warrantyInfo ? warrantyInfo.trim() : null,
        description: description ? description.trim() : null,
        status: status || 'AVAILABLE',
        featured: featured === 'true' || featured === true,
        images: {
          create: imageCreateData,
        },
      },
      include: {
        brand: true,
        category: true,
        images: true,
      },
    });

    res.status(201).json({ message: 'Thêm xe thành công', vehicle });
  } catch (error: any) {
    console.error('[createVehicle] Error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Mã số khung VIN này đã tồn tại trong hệ thống' });
    }
    res.status(500).json({ error: 'Lỗi máy chủ khi thêm xe', details: error.message });
  }
};

// Cập nhật xe (Admin)
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      brandId,
      categoryId,
      model,
      trim,
      vin,
      engineNumber,
      licensePlate,
      year,
      price,
      costPrice,
      mileage,
      fuelType,
      transmission,
      drivetrain,
      color,
      interiorColor,
      engine,
      seats,
      description,
      warrantyInfo,
      condition,
      status,
      featured,
    } = req.body;

    const files = req.files as Express.Multer.File[];

    const updateData: any = {};
    if (brandId !== undefined) updateData.brandId = parseInt(brandId);
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
    if (model !== undefined) updateData.model = model.trim();
    if (trim !== undefined) updateData.trim = trim ? trim.trim() : null;
    if (vin !== undefined) updateData.vin = vin ? vin.trim() : null;
    if (engineNumber !== undefined) updateData.engineNumber = engineNumber ? engineNumber.trim() : null;
    if (licensePlate !== undefined) updateData.licensePlate = licensePlate ? licensePlate.trim() : null;
    if (year !== undefined) updateData.year = parseInt(year);
    if (condition !== undefined) updateData.condition = condition;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (costPrice !== undefined) updateData.costPrice = costPrice ? parseFloat(costPrice) : null;
    if (mileage !== undefined) updateData.mileage = parseInt(mileage);
    if (fuelType !== undefined) updateData.fuelType = fuelType;
    if (transmission !== undefined) updateData.transmission = transmission;
    if (drivetrain !== undefined) updateData.drivetrain = drivetrain || null;
    if (color !== undefined) updateData.color = color.trim();
    if (interiorColor !== undefined) updateData.interiorColor = interiorColor ? interiorColor.trim() : null;
    if (engine !== undefined) updateData.engine = engine ? engine.trim() : null;
    if (seats !== undefined) updateData.seats = parseInt(seats);
    if (warrantyInfo !== undefined) updateData.warrantyInfo = warrantyInfo ? warrantyInfo.trim() : null;
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (status !== undefined) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured === 'true' || featured === true;

    // Sử dụng transaction để bảo đảm an toàn dữ liệu ảnh và thông tin xe
    const vehicle = await prisma.$transaction(async (tx) => {
      const updated = await tx.vehicle.update({
        where: { id },
        data: updateData,
        include: {
          brand: true,
          category: true,
          images: true,
        },
      });

      // Nếu có ảnh mới được tải lên
      if (files && files.length > 0) {
        // Xóa ảnh cũ
        await tx.vehicleImage.deleteMany({
          where: { vehicleId: id },
        });

        // Tạo ảnh mới với đường dẫn tương đối an toàn
        const newImages = files.map((file, index) => ({
          vehicleId: id,
          imageUrl: `/uploads/${file.filename}`,
          isPrimary: index === 0,
          sortOrder: index,
        }));

        await tx.vehicleImage.createMany({
          data: newImages,
        });
      }

      return updated;
    });

    const refreshedVehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
      },
    });

    res.json({ message: 'Cập nhật xe thành công', vehicle: refreshedVehicle || vehicle });
  } catch (error: any) {
    console.error('[updateVehicle] Error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Mã số khung VIN này đã tồn tại trong hệ thống' });
    }
    res.status(500).json({ error: 'Lỗi máy chủ khi cập nhật xe', details: error.message });
  }
};

// Xóa xe (Soft delete an toàn, không làm hỏng lịch sử hoá đơn/đặt cọc)
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    // Kiểm tra xe có đang dính cọc chưa hoàn thành không
    const activeDeposit = await prisma.deposit.findFirst({
      where: {
        vehicleId: id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (activeDeposit) {
      return res.status(400).json({
        error: 'Không thể xóa xe này vì đang có khách đặt cọc giữ chỗ. Vui lòng xử lý hủy hoặc hoàn cọc trước.',
      });
    }

    // Soft delete
    await prisma.vehicle.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: 'UNAVAILABLE',
      },
    });

    res.json({ message: 'Đã xóa xe khỏi danh sách kinh doanh thành công' });
  } catch (error: any) {
    console.error('[deleteVehicle] Error:', error);
    res.status(500).json({ error: 'Lỗi khi xóa xe', details: error.message });
  }
};

export interface Brand {
  id: number;
  name: string;
  logoUrl?: string | null;
  country?: string | null;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface VehicleImage {
  id: number;
  vehicleId: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Vehicle {
  id: string;
  _id?: string; // Tương thích ngược nếu có
  vin?: string | null;
  engineNumber?: string | null;
  licensePlate?: string | null;
  brandId: number;
  categoryId: number;
  model: string;
  trim?: string | null;
  year: number;
  condition: 'NEW' | 'USED';
  price: number | string;
  costPrice?: number | string | null;
  mileage: number;
  fuelType: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
  transmission: 'AUTOMATIC' | 'MANUAL';
  drivetrain?: 'FWD' | 'RWD' | 'AWD' | 'FOUR_WD' | null;
  color: string;
  interiorColor?: string | null;
  engine?: string | null;
  seats: number;
  warrantyInfo?: string | null;
  description?: string | null;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'UNAVAILABLE';
  featured: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;

  brand?: Brand | string;
  category?: Category | string;
  images?: VehicleImage[];
}

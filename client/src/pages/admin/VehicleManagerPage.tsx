import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  X, 
  AlertTriangle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

// Interfaces
interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface VehicleImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

interface Vehicle {
  id: string;
  brandId: string;
  categoryId: string;
  model: string;
  year: number;
  price: number;
  fuelType: string;
  transmission: string;
  color: string;
  engine: string;
  seats: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  description: string;
  images: VehicleImage[];
  brand?: Brand;
  category?: Category;
}

// Format helpers
const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function VehicleManagerPage() {
  // State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    status: 'AVAILABLE',
    fuelType: 'GASOLINE',
    transmission: 'AUTOMATIC'
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, brandsRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/vehicles`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/brands`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/categories`, { credentials: 'include' })
      ]);

      if (vehiclesRes.ok) {
        const vData = await vehiclesRes.json();
        setVehicles(Array.isArray(vData) ? vData : vData?.data || []);
      }
      if (brandsRes.ok) setBrands(await brandsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingVehicle(null);
    setFormData({
      status: 'AVAILABLE',
      fuelType: 'GASOLINE',
      transmission: 'AUTOMATIC',
      year: new Date().getFullYear(),
    });
    setSelectedFiles([]);
    setPreviewImages([]);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setSelectedFiles([]);
    setPreviewImages(vehicle.images?.map(img => img.imageUrl) || []);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setSelectedFiles(prev => [...prev, ...fileArray]);
    
    const newPreviews = fileArray.map(f => URL.createObjectURL(f));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    // If it's a new file
    if (index >= (editingVehicle?.images?.length || 0) || !editingVehicle) {
      const fileIndex = editingVehicle ? index - (editingVehicle.images?.length || 0) : index;
      setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'images' || key === 'brand' || key === 'category') return;
        if (formData[key as keyof Vehicle] !== undefined && formData[key as keyof Vehicle] !== null) {
          form.append(key, formData[key as keyof Vehicle]?.toString() || '');
        }
      });
      
      selectedFiles.forEach(file => {
        form.append('images', file);
      });

      const url = editingVehicle 
        ? `${API_BASE_URL}/api/vehicles/${editingVehicle.id}`
        : `${API_BASE_URL}/api/vehicles`;
        
      const method = editingVehicle ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: form,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lưu thất bại');
      }

      showToast(editingVehicle ? 'Cập nhật thành công' : 'Thêm mới thành công', 'success');
      setIsFormModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${deletingId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Xóa thất bại');

      showToast('Đã xóa thành công', 'success');
      fetchData();
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi xóa', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  // Filtering
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = brandFilter ? v.brandId?.toString() === brandFilter : true;
    const matchesStatus = statusFilter ? v.status === statusFilter : true;
    return matchesSearch && matchesBrand && matchesStatus;
  });

  return (
    <div className="relative pb-10">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
          toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Kho xe</h1>
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          Thêm xe mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none bg-white"
            >
              <option value="">Tất cả hãng xe</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="AVAILABLE">Sẵn có</option>
            <option value="RESERVED">Đã cọc</option>
            <option value="SOLD">Đã bán</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không tìm thấy xe nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin xe</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá bán</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVehicles.map((vehicle) => {
                  const rawImg = vehicle.images?.find(img => img.isPrimary)?.imageUrl || vehicle.images?.[0]?.imageUrl;
                  const primaryImg = rawImg ? (rawImg.startsWith('/uploads') ? `${API_BASE_URL}${rawImg}` : rawImg) : '';
                  const brandName = typeof vehicle.brand === 'object' && vehicle.brand ? (vehicle.brand as any).name : (vehicle.brand || '');
                  
                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-12 w-16 rounded-md bg-gray-200 overflow-hidden flex items-center justify-center">
                          {primaryImg ? (
                            <img src={primaryImg} alt={vehicle.model} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="text-gray-400 h-6 w-6" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{brandName} {vehicle.model}</div>
                        <div className="text-sm text-gray-500">{vehicle.year} • {vehicle.color} • {vehicle.fuelType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatVND(vehicle.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vehicle.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                          vehicle.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.status === 'AVAILABLE' ? 'Sẵn có' : vehicle.status === 'RESERVED' ? 'Đã cọc' : 'Đã bán'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => handleOpenEditModal(vehicle)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded hover:bg-blue-100 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleOpenDeleteModal(vehicle.id)} className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded hover:bg-red-100 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setIsFormModalOpen(false)}></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-bold text-gray-900">
                    {editingVehicle ? 'Cập nhật thông tin xe' : 'Thêm xe mới'}
                  </h3>
                  <button onClick={() => setIsFormModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hãng xe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hãng xe</label>
                    <select required value={formData.brandId || ''} onChange={e => setFormData({...formData, brandId: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border bg-white">
                      <option value="">Chọn hãng xe</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  {/* Loại xe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại xe</label>
                    <select required value={formData.categoryId || ''} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border bg-white">
                      <option value="">Chọn loại xe</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {/* Tên xe (Model) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên xe (Model)</label>
                    <input required type="text" value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" placeholder="VD: Camry 2.0G" />
                  </div>
                  {/* Năm sản xuất */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Năm sản xuất</label>
                    <input required type="number" value={formData.year || ''} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" />
                  </div>
                  {/* Giá bán */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                    <input required type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" />
                  </div>
                  {/* Nhiên liệu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhiên liệu</label>
                    <select value={formData.fuelType || ''} onChange={e => setFormData({...formData, fuelType: e.target.value as any})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border bg-white">
                      <option value="GASOLINE">Xăng</option>
                      <option value="DIESEL">Dầu Diesel</option>
                      <option value="ELECTRIC">Điện</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                  {/* Hộp số */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hộp số</label>
                    <select value={formData.transmission || ''} onChange={e => setFormData({...formData, transmission: e.target.value as any})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border bg-white">
                      <option value="AUTOMATIC">Tự động</option>
                      <option value="MANUAL">Số sàn</option>
                    </select>
                  </div>
                  {/* Màu sắc */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                    <input type="text" value={formData.color || ''} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" />
                  </div>
                  {/* Động cơ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Động cơ</label>
                    <input type="text" value={formData.engine || ''} onChange={e => setFormData({...formData, engine: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" />
                  </div>
                  {/* Số chỗ ngồi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số chỗ ngồi</label>
                    <input type="number" value={formData.seats || ''} onChange={e => setFormData({...formData, seats: parseInt(e.target.value)})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border" />
                  </div>
                  {/* Trạng thái (chỉ hiện khi sửa) */}
                  {editingVehicle && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border bg-white">
                        <option value="AVAILABLE">Sẵn có (AVAILABLE)</option>
                        <option value="RESERVED">Đã đặt cọc (RESERVED)</option>
                        <option value="SOLD">Đã bán (SOLD)</option>
                      </select>
                    </div>
                  )}
                  {/* Mô tả */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                    <textarea rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"></textarea>
                  </div>
                  
                  {/* KÉO THẢ NHIỀU ẢNH */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bộ sưu tập ảnh (Kéo thả)</label>
                    
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                      <div className="flex text-sm text-gray-600 justify-center mt-2">
                        <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Chọn nhiều ảnh</span>
                          <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">hoặc kéo thả vào đây</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG tối đa 5MB/ảnh</p>
                    </div>

                    {/* Lưới hiển thị ảnh Preview */}
                    {previewImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {previewImages.map((src, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <div className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-white text-[10px] text-center py-1">
                                Ảnh chính
                              </div>
                            )}
                            <button 
                              type="button" 
                              onClick={() => removeImage(idx)} 
                              className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Hủy
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Đang lưu...' : editingVehicle ? 'Lưu thay đổi' : 'Thêm xe'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setIsDeleteModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-bold text-gray-900">Xác nhận xóa</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Bạn có chắc chắn muốn xóa xe này không? Hành động này không thể hoàn tác.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button type="button" onClick={handleDelete} className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                  Xóa
                </button>
                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

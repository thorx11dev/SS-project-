import React, { useEffect, useState, useRef } from 'react';
import { Product, Category, CustomStringOption } from '../../types';
import { Plus, Edit2, Trash2, Search, X, Upload, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [strings, setStrings] = useState<CustomStringOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isStringModalOpen, setIsStringModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingString, setEditingString] = useState<CustomStringOption | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'strings'>('products');
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'product' | 'category', id: number, message: string } | null>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    category_id: 1,
    brand: '',
    image_url: '',
    images: '[]',
    custom_strings: '[]',
    stock: 0,
    is_featured: false,
    specifications: '{}'
  });

  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    image_url: ''
  });

  const [stringFormData, setStringFormData] = useState({
    name: '',
    price: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStrings();
  }, []);

  const fetchStrings = () => {
    fetch('/api/strings').then(res => res.json()).then(setStrings);
  };

  const fetchProducts = () => {
    fetch('/api/products').then(res => res.json()).then(setProducts);
  };

  const fetchCategories = () => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, image_url: data.url }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (e) {
      toast.error('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      brand: product.brand,
      image_url: product.image_url,
      images: product.images || '[]',
      custom_strings: product.custom_strings || '[]',
      stock: product.stock,
      is_featured: product.is_featured === 1,
      specifications: product.specifications || '{}'
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmation({
      type: 'product',
      id,
      message: 'Are you sure you want to delete this product?'
    });
  };

  const handleEditString = (str: CustomStringOption) => {
    setEditingString(str);
    setStringFormData({
      name: str.name,
      price: str.price
    });
    setIsStringModalOpen(true);
  };

  const handleDeleteString = (id: number) => {
    setDeleteConfirmation({
      type: 'string' as any,
      id,
      message: 'Are you sure you want to delete this string option?'
    });
  };

  const handleStringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingString ? `/api/admin/strings/${editingString.id}` : '/api/admin/strings';
    const method = editingString ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stringFormData)
      });

      if (res.ok) {
        toast.success(editingString ? 'String updated successfully' : 'String created successfully');
        setIsStringModalOpen(false);
        setEditingString(null);
        fetchStrings();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save string');
      }
    } catch (error) {
      toast.error('An error occurred while saving');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    const { type, id } = deleteConfirmation;

    if (type === 'product') {
      try {
        const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || 'Failed to delete product');
        } else {
          toast.success('Product deleted successfully');
          fetchProducts();
        }
      } catch (error) {
        toast.error('Failed to delete product');
      }
    } else if (type === 'category') {
      const hasProducts = products.some(p => p.category_id === id);
      try {
        const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || 'Failed to delete category');
        } else {
          toast.success(hasProducts ? 'Category and its products deleted successfully' : 'Category deleted successfully');
          fetchCategories();
          fetchProducts();
        }
      } catch (error) {
        toast.error('Failed to delete category');
      }
    } else if (type === 'string' as any) {
      try {
        const res = await fetch(`/api/admin/strings/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || 'Failed to delete string');
        } else {
          toast.success('String deleted successfully');
          fetchStrings();
        }
      } catch (error) {
        toast.error('Failed to delete string');
      }
    }

    setDeleteConfirmation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save product');
      }
    } catch (error) {
      toast.error('An error occurred while saving');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      image_url: category.image_url || ''
    });
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (id: number) => {
    const hasProducts = products.some(p => p.category_id === id);
    const message = hasProducts 
      ? 'This category contains products. Deleting it will also delete ALL products inside it. Are you sure you want to proceed?'
      : 'Are you sure you want to delete this category?';

    setDeleteConfirmation({
      type: 'category',
      id,
      message
    });
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData)
      });

      if (res.ok) {
        toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save category');
      }
    } catch (error) {
      toast.error('An error occurred while saving');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold uppercase italic">Inventory</h1>
          <p className="text-neutral-500 text-sm">Manage your products and categories.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {activeTab === 'products' ? (
            <button 
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: '', slug: '', description: '', price: 0, category_id: categories[0]?.id || 1, brand: '', image_url: '', images: '[]', custom_strings: JSON.stringify(strings), stock: 0, is_featured: false, weight: '', grip_size: '', lbs: null
                });
                setIsModalOpen(true);
              }}
              className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus size={20} /> ADD PRODUCT
            </button>
          ) : activeTab === 'categories' ? (
            <button 
              onClick={() => {
                setEditingCategory(null);
                setCategoryFormData({ name: '', slug: '', image_url: '' });
                setIsCategoryModalOpen(true);
              }}
              className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus size={20} /> ADD CATEGORY
            </button>
          ) : (
            <button 
              onClick={() => {
                setEditingString(null);
                setStringFormData({ name: '', price: 0 });
                setIsStringModalOpen(true);
              }}
              className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus size={20} /> ADD STRING
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-black/10">
        <button 
          onClick={() => setActiveTab('products')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'products' ? 'border-b-2 border-black text-black' : 'text-neutral-400 hover:text-black'}`}
        >
          Products
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'categories' ? 'border-b-2 border-black text-black' : 'text-neutral-400 hover:text-black'}`}
        >
          Categories
        </button>
        <button 
          onClick={() => setActiveTab('strings')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'strings' ? 'border-b-2 border-black text-black' : 'text-neutral-400 hover:text-black'}`}
        >
          Strings
        </button>
      </div>

      {/* Product List */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                <th className="px-8 py-4">Product</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Price</th>
                <th className="px-8 py-4">Stock</th>
                <th className="px-8 py-4">Specs</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img src={product.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-neutral-100" />
                      <div>
                        <p className="font-bold text-sm">{product.name}</p>
                        <p className="text-xs text-neutral-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm">{product.category_name}</td>
                  <td className="px-8 py-6 font-bold text-sm">{formatCurrency(product.price)}</td>
                  <td className="px-8 py-6">
                    <span className={`font-bold text-sm ${product.stock < 5 ? 'text-red-500' : 'text-neutral-700'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs text-neutral-500 space-y-1">
                      {product.weight && <p><span className="font-medium text-neutral-700">W:</span> {product.weight}</p>}
                      {product.grip_size && <p><span className="font-medium text-neutral-700">G:</span> {product.grip_size}</p>}
                      {!product.weight && !product.grip_size && <span className="italic">N/A</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)} className="p-2 hover:bg-black hover:text-white rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Category List */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50 text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                  <th className="px-8 py-4">ID</th>
                  <th className="px-8 py-4">Name</th>
                  <th className="px-8 py-4">Slug</th>
                  <th className="px-8 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {categories.map(category => (
                  <tr key={category.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-8 py-6 text-sm text-neutral-500">#{category.id}</td>
                    <td className="px-8 py-6 font-bold text-sm">{category.name}</td>
                    <td className="px-8 py-6 text-sm text-neutral-500">{category.slug}</td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        <button onClick={() => handleEditCategory(category)} className="p-2 hover:bg-black hover:text-white rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteCategory(category.id)} className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Strings List */}
      {activeTab === 'strings' && (
        <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50 text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                  <th className="px-8 py-4">ID</th>
                  <th className="px-8 py-4">Name</th>
                  <th className="px-8 py-4">Price</th>
                  <th className="px-8 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {strings.map(str => (
                  <tr key={str.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-8 py-6 text-sm text-neutral-500">#{str.id}</td>
                    <td className="px-8 py-6 font-bold text-sm">{str.name}</td>
                    <td className="px-8 py-6 text-sm text-neutral-500">{formatCurrency(str.price)}</td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        <button onClick={() => handleEditString(str)} className="p-2 hover:bg-black hover:text-white rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteString(str.id)} className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2rem] p-6 md:p-10 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display font-bold uppercase italic">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Name</label>
                  <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Slug</label>
                  <input required type="text" className="input-field" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Description</label>
                <textarea className="input-field min-h-[100px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Price (Rs.)</label>
                  <input required type="number" step="0.01" className="input-field" value={Number.isNaN(formData.price) ? '' : formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Stock</label>
                  <input required type="number" className="input-field" value={Number.isNaN(formData.stock) ? '' : formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Category</label>
                  <select className="input-field" value={Number.isNaN(formData.category_id) ? '' : formData.category_id} onChange={e => setFormData({ ...formData, category_id: parseInt(e.target.value) })}>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Brand</label>
                  <input required type="text" className="input-field" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Image URL</label>
                  <div className="relative">
                    <input required type="text" className="input-field pr-10" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} />
                    <button 
                      type="button"
                      onClick={() => productFileInputRef.current?.click()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-black transition-colors"
                    >
                      {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    </button>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      ref={productFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Custom Specifications</label>
                <div className="space-y-3">
                  {Object.entries(JSON.parse(formData.specifications || '{}')).map(([key, value], idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          className="input-field bg-neutral-50" 
                          value={key} 
                          readOnly 
                        />
                      </div>
                      <div className="flex-[2]">
                        <input 
                          type="text" 
                          className="input-field" 
                          value={value as string} 
                          onChange={(e) => {
                            const specs = JSON.parse(formData.specifications || '{}');
                            specs[key] = e.target.value;
                            setFormData({ ...formData, specifications: JSON.stringify(specs) });
                          }}
                          placeholder="Value"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          const specs = JSON.parse(formData.specifications || '{}');
                          delete specs[key];
                          setFormData({ ...formData, specifications: JSON.stringify(specs) });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex gap-3 items-center pt-2 border-t border-black/5">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Spec Name (e.g. Size)"
                        value={newSpecKey}
                        onChange={(e) => setNewSpecKey(e.target.value)}
                      />
                    </div>
                    <div className="flex-[2]">
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Value"
                        value={newSpecValue}
                        onChange={(e) => setNewSpecValue(e.target.value)}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        if (newSpecKey.trim()) {
                          const specs = JSON.parse(formData.specifications || '{}');
                          specs[newSpecKey.trim()] = newSpecValue;
                          setFormData({ ...formData, specifications: JSON.stringify(specs) });
                          setNewSpecKey('');
                          setNewSpecValue('');
                        }
                      }}
                      className="p-2 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Additional Images</label>
                <div className="flex flex-wrap gap-4">
                  {(JSON.parse(formData.images || '[]') as string[]).map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 border border-black/10 rounded-xl overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => {
                        const newImages = JSON.parse(formData.images || '[]');
                        newImages.splice(idx, 1);
                        setFormData({ ...formData, images: JSON.stringify(newImages) });
                      }} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm text-red-500 hover:bg-red-50">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="relative w-24 h-24 border border-black/10 rounded-xl overflow-hidden flex items-center justify-center hover:bg-neutral-50 cursor-pointer">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      const formDataUpload = new FormData();
                      formDataUpload.append('image', file);
                      try {
                        const res = await fetch('/api/admin/upload', { method: 'POST', body: formDataUpload });
                        const data = await res.json();
                        if (res.ok) {
                          const newImages = JSON.parse(formData.images || '[]');
                          newImages.push(data.url);
                          setFormData({ ...formData, images: JSON.stringify(newImages) });
                        }
                      } finally {
                        setIsUploading(false);
                      }
                    }} />
                    {isUploading ? <Loader2 size={24} className="animate-spin text-neutral-400" /> : <Plus size={24} className="text-neutral-400" />}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Custom Strings</label>
                  <button type="button" onClick={() => {
                    const currentStrings = JSON.parse(formData.custom_strings || '[]') as CustomStringOption[];
                    if (currentStrings.length === strings.length) {
                      setFormData({ ...formData, custom_strings: '[]' });
                    } else {
                      setFormData({ ...formData, custom_strings: JSON.stringify(strings) });
                    }
                  }} className="text-xs font-bold uppercase tracking-widest text-brand-accent flex items-center gap-1">
                    {(JSON.parse(formData.custom_strings || '[]') as CustomStringOption[]).length === strings.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto border border-black/10 rounded-xl p-4">
                  {strings.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic">No strings available. Add strings in the Strings tab.</p>
                  ) : (
                    strings.map((str) => {
                      const currentStrings = JSON.parse(formData.custom_strings || '[]') as CustomStringOption[];
                      const isSelected = currentStrings.some(s => s.id === str.id);
                      return (
                        <label key={str.id} className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 p-2 rounded-lg transition-colors">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={(e) => {
                              let newStrings = [...currentStrings];
                              if (e.target.checked) {
                                newStrings.push(str);
                              } else {
                                newStrings = newStrings.filter(s => s.id !== str.id);
                              }
                              setFormData({ ...formData, custom_strings: JSON.stringify(newStrings) });
                            }}
                            className="w-4 h-4 accent-black"
                          />
                          <span className="text-sm font-medium flex-1">{str.name}</span>
                          <span className="text-xs text-neutral-500 font-mono">{formatCurrency(str.price)}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} className="w-5 h-5 accent-black" />
                <label htmlFor="featured" className="text-sm font-bold uppercase tracking-widest">Featured Product</label>
              </div>

              <button type="submit" className="btn-primary w-full py-4 mt-4">
                {editingProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] p-6 md:p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display font-bold uppercase italic">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={() => setIsCategoryModalOpen(false)}><X size={24} /></button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Name</label>
                <input required type="text" className="input-field" value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Slug</label>
                <input required type="text" className="input-field" value={categoryFormData.slug} onChange={e => setCategoryFormData({ ...categoryFormData, slug: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Image URL</label>
                <div className="relative">
                  <input required type="text" className="input-field pr-10" value={categoryFormData.image_url} onChange={e => setCategoryFormData({ ...categoryFormData, image_url: e.target.value })} />
                  <button 
                    type="button"
                    onClick={() => categoryFileInputRef.current?.click()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-black transition-colors"
                  >
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  </button>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    ref={categoryFileInputRef}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIsUploading(true);
                        const formDataUpload = new FormData();
                        formDataUpload.append('image', file);
                        try {
                          const res = await fetch('/api/admin/upload', { method: 'POST', body: formDataUpload });
                          const data = await res.json();
                          if (res.ok) {
                            setCategoryFormData(prev => ({ ...prev, image_url: data.url }));
                            toast.success('Image uploaded successfully');
                          }
                        } finally {
                          setIsUploading(false);
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-4 mt-4">
                {editingCategory ? 'UPDATE CATEGORY' : 'CREATE CATEGORY'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* String Modal */}
      {isStringModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsStringModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] p-6 md:p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display font-bold uppercase italic">
                {editingString ? 'Edit String' : 'Add New String'}
              </h2>
              <button onClick={() => setIsStringModalOpen(false)}><X size={24} /></button>
            </div>

            <form onSubmit={handleStringSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Name</label>
                <input required type="text" className="input-field" value={stringFormData.name} onChange={e => setStringFormData({ ...stringFormData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Price</label>
                <input required type="number" step="0.01" className="input-field" value={Number.isNaN(stringFormData.price) ? '' : stringFormData.price} onChange={e => setStringFormData({ ...stringFormData, price: parseFloat(e.target.value) })} />
              </div>

              <button type="submit" className="btn-primary w-full py-4 mt-4">
                {editingString ? 'UPDATE STRING' : 'CREATE STRING'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmation(null)} />
          <div className="relative bg-white w-full max-w-md rounded-[2rem] p-6 md:p-10 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold uppercase italic mb-4">Confirm Deletion</h2>
            <p className="text-neutral-600 mb-8">{deleteConfirmation.message}</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteConfirmation(null)} 
                className="flex-1 py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-sm border border-black/10 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Filter, X, ChevronDown, Grid2X2, Grid3X3, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridLayout, setGridLayout] = useState<'grid-large' | 'grid-small' | 'list'>('grid-large');

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (searchInput !== currentSearch) {
        if (searchInput) newParams.set('search', searchInput);
        else newParams.delete('search');
        newParams.set('page', '1');
        setSearchParams(newParams);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, searchParams, currentSearch, setSearchParams]);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams);
    if (!params.has('page')) params.set('page', '1');
    params.set('limit', '8'); // Show 8 items per page

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
          setTotalProducts(data.length);
          setTotalPages(1);
          setCurrentPage(1);
        } else {
          setProducts(data.products);
          setTotalProducts(data.total);
          setTotalPages(data.totalPages);
          setCurrentPage(data.page);
        }
        setIsLoading(false);
      });
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const handleCategoryChange = (slug: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug) newParams.set('category', slug);
    else newParams.delete('category');
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', e.target.value);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          {/* Title row */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold uppercase italic">
                {currentCategory ? currentCategory : 'All Equipment'}
              </h1>
              <p className="text-neutral-500 text-sm mt-1 font-mono">{totalProducts} Products found</p>
            </div>

            {/* Mobile filter button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-black/15 rounded-xl hover:bg-black hover:text-white transition-all text-sm font-bold uppercase tracking-widest"
            >
              <Filter size={16} /> Filters
            </button>
          </div>

          {/* Desktop controls row */}
          <div className="hidden md:flex items-center gap-3 border-t border-black/8 pt-5">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-black/30 transition-colors placeholder:text-neutral-400"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className="flex-1" />

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <select
                value={currentSort}
                onChange={handleSortChange}
                className="appearance-none bg-white border border-black/10 rounded-xl px-4 py-2.5 pr-9 text-sm font-mono focus:outline-none focus:border-black/30 transition-colors cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>

            {/* Divider */}
            <div className="w-px h-7 bg-black/10 shrink-0" />

            {/* Grid Layout Toggles */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setGridLayout('grid-large')}
                className={`p-2 rounded-lg transition-colors ${gridLayout === 'grid-large' ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black'}`}
                title="Large Grid"
              >
                <Grid2X2 size={17} />
              </button>
              <button
                onClick={() => setGridLayout('grid-small')}
                className={`p-2 rounded-lg transition-colors ${gridLayout === 'grid-small' ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black'}`}
                title="Small Grid"
              >
                <Grid3X3 size={17} />
              </button>
              <button
                onClick={() => setGridLayout('list')}
                className={`p-2 rounded-lg transition-colors ${gridLayout === 'list' ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black'}`}
                title="List View"
              >
                <List size={17} />
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden mt-3">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-black/30 transition-colors placeholder:text-neutral-400"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 space-y-10">
            <div>
              <h3 className="font-display font-bold uppercase text-sm tracking-widest mb-6">Categories</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleCategoryChange('')}
                  className={`block text-sm transition-colors ${!currentCategory ? 'text-brand-accent font-bold' : 'text-neutral-500 hover:text-black'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`block text-sm transition-colors ${currentCategory === cat.slug ? 'text-brand-accent font-bold' : 'text-neutral-500 hover:text-black'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className={`grid gap-4 sm:gap-8 ${
                gridLayout === 'grid-large' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 
                gridLayout === 'grid-small' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 
                'grid-cols-1'
              }`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`animate-pulse ${gridLayout === 'list' ? 'flex gap-4 sm:gap-6 items-center' : ''}`}>
                    <div className={`${gridLayout === 'list' ? 'w-24 h-24 sm:w-48 sm:h-48' : 'aspect-square mb-3 sm:mb-4'} bg-neutral-100 rounded-xl sm:rounded-2xl shrink-0`} />
                    <div className={gridLayout === 'list' ? 'flex-1' : ''}>
                      <div className="h-3 sm:h-4 bg-neutral-100 rounded w-1/2 mb-2" />
                      <div className="h-4 sm:h-6 bg-neutral-100 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-4 sm:gap-8 ${
                gridLayout === 'grid-large' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 
                gridLayout === 'grid-small' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 
                'grid-cols-1'
              }`}>
                {products.map(product => (
                  <div key={product.id} className={gridLayout === 'list' ? 'flex gap-4 sm:gap-6 items-center bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-black/5' : ''}>
                    {gridLayout === 'list' ? (
                      <>
                        <div className="w-24 h-24 sm:w-48 sm:h-48 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 relative">
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-cover absolute inset-0 text-[10px] text-neutral-400 flex items-center justify-center text-center p-2" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1 truncate">{product.brand}</p>
                          <h3 className="text-base sm:text-2xl font-display font-bold uppercase italic mb-1 sm:mb-2 truncate">{product.name}</h3>
                          <p className="hidden sm:block text-neutral-600 line-clamp-2 mb-4">{product.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mt-2 sm:mt-0">
                            <p className="text-sm sm:text-xl font-bold">${product.price.toFixed(2)}</p>
                            <a href={`/product/${product.slug}`} className="btn-primary py-2 px-4 sm:py-2 sm:px-6 text-xs sm:text-sm whitespace-nowrap text-center w-full sm:w-auto">View Details</a>
                          </div>
                        </div>
                      </>
                    ) : (
                      <ProductCard product={product} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-neutral-50 rounded-[2rem]">
                <p className="text-neutral-500 italic">No products found matching your criteria.</p>
                <button 
                  onClick={() => setSearchParams({})}
                  className="mt-4 text-sm font-bold underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-4 py-2 border border-neutral-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors font-medium text-sm"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                        currentPage === i + 1 
                          ? 'bg-black text-white' 
                          : 'border border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-4 py-2 border border-neutral-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors font-medium text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-white z-[70] p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-display font-bold uppercase italic">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)}><X size={24} /></button>
              </div>

              <div className="space-y-10">
                <div>
                  <h3 className="font-display font-bold uppercase text-sm tracking-widest mb-6">Sort By</h3>
                  <select 
                    value={currentSort}
                    onChange={handleSortChange}
                    className="w-full appearance-none bg-white border border-black/10 rounded-xl px-4 py-3 pr-10 hover:border-black/30 transition-colors focus:outline-none focus:ring-2 focus:ring-black/5 cursor-pointer text-sm font-medium"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-display font-bold uppercase text-sm tracking-widest mb-6">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleCategoryChange('')}
                      className={`px-4 py-2 rounded-full text-sm border ${!currentCategory ? 'bg-black text-white border-black' : 'border-black/10'}`}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`px-4 py-2 rounded-full text-sm border ${currentCategory === cat.slug ? 'bg-black text-white border-black' : 'border-black/10'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsFilterOpen(false)}
                className="btn-primary w-full mt-12"
              >
                SHOW RESULTS
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

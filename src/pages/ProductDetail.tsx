import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, CustomStringOption } from '../types';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { ProductReviews } from '../components/ProductReviews';

export const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  
  // Custom stringing state
  const [stringType, setStringType] = useState<string>('');
  const [stringTension, setStringTension] = useState<number>(24);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [reviewsOpen, setReviewsOpen] = useState(true);

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = { ...product };
    if (product.category_slug === 'rackets' && stringType) {
      cartItem.string_type = stringType;
      cartItem.string_tension = product.lbs || stringTension;
    }
    
    addToCart(cartItem);
  };

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setSelectedImage(data.image_url);
        if (data.category_slug) {
          fetch(`/api/products?category=${data.category_slug}`)
            .then(res => res.json())
            .then(relatedData => {
              if (Array.isArray(relatedData)) {
                // Filter out the current product and limit to 8
                const filtered = relatedData
                  .filter((p: Product) => p.id !== data.id)
                  .slice(0, 8);
                setRelatedProducts(filtered);
              } else {
                setRelatedProducts([]);
              }
            })
            .catch(() => setRelatedProducts([]));
        }
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) return <div className="pt-40 text-center font-mono uppercase tracking-widest text-sm">Loading...</div>;
  if (!product) return <div className="pt-40 text-center font-mono uppercase tracking-widest text-sm">Product not found</div>;

  const customStrings: CustomStringOption[] = product.custom_strings ? JSON.parse(product.custom_strings) : [];
  const additionalImages: string[] = product.images ? JSON.parse(product.images) : [];
  const allImages = [product.image_url, ...additionalImages];

  let specifications: Record<string, string> = {};
  try {
    if (product.specifications) {
      if (typeof product.specifications === 'string') {
        specifications = JSON.parse(product.specifications);
      } else {
        specifications = product.specifications;
      }
    }
  } catch (e) {
    console.error("Error parsing specifications", e);
  }

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/catalog" className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest mb-12 hover:text-[var(--color-brand-accent)] transition-colors">
          <ArrowLeft size={16} /> BACK TO STORE
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-24">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square bg-[var(--color-card)] flex items-center justify-center p-12 relative">
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(img)}
                    className={`w-24 h-24 shrink-0 snap-start bg-[var(--color-card)] p-2 border-2 transition-colors ${selectedImage === img ? 'border-[var(--color-brand-accent)]' : 'border-transparent hover:border-[var(--color-ink)]/20'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8 border-b border-[var(--color-ink)] pb-8">
              <p className="text-xs font-mono text-[var(--color-ink)]/50 uppercase tracking-widest font-bold mb-4">{product.brand}</p>
              <h1 className="text-5xl md:text-7xl font-display font-bold uppercase leading-[0.9] mb-6">
                {product.name}
              </h1>
              <p className="text-2xl font-mono font-bold">{formatCurrency(product.price)}</p>
            </div>

            <div className="font-mono text-sm leading-relaxed mb-10">
              <p>
                {product.description || "No description available for this professional sports equipment. Engineered for performance and durability."}
              </p>
            </div>

            {Object.keys(specifications).length > 0 && (
              <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8 border-b border-[var(--color-ink)] pb-8 font-mono">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/50 mb-2">{key}</p>
                    <p className="font-bold text-sm">{value as string}</p>
                  </div>
                ))}
              </div>
            )}

            {product.category_slug === 'rackets' && (
              <div className="mb-10 bg-[var(--color-card)] p-6 border border-[var(--color-ink)] font-mono">
                <h3 className="font-bold uppercase tracking-widest mb-6 text-sm">Custom Stringing</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/50 mb-2">String Type</label>
                    <select 
                      className="input-field bg-[var(--color-canvas)]"
                      value={stringType}
                      onChange={(e) => setStringType(e.target.value)}
                    >
                      <option value="">Unstrung (Frame Only)</option>
                      {customStrings.map(str => (
                        <option key={str.id} value={str.name}>{str.name} (+{formatCurrency(str.price)})</option>
                      ))}
                    </select>
                  </div>
                  
                  {stringType && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/50 mb-2">
                        Tension: {product.lbs ? `${product.lbs} lbs` : `${stringTension} lbs`}
                      </label>
                      {product.lbs ? (
                        <div className="p-3 bg-[var(--color-canvas)] border border-[var(--color-ink)] text-sm font-bold">
                          {product.lbs} lbs (Fixed Tension)
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" 
                            min="15" 
                            max="35" 
                            step="1"
                            value={Number.isNaN(stringTension) ? 24 : stringTension}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setStringTension(Number.isNaN(val) ? 24 : val);
                            }}
                            className="w-full h-2 bg-[var(--color-ink)]/20 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-accent)]"
                          />
                          <span className="font-bold text-sm w-12 text-right">{stringTension} lbs</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4 font-mono">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink)]/50">Availability:</span>
                <span className={`text-sm font-bold ${product.stock > 0 ? 'text-[var(--color-ink)]' : 'text-red-600'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`w-full py-4 text-sm font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all border border-[var(--color-ink)] ${
                  product.stock <= 0 
                    ? 'bg-[var(--color-card)] text-[var(--color-ink)]/50 cursor-not-allowed' 
                    : 'bg-[var(--color-brand-accent)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-brand-accent)]'
                }`}
              >
                {product.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'} <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Customer Reviews - Collapsible */}
        <div className="border border-[var(--color-ink)] bg-[var(--color-card)] mb-24">
          <button 
            onClick={() => setReviewsOpen(!reviewsOpen)}
            className="w-full flex items-center justify-between p-6 font-display font-bold uppercase text-2xl hover:bg-[var(--color-ink)]/5 transition-colors"
          >
            <span>Customer Reviews</span>
            {reviewsOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          <AnimatePresence>
            {reviewsOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 border-t border-[var(--color-ink)]">
                  <ProductReviews productId={product.id} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Related Products - Horizontal Scroll */}
        {relatedProducts.length > 0 && (
          <div className="pt-24 border-t border-[var(--color-ink)]">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-display font-bold uppercase">Related</h2>
              <Link to={`/catalog?category=${product.category_slug}`} className="text-xs font-mono font-bold uppercase tracking-widest hover:text-[var(--color-brand-accent)] transition-colors">
                View All {product.category_name}
              </Link>
            </div>
            <div className="flex overflow-x-auto snap-x gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
              {relatedProducts.map(relatedProduct => (
                <Link to={`/product/${relatedProduct.slug}`} key={relatedProduct.id} className="group block w-64 sm:w-72 shrink-0 snap-start">
                  <div className="aspect-square bg-[var(--color-card)] mb-4 flex items-center justify-center p-8 relative overflow-hidden">
                    <img 
                      src={relatedProduct.image_url} 
                      alt={relatedProduct.name}
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-display text-xl leading-none group-hover:text-[var(--color-brand-accent)] transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-mono text-sm font-bold">{formatCurrency(relatedProduct.price)}</span>
                      <button className="w-8 h-8 bg-[var(--color-brand-accent)] flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-brand-accent)] transition-colors">
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

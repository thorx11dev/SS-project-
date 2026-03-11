import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { motion } from 'motion/react';
import { formatCurrency } from '../utils/format';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-100 relative">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        
        {product.stock > 0 ? (
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-xl translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-brand-accent"
          >
            <ShoppingCart size={20} />
          </button>
        ) : (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <span className="bg-black text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
              Out of Stock
            </span>
          </div>
        )}

        {product.is_featured === 1 && (
          <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
            Featured
          </span>
        )}
      </div>

      <Link to={`/product/${product.slug}`} className="mt-3 sm:mt-4 block">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-4">
          <div>
            <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-widest font-bold mb-1">{product.brand}</p>
            <h3 className="font-display font-bold text-sm sm:text-lg leading-tight group-hover:text-neutral-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </div>
          <p className="font-display font-bold text-sm sm:text-lg">{formatCurrency(product.price)}</p>
        </div>
      </Link>
    </motion.div>
  );
};

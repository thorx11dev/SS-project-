import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Play } from 'lucide-react';
import { Category } from '../types';

export const Home = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
    
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] pt-20 md:pt-24 pb-4 px-4 md:px-6 flex flex-col gap-4">
      
      {/* Hero & Horizontal Categories Layout */}
      <div className="flex flex-col gap-3 md:gap-4">
        
        {/* Main Hero Cell - Full Width */}
        <div className="w-full relative rounded-3xl overflow-hidden bg-black group h-[65vh] md:h-[75vh]">
          {/* Background Media */}
          <div className="absolute inset-0 z-0">
            <img 
              src={settings.hero_image || "https://images.unsplash.com/photo-1626224583764-847890e05851?q=80&w=2070&auto=format&fit=crop"} 
              alt="Professional Badminton Player in Action" 
              className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-10">
            {/* Top Badge - Removed 2026 Collection */}
            <div className="flex justify-between items-start">
            </div>

            {/* Kinetic Typography Headline - Removed Precision Redefined */}
            <div className="mt-auto mb-20 md:mb-0 relative">
            </div>

            {/* Mobile Thumb Zone CTA (Bottom Center) */}
            <div className="md:hidden absolute bottom-6 left-6 right-6 z-20">
               <Link 
                to="/catalog" 
                className="w-full bg-[var(--color-brand-accent)] text-black py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,255,0,0.3)] active:scale-95 transition-transform"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
            </div>

            {/* Desktop CTA (Bottom Left) */}
            <div className="hidden md:flex items-center gap-4 mt-8">
               <Link 
                to="/catalog" 
                className="group/btn relative px-8 py-4 bg-[var(--color-brand-accent)] text-black rounded-full font-bold uppercase tracking-widest text-xs overflow-hidden transition-all hover:pr-12 hover:shadow-[0_0_30px_rgba(212,255,0,0.4)]"
              >
                <span className="relative z-10">Shop Collection</span>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-100 transition-all duration-300 transform translate-x-2 group-hover/btn:translate-x-0">
                  <ArrowRight size={16} />
                </div>
              </Link>
              <button className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors hover:scale-110 active:scale-95">
                <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Categories Section */}
        <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={`/catalog?category=${category.slug}`} 
              className="min-w-[280px] md:min-w-[380px] h-48 md:h-64 relative rounded-3xl overflow-hidden bg-neutral-900 group snap-start shrink-0"
            >
              <img 
                src={category.image_url || "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=2076&auto=format&fit=crop"} 
                alt={category.name} 
                className="w-full h-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-display text-xl md:text-3xl text-white uppercase italic">{category.name}</h3>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white group-hover:bg-[var(--color-brand-accent)] group-hover:text-black transition-all group-hover:rotate-45">
                    <ArrowUpRight size={16} className="md:w-[18px] md:h-[18px]" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Marquee Strip (Below Grid) */}
      <div className="w-full overflow-hidden py-2 border-y border-[var(--color-ink)]/5">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(6)].map((_, i) => (
             <span key={i} className="text-[var(--color-ink)] font-mono text-xs uppercase tracking-widest mx-8 flex items-center gap-4 opacity-60">
               <span className="w-1.5 h-1.5 bg-[var(--color-brand-accent)] rounded-full" />
               {settings.marquee_text || "Free Shipping on Orders Over $100 • Official Distributor • Student Discounts Available"}
             </span>
          ))}
        </div>
      </div>

    </div>
  );
};

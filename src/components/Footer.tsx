import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';

export const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
  }, []);

  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
          {/* Brand & Description */}
          <div className="max-w-xs">
            <Link to="/" className="font-display font-bold text-3xl tracking-tighter uppercase mb-4 block">
              K  A  S  H  I  F  &nbsp;  S  P  O  R  T  S
            </Link>
            <p className="text-neutral-400 font-mono text-xs uppercase tracking-widest leading-relaxed">
              Your Ultimate Destination for All Sports.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-4 font-mono text-xs uppercase tracking-widest font-bold md:text-right">
            <p className="text-neutral-500 mb-2">Categories</p>
            {categories.map(cat => (
              <Link key={cat.id} to={`/catalog?category=${cat.slug}`} className="hover:text-[var(--color-brand-accent)] transition-colors">{cat.name}</Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-neutral-500 border-t border-white/10 pt-8">
          <p>© {new Date().getFullYear()} KS KASHIF SPORTS. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};

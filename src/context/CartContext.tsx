import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product | CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product | CartItem) => {
    const p = product as CartItem;
    const cartItemId = p.cartItemId || `${product.id}-${p.string_type || 'none'}-${p.string_tension || 'none'}`;
    
    const existing = cart.find(item => item.cartItemId === cartItemId);
    
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`Only ${product.stock} items in stock`);
        return;
      }
      toast.success(`Added another ${product.name} to cart`);
    } else {
      if (product.stock <= 0) {
        toast.error('This item is out of stock');
        return;
      }
      toast.success(`${product.name} added to cart`);
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.cartItemId === cartItemId);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          return prev;
        }
        return prev.map(item => 
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      if (product.stock <= 0) {
        return prev;
      }
      
      return [...prev, { ...product, quantity: 1, cartItemId }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    
    const item = cart.find(i => i.cartItemId === cartItemId);
    if (item && quantity > item.stock) {
      toast.error(`Only ${item.stock} items in stock`);
      return;
    }

    setCart(prev => {
      const prevItem = prev.find(i => i.cartItemId === cartItemId);
      if (prevItem && quantity > prevItem.stock) {
        return prev;
      }
      return prev.map(i => 
        i.cartItemId === cartItemId ? { ...i, quantity } : i
      );
    });
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export interface Category {
  id: number;
  name: string;
  slug: string;
  brands?: string; // JSON string array of brands
  image_url?: string;
}

export interface CustomStringOption {
  id: number;
  name: string;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  brand: string;
  image_url: string;
  images?: string; // JSON string array of extra image URLs
  custom_strings?: string; // JSON string of CustomStringOption[]
  stock: number;
  is_featured: number;
  weight?: string; // e.g., '3U', '4U'
  grip_size?: string; // e.g., 'G4', 'G5'
  lbs?: number | null;
  specifications?: string; // JSON string of Record<string, string>
}

export interface HomepageSettings {
  header_image?: string;
  marquee_text?: string;
  category_images?: string; // JSON string mapping category slug to image URL
  delivery_cost?: number;
}

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  string_type?: string;
  string_tension?: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  string_type?: string;
  string_tension?: number;
  product_name?: string;
  lbs?: number | null;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_zip?: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
}

export interface Review {
  id: number;
  product_id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface DashboardStats {
  totalSales: number;
  orderCount: number;
  productCount: number;
  lowStock: number;
}

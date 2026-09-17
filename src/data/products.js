export const PRODUCTS_DATA = [
  {
    id: 'p1',
    name: 'Wireless ANC Studio Headphones',
    category: 'electronics',
    categoryLabel: 'Audio & Electronics',
    price: 9999,
    oldPrice: 14999,
    discount: '-33%',
    rating: 4.8,
    ratingCount: 412,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    badge: 'BEST SELLER'
  },
  {
    id: 'p2',
    name: 'Smart Fitness Watch Series X',
    category: 'electronics',
    categoryLabel: 'Wearables',
    price: 6999,
    oldPrice: 8999,
    discount: '-22%',
    rating: 5.0,
    ratingCount: 850,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    badge: 'DEAL'
  },
  {
    id: 'p3',
    name: 'Pro Speed Athletic Sneakers',
    category: 'fashion',
    categoryLabel: 'Fashion Footwear',
    price: 5499,
    oldPrice: 8999,
    discount: '-38%',
    rating: 4.0,
    ratingCount: 310,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    badge: 'HOT DEAL'
  },
  {
    id: 'p4',
    name: 'UltraSlim Pro 14" Laptop M2',
    category: 'electronics',
    categoryLabel: 'Computers',
    price: 64990,
    oldPrice: 74990,
    discount: '-13%',
    rating: 5.0,
    ratingCount: 1240,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80',
    badge: 'TRENDING'
  },
  {
    id: 'p5',
    name: 'Polarized Retro Sunglasses',
    category: 'fashion',
    categoryLabel: 'Fashion Accessories',
    price: 2499,
    oldPrice: 3499,
    discount: '-28%',
    rating: 4.2,
    ratingCount: 156,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80',
    badge: 'POPULAR'
  },
  {
    id: 'p6',
    name: 'Waterproof College Laptop Backpack',
    category: 'fashion',
    categoryLabel: 'Bags & Travel',
    price: 3299,
    oldPrice: 3999,
    discount: '-17%',
    rating: 4.5,
    ratingCount: 620,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80',
    badge: 'ESSENTIAL'
  },
  {
    id: 'p7',
    name: 'True Wireless Earbuds with Charging Case',
    category: 'electronics',
    categoryLabel: 'Audio & Electronics',
    price: 4499,
    oldPrice: 5499,
    discount: '-18%',
    rating: 4.9,
    ratingCount: 980,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
    badge: 'NEW'
  },
  {
    id: 'p8',
    name: 'Vintage Instant Mini Camera',
    category: 'electronics',
    categoryLabel: 'Photography',
    price: 5299,
    oldPrice: 6499,
    discount: '-18%',
    rating: 4.7,
    ratingCount: 3410,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80',
    badge: 'BESTSELLER'
  },
  {
    id: 'p9',
    name: 'LED Touch Control Desk Lamp',
    category: 'home',
    categoryLabel: 'Home & Office',
    price: 2199,
    oldPrice: 2899,
    discount: '-24%',
    rating: 4.6,
    ratingCount: 1120,
    image: 'https://images.unsplash.com/photo-1507764923504-cd90bf7da772?auto=format&fit=crop&w=400&q=80',
    badge: 'STUDY AID'
  }
];

export function formatINR(amount) {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

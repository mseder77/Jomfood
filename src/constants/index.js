// Application Constants
export const APP_CONFIG = {
  APP_NAME: 'JomFood',
  APP_TAGLINE: 'Food Delivery Service'
};

// Filter Options
export const DIETARY_OPTIONS = [
  { id: 'halal', label: 'Halal', value: 'halal' },
  { id: 'muslim-owned', label: 'Muslim Owned', value: 'muslim-owned' },
  { id: 'healthy-eats', label: 'Healthy Eats', value: 'healthy-eats' }
];

export const DISH_OPTIONS = [
  { id: 'kueh-kueh', label: 'Kueh Kueh', value: 'kueh-kueh' },
  { id: 'burgers-pizzas', label: 'Burgers & Pizzas', value: 'burgers-pizzas' },
  { id: 'snacks', label: 'Snacks', value: 'snacks' },
  { id: 'drinks-desserts', label: 'Drinks & Desserts', value: 'drinks-desserts' },
  { id: 'grocers-delis', label: 'Grocers & Delis', value: 'grocers-delis' },
  { id: 'seafood', label: 'Seafood', value: 'seafood' }
];

export const RECOMMENDATION_OPTIONS = [
  { id: 'new-on-oddle', label: 'New on Oddle Eats', value: 'new-on-oddle' },
  { id: 'trending', label: 'Trending on Oddle Eats', value: 'trending' },
  { id: 'fast-food', label: 'Fast Food', value: 'fast-food' },
  { id: 'catering', label: 'Catering', value: 'catering' }
];

export const BAKERY_DEALS_OPTIONS = [
  { id: 'sweet-savoury', label: 'Sweet and Savoury Treats', value: 'sweet-savoury' }
];

export const CUISINE_OPTIONS = [
  { id: 'western', label: 'Western', value: 'western' },
  { id: 'chinese', label: 'Chinese', value: 'chinese' },
  { id: 'malay', label: 'Malay', value: 'malay' },
  { id: 'indian', label: 'Indian', value: 'indian' },
  { id: 'thai', label: 'Thai', value: 'thai' },
  { id: 'japanese', label: 'Japanese', value: 'japanese' },
  { id: 'korean', label: 'Korean', value: 'korean' }
];

// Delivery Options
export const DELIVERY_OPTIONS = [
  { id: 'delivery', label: 'Delivery', value: 'delivery' },
  { id: 'pickup', label: 'Pickup', value: 'pickup' }
];

export const FOOD_TYPE_OPTIONS = [
  { id: 'all', label: 'All Food Types', value: 'all' },
  { id: 'main-course', label: 'Main Course', value: 'main-course' },
  { id: 'desserts', label: 'Desserts', value: 'desserts' },
  { id: 'beverages', label: 'Beverages', value: 'beverages' }
];

export const LOCATION_OPTIONS = [
  { id: 'kl', label: 'Kuala Lumpur', value: 'kl' },
  { id: 'pj', label: 'Petaling Jaya', value: 'pj' },
  { id: 'shah-alam', label: 'Shah Alam', value: 'shah-alam' },
  { id: 'subang', label: 'Subang Jaya', value: 'subang' }
];

// Sort Options
export const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended', value: 'recommended' },
  { id: 'nearest', label: 'Nearest to Me', value: 'nearest' }
  // TODO: Uncomment when backend supports these sorting options
  // { id: 'rating', label: 'Rating', value: 'rating' },
  // { id: 'delivery-time', label: 'Delivery Time', value: 'delivery-time' },
  // { id: 'price-low', label: 'Price: Low to High', value: 'price-low' },
  // { id: 'price-high', label: 'Price: High to Low', value: 'price-high' }
];

// Mock Data for Development
export const MOCK_RESTAURANTS = [
  {
    id: 1,
    name: 'Sala Kuala Lumpur',
    cuisine: 'Western',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=300&fit=crop&crop=center',
    rating: 4.5,
    deliveryTime: '12:00PM',
    minOrder: 'RM0',
    deliveryFee: 'From RM5',
    isFavorite: false,
    additionalImages: []
  },
  {
    id: 2,
    name: 'Nook By Aloft Kuala Lumpur Sentral',
    cuisine: 'Western',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=300&fit=crop&crop=center',
    rating: 4.3,
    deliveryTime: '12:30PM',
    minOrder: 'RM15',
    deliveryFee: 'From RM3',
    isFavorite: false,
    additionalImages: []
  },
  {
    id: 3,
    name: 'Le Pont Boulangerie Et Café',
    cuisine: 'Western',
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=300&h=300&fit=crop&crop=center',
    rating: 4.7,
    deliveryTime: '11:45AM',
    minOrder: 'RM20',
    deliveryFee: 'From RM4',
    isFavorite: true,
    additionalImages: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=300&fit=crop&crop=center'
    ]
  },
  {
    id: 4,
    name: 'Burger On 16',
    cuisine: 'Western',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=300&fit=crop&crop=center',
    rating: 4.2,
    deliveryTime: '12:15PM',
    minOrder: 'RM10',
    deliveryFee: 'From RM2',
    isFavorite: false,
    additionalImages: []
  }
];

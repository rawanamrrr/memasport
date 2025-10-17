const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mema-sports';

const sportsProducts = [
  // Sports Equipment
  {
    id: 'pro-basketball-hoop',
    name: 'Professional Basketball Hoop System',
    description: 'Professional-grade basketball hoop with tempered glass backboard and adjustable height',
    longDescription: 'Built for serious players and professional training. Features a 72" tempered glass backboard, heavy-duty steel construction, and height adjustment from 7.5 to 10 feet.',
    price: 1299.99,
    beforeSalePrice: 1599.99,
    afterSalePrice: 1299.99,
    sizes: [
      { size: 'Standard', volume: '72" Backboard', originalPrice: 1599.99, discountedPrice: 1299.99 },
      { size: 'Pro', volume: '84" Backboard', originalPrice: 1899.99, discountedPrice: 1499.99 }
    ],
    images: ['/placeholder-sports-equipment.jpg'],
    rating: 4.8,
    reviews: 156,
    specifications: {
      material: ['Tempered Glass', 'Heavy-duty Steel', 'Powder-coated Finish'],
      features: ['Height Adjustable', 'Shock Absorbing', 'Weather Resistant'],
      dimensions: ['72" x 42" Backboard', '10ft Height Range', '4ft Extension']
    },
    category: 'equipment',
    isNew: false,
    isBestseller: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'elite-soccer-goal',
    name: 'Elite Professional Soccer Goal',
    description: 'FIFA-approved professional soccer goal for training and competition',
    longDescription: 'Meets FIFA standards for professional play. Constructed with heavy-duty aluminum frame and professional netting system.',
    price: 899.99,
    beforeSalePrice: 1099.99,
    afterSalePrice: 899.99,
    sizes: [
      { size: '8x24', volume: '8ft x 24ft', originalPrice: 1099.99, discountedPrice: 899.99 },
      { size: '8x8', volume: '8ft x 8ft', originalPrice: 599.99, discountedPrice: 499.99 }
    ],
    images: ['/placeholder-sports-equipment.jpg'],
    rating: 4.7,
    reviews: 89,
    specifications: {
      material: ['Heavy-duty Aluminum', 'Professional Netting', 'Steel Anchors'],
      features: ['FIFA Approved', 'Weather Resistant', 'Easy Assembly'],
      dimensions: ['24ft x 8ft x 2.5ft', 'Portable Design', 'Quick Setup']
    },
    category: 'equipment',
    isNew: true,
    isBestseller: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'premium-tennis-racket',
    name: 'Premium Carbon Fiber Tennis Racket',
    description: 'Professional-grade tennis racket with advanced carbon fiber construction',
    longDescription: 'Used by professional players worldwide. Features advanced carbon fiber technology for maximum power and control.',
    price: 299.99,
    beforeSalePrice: 399.99,
    afterSalePrice: 299.99,
    sizes: [
      { size: 'L3', volume: '4 3/8" Grip', originalPrice: 399.99, discountedPrice: 299.99 },
      { size: 'L4', volume: '4 1/2" Grip', originalPrice: 399.99, discountedPrice: 299.99 },
      { size: 'L5', volume: '4 5/8" Grip', originalPrice: 399.99, discountedPrice: 299.99 }
    ],
    images: ['/placeholder-sports-equipment.jpg'],
    rating: 4.9,
    reviews: 234,
    specifications: {
      material: ['Carbon Fiber', 'Titanium Alloy', 'Synthetic Grip'],
      features: ['Professional Grade', 'Power & Control', 'Shock Absorption'],
      dimensions: ['27" Length', '100 sq in Head', '11.5 oz Weight']
    },
    category: 'equipment',
    isNew: false,
    isBestseller: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Athletic Apparel
  {
    id: 'elite-training-shorts',
    name: 'Elite Training Shorts',
    description: 'High-performance training shorts with moisture-wicking technology',
    longDescription: 'Designed for intense training sessions. Features advanced moisture-wicking fabric and ergonomic design for maximum comfort.',
    price: 79.99,
    beforeSalePrice: 99.99,
    afterSalePrice: 79.99,
    sizes: [
      { size: 'S', volume: 'Small', originalPrice: 99.99, discountedPrice: 79.99 },
      { size: 'M', volume: 'Medium', originalPrice: 99.99, discountedPrice: 79.99 },
      { size: 'L', volume: 'Large', originalPrice: 99.99, discountedPrice: 79.99 },
      { size: 'XL', volume: 'Extra Large', originalPrice: 99.99, discountedPrice: 79.99 }
    ],
    images: ['/placeholder-sports-apparel.jpg'],
    rating: 4.6,
    reviews: 178,
    specifications: {
      material: ['Moisture-wicking Polyester', 'Spandex Blend', 'Mesh Panels'],
      features: ['Quick Dry', '4-way Stretch', 'Anti-odor Technology'],
      dimensions: ['7" Inseam', 'Elastic Waistband', 'Side Pockets']
    },
    category: 'apparel',
    isNew: true,
    isBestseller: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pro-compression-shirt',
    name: 'Professional Compression Shirt',
    description: 'Athletic compression shirt for enhanced performance and muscle support',
    longDescription: 'Engineered for professional athletes. Provides targeted compression for improved circulation and muscle support during intense workouts.',
    price: 89.99,
    beforeSalePrice: 119.99,
    afterSalePrice: 89.99,
    sizes: [
      { size: 'S', volume: 'Small', originalPrice: 119.99, discountedPrice: 89.99 },
      { size: 'M', volume: 'Medium', originalPrice: 119.99, discountedPrice: 89.99 },
      { size: 'L', volume: 'Large', originalPrice: 119.99, discountedPrice: 89.99 },
      { size: 'XL', volume: 'Extra Large', originalPrice: 119.99, discountedPrice: 89.99 }
    ],
    images: ['/placeholder-sports-apparel.jpg'],
    rating: 4.8,
    reviews: 145,
    specifications: {
      material: ['Compression Polyester', 'Elastane Blend', 'Seamless Construction'],
      features: ['Muscle Support', 'Moisture Management', 'UV Protection'],
      dimensions: ['Sleeveless Design', 'Form-fitting Cut', 'Flatlock Seams']
    },
    category: 'apparel',
    isNew: false,
    isBestseller: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Accessories
  {
    id: 'premium-sports-bag',
    name: 'Premium Sports Equipment Bag',
    description: 'Professional-grade sports bag with multiple compartments and durable construction',
    longDescription: 'Perfect for athletes who need to carry multiple pieces of equipment. Features specialized compartments and heavy-duty construction.',
    price: 149.99,
    beforeSalePrice: 199.99,
    afterSalePrice: 149.99,
    sizes: [
      { size: 'Standard', volume: '45L Capacity', originalPrice: 199.99, discountedPrice: 149.99 },
      { size: 'Large', volume: '65L Capacity', originalPrice: 249.99, discountedPrice: 189.99 }
    ],
    images: ['/placeholder-sports-accessories.jpg'],
    rating: 4.7,
    reviews: 92,
    specifications: {
      material: ['Heavy-duty Nylon', 'Reinforced Zippers', 'Padded Straps'],
      features: ['Multiple Compartments', 'Water Resistant', 'Lifetime Warranty'],
      dimensions: ['24" x 14" x 12"', 'Adjustable Straps', 'Side Pockets']
    },
    category: 'accessories',
    isNew: false,
    isBestseller: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'elite-sports-headband',
    name: 'Elite Sports Headband Set',
    description: 'High-performance headband set for intense training sessions',
    longDescription: 'Designed to stay in place during the most intense workouts. Features moisture-wicking fabric and comfortable fit.',
    price: 24.99,
    beforeSalePrice: 34.99,
    afterSalePrice: 24.99,
    sizes: [
      { size: 'One Size', volume: 'Fits All', originalPrice: 34.99, discountedPrice: 24.99 }
    ],
    images: ['/placeholder-sports-accessories.jpg'],
    rating: 4.5,
    reviews: 67,
    specifications: {
      material: ['Moisture-wicking Fabric', 'Elastic Band', 'Silicone Grip'],
      features: ['Sweat Absorption', 'Non-slip Design', 'Machine Washable'],
      dimensions: ['One Size Fits All', '2" Width', 'Stretchy Material']
    },
    category: 'accessories',
    isNew: true,
    isBestseller: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Outlet Items
  {
    id: 'outlet-basketball-shoes',
    name: 'Outlet Basketball Shoes (Limited Stock)',
    description: 'Previous season basketball shoes at incredible outlet prices',
    longDescription: 'High-performance basketball shoes from last season. Still in excellent condition with full performance features.',
    price: 89.99,
    beforeSalePrice: 199.99,
    afterSalePrice: 89.99,
    sizes: [
      { size: '8', volume: 'Size 8', originalPrice: 199.99, discountedPrice: 89.99 },
      { size: '9', volume: 'Size 9', originalPrice: 199.99, discountedPrice: 89.99 },
      { size: '10', volume: 'Size 10', originalPrice: 199.99, discountedPrice: 89.99 },
      { size: '11', volume: 'Size 11', originalPrice: 199.99, discountedPrice: 89.99 }
    ],
    images: ['/placeholder-sports-outlet.jpg'],
    rating: 4.4,
    reviews: 45,
    specifications: {
      material: ['Leather Upper', 'Rubber Sole', 'Foam Cushioning'],
      features: ['Ankle Support', 'Traction Control', 'Breathable'],
      dimensions: ['High-top Design', 'Lace-up Closure', 'Padded Collar']
    },
    category: 'outlet',
    isNew: false,
    isBestseller: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Clear existing products
    await db.collection('products').deleteMany({});
    console.log('Cleared existing products');
    
    // Insert new sports products
    const result = await db.collection('products').insertMany(sportsProducts);
    console.log(`Inserted ${result.insertedCount} sports products`);
    
    // Create indexes for better performance
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ isBestseller: 1 });
    await db.collection('products').createIndex({ isActive: 1 });
    await db.collection('products').createIndex({ price: 1 });
    console.log('Created database indexes');
    
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();


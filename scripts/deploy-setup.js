const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mema-sports';

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Create collections if they don't exist
    const collections = ['products', 'users', 'orders', 'reviews', 'favorites', 'cart'];
    
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) { // Collection already exists
          console.log(`Collection ${collectionName} already exists`);
        } else {
          throw error;
        }
      }
    }
    
    // Create indexes for better performance
    console.log('Creating database indexes...');
    
    // Products indexes
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ isBestseller: 1 });
    await db.collection('products').createIndex({ isActive: 1 });
    await db.collection('products').createIndex({ price: 1 });
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    
    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    
    // Orders indexes
    await db.collection('orders').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    
    // Reviews indexes
    await db.collection('reviews').createIndex({ productId: 1 });
    await db.collection('reviews').createIndex({ userId: 1 });
    await db.collection('reviews').createIndex({ rating: 1 });
    
    console.log('Database setup completed successfully!');
    console.log('You can now run: node scripts/seed-sports-database.js');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.close();
  }
}

setupDatabase();


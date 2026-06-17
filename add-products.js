// Simple script to add test products to PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Digitiva%3C%2F%3E2025@localhost:5432/mema_sports'
});

async function addProducts() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adding test products...\n');

    // Equipment Products
    console.log('Adding Equipment products...');
    await client.query(`
      INSERT INTO products (id, name, description, long_description, images, category, is_active, is_new, is_bestseller, rating, reviews)
      VALUES 
        ('equipment-1', 'Professional Sports Equipment Set', 'Complete professional-grade equipment for serious athletes', 'High-quality sports equipment designed for professional use. Includes everything you need to train like a pro.', ARRAY['/placeholder-sports-equipment.jpg'], 'equipment', true, true, false, 4.5, 12),
        ('equipment-2', 'Training Equipment Bundle', 'Essential training gear for all levels', 'Perfect for beginners and intermediate athletes. Quality equipment at an affordable price.', ARRAY['/placeholder-sports-equipment.jpg'], 'equipment', true, false, true, 4.8, 25),
        ('equipment-3', 'Elite Performance Gear', 'Top-tier equipment for elite athletes', 'The best of the best. Used by professional athletes worldwide.', ARRAY['/placeholder-sports-equipment.jpg'], 'equipment', true, true, true, 5.0, 45)
      ON CONFLICT (id) DO NOTHING
    `);

    await client.query(`
      INSERT INTO product_sizes (product_id, size, volume, original_price, discounted_price)
      VALUES 
        ('equipment-1', 'Standard', 'Full Set', 1500.00, 1299.00),
        ('equipment-1', 'Premium', 'Full Set + Extras', 2000.00, 1799.00),
        ('equipment-2', 'Basic', 'Starter Pack', 800.00, 699.00),
        ('equipment-2', 'Standard', 'Complete Pack', 1200.00, 999.00),
        ('equipment-3', 'Professional', 'Elite Set', 3000.00, 2699.00)
    `);

    // Apparel Products
    console.log('Adding Apparel products...');
    await client.query(`
      INSERT INTO products (id, name, description, long_description, images, category, is_active, is_new, is_bestseller, rating, reviews)
      VALUES 
        ('apparel-1', 'Performance Athletic Wear', 'High-performance athletic apparel', 'Breathable, moisture-wicking fabric designed for maximum performance and comfort.', ARRAY['/placeholder-sports-apparel.jpg'], 'apparel', true, true, false, 4.6, 18),
        ('apparel-2', 'Training Outfit Set', 'Complete training outfit for all sports', 'Versatile athletic wear suitable for any sport or training session.', ARRAY['/placeholder-sports-apparel.jpg'], 'apparel', true, false, true, 4.7, 32),
        ('apparel-3', 'Pro Athlete Collection', 'Premium athletic wear collection', 'Worn by professional athletes. Superior quality and design.', ARRAY['/placeholder-sports-apparel.jpg'], 'apparel', true, true, true, 4.9, 56)
      ON CONFLICT (id) DO NOTHING
    `);

    await client.query(`
      INSERT INTO product_sizes (product_id, size, volume, original_price, discounted_price)
      VALUES 
        ('apparel-1', 'Small', 'S', 450.00, 399.00),
        ('apparel-1', 'Medium', 'M', 450.00, 399.00),
        ('apparel-1', 'Large', 'L', 450.00, 399.00),
        ('apparel-1', 'X-Large', 'XL', 500.00, 449.00),
        ('apparel-2', 'Small', 'S', 600.00, 499.00),
        ('apparel-2', 'Medium', 'M', 600.00, 499.00),
        ('apparel-2', 'Large', 'L', 600.00, 499.00),
        ('apparel-3', 'Medium', 'M', 900.00, 799.00),
        ('apparel-3', 'Large', 'L', 900.00, 799.00)
    `);

    // Accessories Products
    console.log('Adding Accessories products...');
    await client.query(`
      INSERT INTO products (id, name, description, long_description, images, category, is_active, is_new, is_bestseller, rating, reviews)
      VALUES 
        ('accessories-1', 'Training Accessories Pack', 'Essential training accessories', 'Everything you need to enhance your training sessions.', ARRAY['/placeholder-sports-accessories.jpg'], 'accessories', true, false, true, 4.4, 28),
        ('accessories-2', 'Sports Gear Bundle', 'Complete accessories bundle', 'All the accessories you need in one convenient package.', ARRAY['/placeholder-sports-accessories.jpg'], 'accessories', true, true, false, 4.5, 15),
        ('accessories-3', 'Premium Accessories Set', 'High-end sports accessories', 'Premium quality accessories for serious athletes.', ARRAY['/placeholder-sports-accessories.jpg'], 'accessories', true, false, true, 4.8, 42)
      ON CONFLICT (id) DO NOTHING
    `);

    await client.query(`
      INSERT INTO product_sizes (product_id, size, volume, original_price, discounted_price)
      VALUES 
        ('accessories-1', 'Standard', 'Complete Set', 300.00, 249.00),
        ('accessories-2', 'Basic', 'Essential Pack', 200.00, 179.00),
        ('accessories-2', 'Premium', 'Full Pack', 400.00, 349.00),
        ('accessories-3', 'Professional', 'Elite Set', 600.00, 499.00)
    `);

    // Outlet Products
    console.log('Adding Outlet products...');
    await client.query(`
      INSERT INTO products (id, name, description, long_description, images, category, is_active, is_new, is_bestseller, rating, reviews)
      VALUES 
        ('outlet-1', 'Clearance Sports Bundle', 'Amazing clearance deal', 'High-quality products at unbeatable prices. Limited stock!', ARRAY['/placeholder-sports-outlet.jpg'], 'outlet', true, false, true, 4.3, 67),
        ('outlet-2', 'Special Offer Pack', 'Limited time special offer', 'Don''t miss this incredible deal on premium sports equipment.', ARRAY['/placeholder-sports-outlet.jpg'], 'outlet', true, true, true, 4.6, 89),
        ('outlet-3', 'Discount Equipment Set', 'Huge discount on quality gear', 'Save big on professional-grade equipment.', ARRAY['/placeholder-sports-outlet.jpg'], 'outlet', true, false, false, 4.2, 34)
      ON CONFLICT (id) DO NOTHING
    `);

    await client.query(`
      INSERT INTO product_sizes (product_id, size, volume, original_price, discounted_price)
      VALUES 
        ('outlet-1', 'Mixed', 'Various Items', 1000.00, 499.00),
        ('outlet-2', 'Standard', 'Complete Bundle', 1500.00, 699.00),
        ('outlet-3', 'Large', 'Full Set', 2000.00, 899.00)
    `);

    // Get counts
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    const sizeCount = await client.query('SELECT COUNT(*) FROM product_sizes');

    console.log('\n✅ Success!');
    console.log(`📦 Total products: ${productCount.rows[0].count}`);
    console.log(`📏 Total sizes: ${sizeCount.rows[0].count}`);
    console.log('\n🎉 All test products added successfully!');
    console.log('\nRefresh your browser to see the products!');

  } catch (error) {
    console.error('❌ Error adding products:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addProducts();

// Database Management Script
const { Pool } = require('pg');
const readline = require('readline');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Digitiva%3C%2F%3E2025@localhost:5432/mema_sports'
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function showMenu() {
  console.clear();
  console.log('╔════════════════════════════════════════╗');
  console.log('║   MEMA SPORTS - DATABASE MANAGER      ║');
  console.log('╚════════════════════════════════════════╝\n');
  console.log('1. View all products');
  console.log('2. View products by category');
  console.log('3. Add a product');
  console.log('4. Delete a product');
  console.log('5. View all orders');
  console.log('6. View database stats');
  console.log('7. Backup database');
  console.log('8. Clear all products');
  console.log('9. Exit\n');
}

async function viewAllProducts() {
  const result = await pool.query(`
    SELECT id, name, category, rating, reviews, is_active 
    FROM products 
    ORDER BY category, name
  `);
  
  console.log('\n📦 ALL PRODUCTS:\n');
  result.rows.forEach(p => {
    const status = p.is_active ? '✅' : '❌';
    console.log(`${status} [${p.category}] ${p.name} (${p.id})`);
    console.log(`   ⭐ ${p.rating} (${p.reviews} reviews)\n`);
  });
}

async function viewProductsByCategory() {
  const category = await question('\nEnter category (equipment/apparel/accessories/outlet): ');
  
  const result = await pool.query(`
    SELECT p.*, 
           json_agg(
             json_build_object(
               'size', ps.size,
               'volume', ps.volume,
               'price', ps.original_price
             )
           ) FILTER (WHERE ps.id IS NOT NULL) as sizes
    FROM products p
    LEFT JOIN product_sizes ps ON p.id = ps.product_id
    WHERE p.category = $1
    GROUP BY p.id
    ORDER BY p.name
  `, [category]);
  
  console.log(`\n📦 ${category.toUpperCase()} PRODUCTS:\n`);
  result.rows.forEach(p => {
    console.log(`${p.name} (${p.id})`);
    console.log(`  Description: ${p.description}`);
    console.log(`  Rating: ⭐ ${p.rating} (${p.reviews} reviews)`);
    console.log(`  Active: ${p.is_active ? 'Yes' : 'No'}`);
    if (p.sizes && p.sizes.length > 0) {
      console.log(`  Sizes: ${p.sizes.map(s => `${s.size} (EGP${s.price})`).join(', ')}`);
    }
    console.log('');
  });
}

async function addProduct() {
  console.log('\n➕ ADD NEW PRODUCT\n');
  
  const id = await question('Product ID (e.g., equipment-4): ');
  const name = await question('Product Name: ');
  const description = await question('Description: ');
  const category = await question('Category (equipment/apparel/accessories/outlet): ');
  const rating = await question('Rating (0-5): ');
  const reviews = await question('Number of reviews: ');
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(`
      INSERT INTO products (id, name, description, images, category, rating, reviews, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
    `, [id, name, description, ['/placeholder-sports-equipment.jpg'], category, parseFloat(rating), parseInt(reviews)]);
    
    const addSize = await question('Add a size? (y/n): ');
    if (addSize.toLowerCase() === 'y') {
      const size = await question('Size name: ');
      const volume = await question('Volume: ');
      const price = await question('Price: ');
      
      await client.query(`
        INSERT INTO product_sizes (product_id, size, volume, original_price)
        VALUES ($1, $2, $3, $4)
      `, [id, size, volume, parseFloat(price)]);
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Product added successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
  }
}

async function deleteProduct() {
  const id = await question('\nEnter product ID to delete: ');
  const confirm = await question(`Are you sure you want to delete ${id}? (yes/no): `);
  
  if (confirm.toLowerCase() === 'yes') {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    console.log('✅ Product deleted!');
  } else {
    console.log('❌ Cancelled');
  }
}

async function viewOrders() {
  const result = await pool.query(`
    SELECT order_number, customer_name, total, status, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 20
  `);
  
  console.log('\n📦 RECENT ORDERS:\n');
  if (result.rows.length === 0) {
    console.log('No orders yet.');
  } else {
    result.rows.forEach(o => {
      console.log(`Order #${o.order_number}`);
      console.log(`  Customer: ${o.customer_name}`);
      console.log(`  Total: EGP${o.total}`);
      console.log(`  Status: ${o.status}`);
      console.log(`  Date: ${new Date(o.created_at).toLocaleDateString()}\n`);
    });
  }
}

async function viewStats() {
  const stats = await Promise.all([
    pool.query('SELECT COUNT(*) FROM products'),
    pool.query('SELECT COUNT(*) FROM products WHERE is_active = true'),
    pool.query('SELECT COUNT(*) FROM orders'),
    pool.query('SELECT COUNT(*) FROM users'),
    pool.query('SELECT COUNT(*) FROM reviews'),
    pool.query('SELECT category, COUNT(*) FROM products GROUP BY category'),
  ]);
  
  console.log('\n📊 DATABASE STATISTICS:\n');
  console.log(`Total Products: ${stats[0].rows[0].count}`);
  console.log(`Active Products: ${stats[1].rows[0].count}`);
  console.log(`Total Orders: ${stats[2].rows[0].count}`);
  console.log(`Total Users: ${stats[3].rows[0].count}`);
  console.log(`Total Reviews: ${stats[4].rows[0].count}`);
  console.log('\nProducts by Category:');
  stats[5].rows.forEach(r => {
    console.log(`  ${r.category}: ${r.count}`);
  });
}

async function clearAllProducts() {
  const confirm = await question('\n⚠️  WARNING: This will delete ALL products! Type "DELETE ALL" to confirm: ');
  
  if (confirm === 'DELETE ALL') {
    await pool.query('TRUNCATE TABLE product_sizes, products CASCADE');
    console.log('✅ All products deleted!');
  } else {
    console.log('❌ Cancelled');
  }
}

async function main() {
  try {
    while (true) {
      await showMenu();
      const choice = await question('Select option (1-9): ');
      
      switch (choice) {
        case '1':
          await viewAllProducts();
          break;
        case '2':
          await viewProductsByCategory();
          break;
        case '3':
          await addProduct();
          break;
        case '4':
          await deleteProduct();
          break;
        case '5':
          await viewOrders();
          break;
        case '6':
          await viewStats();
          break;
        case '7':
          console.log('\n💾 To backup: pg_dump -U postgres mema_sports > backup.sql');
          break;
        case '8':
          await clearAllProducts();
          break;
        case '9':
          console.log('\n👋 Goodbye!');
          rl.close();
          await pool.end();
          process.exit(0);
        default:
          console.log('Invalid option!');
      }
      
      await question('\nPress Enter to continue...');
    }
  } catch (error) {
    console.error('Error:', error);
    rl.close();
    await pool.end();
  }
}

main();

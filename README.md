# Mema Sports - Premium Sports Equipment & Sportswear

A luxury e-commerce website for premium sports equipment and athletic wear, built with Next.js 14, TypeScript, and MongoDB.

## 🏆 Features

- **Luxury Sports Brand**: Orange and black color scheme with premium design
- **Product Categories**: Sports Equipment, Athletic Apparel, Accessories, and Outlet
- **Advanced Animations**: Smooth transitions and hover effects
- **Responsive Design**: Mobile-first approach with elegant desktop experience
- **User Authentication**: Secure login/register system
- **Shopping Cart**: Full cart functionality with size selection
- **Favorites**: Save favorite products
- **Order Management**: Complete order tracking system
- **Admin Dashboard**: Product and order management
- **Email Notifications**: Order confirmations and updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mema-sports
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # Email configuration (optional)
   EMAIL_HOST=your_smtp_host
   EMAIL_PORT=587
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

4. **Database Setup**
   ```bash
   npm run setup-db
   npm run seed-db
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Brand Identity

### Logo Design
- **Primary Logo**: Orange "M" with fierce white eyes on black background
- **Color Scheme**: Orange (#f97316) and Black
- **Typography**: Modern, clean sans-serif fonts

### Product Categories
- **Sports Equipment**: Professional-grade equipment for all sports
- **Athletic Apparel**: High-performance sportswear
- **Accessories**: Essential sports accessories
- **Outlet**: Limited-time offers and exclusive deals

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based auth system
- **State Management**: React Context API
- **Animations**: Framer Motion
- **UI Components**: Radix UI + Custom components
- **Icons**: Lucide React

## 📁 Project Structure

```
mema-sports/
├── app/                    # Next.js 14 app directory
│   ├── about/             # About page
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── contact/           # Contact page
│   ├── products/          # Product pages
│   └── user/              # User dashboard
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   └── ...               # Feature components
├── lib/                  # Utilities and contexts
├── public/               # Static assets
├── scripts/              # Database scripts
└── styles/               # Global styles
```

## 🎯 Key Features

### Homepage
- Hero section with video background
- Animated logo with floating effect
- Best sellers carousel
- Product collections showcase
- About preview section

### Product Pages
- Category-based product listing
- Product detail pages with specifications
- Size selection and quantity controls
- Image galleries and zoom functionality
- Related products suggestions

### Shopping Experience
- Add to cart with size selection
- Shopping cart with quantity updates
- Favorites system
- Checkout process with address management
- Order confirmation and tracking

### Admin Features
- Product management (CRUD operations)
- Order management and status updates
- User management
- Analytics dashboard

## 🎨 Design System

### Colors
- **Primary Orange**: #f97316
- **Secondary Orange**: #ea580c
- **Dark Orange**: #c2410c
- **Black**: #000000
- **White**: #ffffff
- **Gray Scale**: Various shades for text and backgrounds

### Typography
- **Headings**: Playfair Display (serif)
- **Body Text**: Inter (sans-serif)
- **Logo**: Custom font styling

### Animations
- **Floating Logo**: Subtle vertical movement
- **Hover Effects**: Lift and glow animations
- **Page Transitions**: Smooth fade and slide effects
- **Loading States**: Elegant spinners and skeletons

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Database Setup for Production

1. **Set up MongoDB Atlas** or your preferred MongoDB hosting
2. **Update MONGODB_URI** in your environment variables
3. **Run database setup**
   ```bash
   npm run setup-db
   npm run seed-db
   ```

## 📊 Database Schema

### Products Collection
```javascript
{
  id: string,
  name: string,
  description: string,
  price: number,
  sizes: Array<{size: string, volume: string, originalPrice: number, discountedPrice: number}>,
  images: string[],
  rating: number,
  reviews: number,
  specifications: {
    material: string[],
    features: string[],
    dimensions: string[]
  },
  category: 'equipment' | 'apparel' | 'accessories' | 'outlet',
  isNew: boolean,
  isBestseller: boolean,
  isActive: boolean
}
```

### Users Collection
```javascript
{
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'user',
  favorites: string[],
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  userId: string,
  items: Array<OrderItem>,
  total: number,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  shippingAddress: Address,
  paymentMethod: 'cod' | 'visa' | 'mastercard',
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup-db` - Set up database collections and indexes
- `npm run seed-db` - Seed database with sample data
- `npm run deploy` - Full deployment setup

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Next.js and React
- **Prettier**: Code formatting
- **Conventional Commits**: Git commit message format

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email info@memasports.com or create an issue in the repository.

---

**Mema Sports** - Elevate Your Athletic Performance 🏆


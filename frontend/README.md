# ShareTrading UI MVP

A production-polished, investor-grade web interface that demonstrates the full user experience for AI-driven paper trading, backtesting, and strategy management. Built with modern web technologies and featuring comprehensive animations, professional design system, and realistic trading simulations.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer-Motion-0055FF?style=flat-square&logo=framer)

## 🚀 Features

### Core Functionality
- **📊 Dashboard**: Real-time portfolio overview with animated KPIs and charts
- **🎯 Strategy Builder**: Visual drag-and-drop strategy creation with Monaco code editor
- **📈 Backtesting**: Comprehensive historical performance analysis with detailed reports
- **💼 Paper Trading**: Real-time trading simulation with order management
- **👤 User Management**: Professional authentication with split-screen design
- **⚙️ Settings**: Comprehensive user preferences and API management

### UI/UX Excellence
- **🎨 Professional Design System**: Investor-grade interface with consistent branding
- **🌙 Dark/Light Themes**: Seamless theme switching with system preference detection
- **📱 Responsive Design**: Mobile-first approach with tablet and desktop optimization
- **♿ Accessibility**: WCAG AA compliant with keyboard navigation and screen reader support
- **✨ Smooth Animations**: Framer Motion powered micro-interactions and page transitions
- **🔄 Loading States**: Skeleton screens and animated loading indicators

### Technical Features
- **⚡ Performance Optimized**: Code splitting, lazy loading, and memoization
- **🧪 Comprehensive Testing**: Jest and React Testing Library setup
- **📦 Mock Data System**: Realistic trading scenarios with deterministic data
- **🔒 Type Safety**: Strict TypeScript with comprehensive type definitions
- **🎯 Modern Architecture**: Clean component structure with separation of concerns

## 🛠 Tech Stack

### Frontend Framework
- **Next.js 14+** - App Router with server components
- **TypeScript** - Strict mode with comprehensive type safety
- **React 18** - Latest features with concurrent rendering

### Styling & UI
- **Tailwind CSS** - Utility-first CSS with custom design tokens
- **Framer Motion** - Advanced animations and micro-interactions
- **Lucide React** - Consistent icon system
- **Recharts** - Professional financial chart library

### State Management
- **Zustand** - Lightweight global state management
- **React Query** - Server state management and caching
- **React Hook Form** - Performant form handling

### Development Tools
- **ESLint** - Code linting with Next.js configuration
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing utilities
- **Monaco Editor** - VS Code-powered code editing

## 📁 Project Structure

```
sharetrading-ui-mvp/
├── src/                        # Frontend (Next.js)
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── strategies/         # Strategy management
│   │   ├── backtesting/        # Backtesting interface
│   │   ├── paper-trading/      # Trading simulation
│   │   └── settings/           # User settings
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── charts/         # Chart components
│   │   │   ├── skeleton.tsx    # Loading skeletons
│   │   │   └── animated-card.tsx # Animated components
│   │   ├── features/           # Feature-specific components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── dashboard/      # Dashboard widgets
│   │   │   ├── strategies/     # Strategy builder
│   │   │   └── trading/        # Trading interface
│   │   ├── layout/             # Layout components
│   │   └── providers/          # Context providers
│   ├── lib/
│   │   ├── api/                # API service layer
│   │   ├── animations.ts       # Framer Motion variants
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utility functions
│   │   ├── types/              # TypeScript definitions
│   │   └── constants/          # Application constants
│   ├── mocks/                  # Mock data and services
│   ├── stores/                 # Zustand stores
│   └── styles/                 # Global styles
├── backend/                    # Backend (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Custom middleware
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # Express routes
│   │   ├── utils/              # Utility functions
│   │   └── server.js           # Main server file
│   ├── .env                    # Environment variables
│   └── package.json            # Backend dependencies
├── .kiro/                      # Kiro IDE specifications
├── public/                     # Static assets
└── docs/                       # Documentation
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (or **yarn** 1.22+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sharetrading-ui-mvp.git
   cd sharetrading-ui-mvp
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   # Frontend
   cp .env.local.example .env.local
   
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB connection and JWT secrets
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on `mongodb://localhost:27017`

6. **Start development servers**
   
   **Option 1: Start both servers separately**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```
   
   **Option 2: Use concurrently (recommended)**
   ```bash
   npm run dev:full
   ```

7. **Open in browser**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)
   - API Health Check: [http://localhost:5000/health](http://localhost:5000/health)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint code analysis |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test` | Run Jest test suite |
| `npm run test:watch` | Run tests in watch mode |

## 🎨 Design System

### Color Palette
- **Primary**: Blue-600 (#2563eb) - Main brand color
- **Secondary**: Neutral-600 (#525252) - Supporting elements
- **Success**: Green-600 (#16a34a) - Positive actions
- **Warning**: Yellow-600 (#ca8a04) - Caution states
- **Error**: Red-600 (#dc2626) - Error states

### Typography
- **Headings**: Source Sans Pro (700, 600, 500)
- **Body**: Source Sans Pro (400, 300)
- **Code**: JetBrains Mono (400)

### Components
- **Buttons**: Animated with hover and tap states
- **Cards**: Subtle hover animations with shadow transitions
- **Modals**: Smooth enter/exit animations with backdrop blur
- **Charts**: Progressive data loading with smooth transitions

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

### Testing Strategy
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interaction testing
- **Accessibility Tests**: WCAG compliance verification
- **Performance Tests**: Bundle size and runtime performance

## 📊 Mock Data System

The application uses a sophisticated mock data system that simulates:

- **Real-time Market Data**: Live price updates with WebSocket simulation
- **Trading Operations**: Order execution with realistic delays and slippage
- **Historical Data**: Comprehensive backtesting datasets
- **User Scenarios**: Various user types and portfolio states
- **Edge Cases**: Error conditions and boundary scenarios

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Static Export
```bash
npm run build
npm run export
# Deploy static files from 'out' directory
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript strict mode
- Use established component patterns
- Implement responsive design for all features
- Ensure accessibility compliance (WCAG AA)
- Write comprehensive tests
- Use semantic commit messages

## 📝 License

This project is for demonstration purposes only. All rights reserved.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [Coming Soon]
- **API Reference**: [Coming Soon]

---

**Built with ❤️ using Next.js, TypeScript, and Framer Motion**
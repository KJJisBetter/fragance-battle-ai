# Fragrance Battle AI 🌸

An AI-powered fragrance collection organizer with blind testing battles to help you build the perfect fragrance wardrobe.

## ✨ Features

- **Blind Testing System**: Test fragrances without bias using your existing HTML prototype converted to React
- **AI-Powered Recommendations**: Get personalized fragrance suggestions based on your testing history
- **Category Battles**: Test fragrances across 9 different use cases (Daily Driver, Date Night, Office, etc.)
- **Collection Management**: Build an optimal fragrance collection without redundancy
- **User Profiles**: Track your testing history and build preference profiles
- **Social Features**: Share results and compare with friends

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4 API
- **Authentication**: JWT
- **Deployment**: Docker containers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- OpenAI API key

### Option 1: Automatic Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd fragrance-battle-ai

# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Database Setup**
```bash
# Create database
createdb fragrance_battle

# Run migrations
cd backend
npm run migrate:up

# Seed with sample data
npm run seed
```

3. **Environment Variables**
```bash
# Backend (.env)
cp .env.example .env
# Edit .env with your database URL, JWT secret, and OpenAI API key

# Frontend (.env)
cp .env.example .env
# Edit .env with your API URL
```

4. **Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📱 Usage

1. **Open** http://localhost:3000 in your browser
2. **Create an account** or use the app without authentication for testing
3. **Start a fragrance battle** - the app will guide you through testing fragrances in different categories
4. **Get AI recommendations** based on your testing results
5. **Build your collection** using the insights provided

## 🏗️ Project Structure

```
fragrance-battle-ai/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── config/         # Database and external service configs
│   │   ├── models/         # Database models
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
├── database/               # Database migrations and seeds
└── docker-compose.yml     # Docker container configuration
```

## 🔧 Development Commands

```bash
# Database
npm run db:migrate          # Run database migrations
npm run db:seed            # Seed database with sample data
npm run db:setup           # Run migrations + seed

# Development
npm run dev                # Start both frontend and backend
npm run dev:backend        # Start only backend
npm run dev:frontend       # Start only frontend

# Building
npm run build              # Build both frontend and backend
npm run build:backend      # Build only backend
npm run build:frontend     # Build only frontend
```

## 🐳 Docker Deployment

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🤖 AI Features

The app uses OpenAI's GPT-4 to:
- Analyze your fragrance preferences from testing history
- Recommend fragrances based on your taste profile
- Suggest collection gaps and improvements
- Provide insights into your scent preferences

## 📊 Database Schema

The app uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `fragrances` - Fragrance database with notes, categories, etc.
- `test_sessions` - Blind testing sessions
- `test_results` - Individual category test results
- `ai_recommendations` - AI-generated recommendations

## 🔒 Authentication

- JWT-based authentication
- Secure password hashing with bcrypt
- Optional guest mode for testing without account

## 🎨 Design System

The frontend uses a custom Tailwind CSS configuration with:
- Blue color palette for professionalism
- Category-specific accent colors
- Responsive design for mobile and desktop
- Accessible components with proper ARIA labels

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📝 API Documentation

The backend provides RESTful APIs:

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and get JWT token
- `GET /api/auth/me` - Get current user profile

### Fragrances
- `GET /api/fragrances` - List all fragrances
- `GET /api/fragrances/category/:category` - Get fragrances by category
- `GET /api/fragrances/:id` - Get specific fragrance
- `POST /api/fragrances/batch` - Get multiple fragrances by IDs

### Testing
- `POST /api/testing/session` - Create new test session
- `POST /api/testing/session/:sessionId/result` - Add test result
- `POST /api/testing/session/:sessionId/complete` - Complete test session
- `GET /api/testing/session/:sessionId/results` - Get session results
- `GET /api/testing/sessions` - Get user's test sessions
- `GET /api/testing/battle-data/:category` - Get battle data for category

### AI Recommendations
- `POST /api/ai/recommendations` - Generate AI recommendations
- `GET /api/ai/recommendations/:userId` - Get user's AI recommendations
- `POST /api/ai/analyze-preferences` - Analyze user preferences from test results

Full API documentation available at `/api/docs` when running

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original HTML prototype inspiration
- OpenAI for AI capabilities
- The fragrance community for testing and feedback

---

**Built with ❤️ for fragrance enthusiasts**

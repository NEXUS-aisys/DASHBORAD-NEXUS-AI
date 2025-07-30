# 🛠️ Development Setup Guide

This guide will help you set up the NexusTradeAI development environment for contributing to the project.

---

## 📋 **Prerequisites**

### **Required Software**
- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher (or **pnpm** 8.0.0+)
- **Git** 2.30.0 or higher
- **Python** 3.8+ (for ML bot)

### **Recommended Tools**
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - React Developer Tools
  - Tailwind CSS IntelliSense
- **Postman** or **Insomnia** for API testing
- **Chrome DevTools** for debugging

---

## 🚀 **Quick Setup**

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd NexusTradeAI
```

### **2. Install Dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd client && npm install

# Install backend dependencies
cd ../server && npm install

# Return to root
cd ..
```

### **3. Environment Configuration**
```bash
# Create environment files
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env
```

### **4. Start Development Servers**
```bash
# Terminal 1: Start backend server
cd server && npm start

# Terminal 2: Start frontend
cd client && npm run dev

# Terminal 3: Start ML bot (optional)
python3 local_bot.py
```

---

## ⚙️ **Environment Variables**

### **Root .env**
```env
NODE_ENV=development
PORT=3001
```

### **Client .env**
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=NexusTradeAI
```

### **Server .env**
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nexustrade
JWT_SECRET=your-secret-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

---

## 🔧 **Development Workflow**

### **1. Code Standards**
- Use **ESLint** for code linting
- Use **Prettier** for code formatting
- Follow **Conventional Commits** for commit messages
- Write **JSDoc** comments for functions

### **2. Git Workflow**
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new trading feature"

# Push and create PR
git push origin feature/your-feature-name
```

### **3. Testing**
```bash
# Run frontend tests
cd client && npm test

# Run backend tests
cd server && npm test

# Run all tests
npm run test:all
```

---

## 📁 **Project Structure**

### **Frontend Structure**
```
client/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI components
│   │   ├── layout/         # Layout components
│   │   └── features/       # Feature-specific components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   └── constants/          # Application constants
├── public/                 # Static assets
└── package.json
```

### **Backend Structure**
```
server/
├── routes/                 # API routes
├── services/               # Business logic
├── models/                 # Data models
├── middleware/             # Express middleware
├── utils/                  # Utility functions
├── config/                 # Configuration files
└── server.js              # Main server file
```

---

## 🧪 **Testing Setup**

### **Frontend Testing**
```bash
# Install testing dependencies
cd client && npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### **Backend Testing**
```bash
# Install testing dependencies
cd server && npm install --save-dev jest supertest

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

---

## 🔍 **Debugging**

### **Frontend Debugging**
1. Open Chrome DevTools
2. Go to Sources tab
3. Set breakpoints in your code
4. Use React Developer Tools for component inspection

### **Backend Debugging**
1. Use VS Code debugger
2. Set breakpoints in server code
3. Use `console.log()` for quick debugging
4. Check server logs in terminal

### **WebSocket Debugging**
1. Use Chrome DevTools Network tab
2. Filter by WS (WebSocket)
3. Monitor WebSocket messages
4. Check connection status

---

## 📦 **Build Process**

### **Development Build**
```bash
# Frontend development build
cd client && npm run build:dev

# Backend development build
cd server && npm run build:dev
```

### **Production Build**
```bash
# Frontend production build
cd client && npm run build

# Backend production build
cd server && npm run build
```

---

## 🚨 **Common Issues**

### **Port Already in Use**
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### **Node Modules Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **WebSocket Connection Issues**
- Check if server is running
- Verify WebSocket URL in client config
- Check CORS settings
- Ensure firewall allows connections

---

## 📚 **Additional Resources**

- **[API Documentation](../api/rest-api.md)** - Complete API reference
- **[Component Documentation](../components/)** - Component guides
- **[Architecture Overview](architecture.md)** - System architecture
- **[Code Standards](code-standards.md)** - Coding conventions

---

## 🤝 **Getting Help**

If you encounter issues:
1. Check the [troubleshooting section](#-common-issues)
2. Review existing documentation
3. Search existing issues on GitHub
4. Create a new issue with detailed information

---

**Happy coding! 🚀** 
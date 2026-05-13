# 💰 Vaulto Expens Tracke
 
> A modern, full-stack expense tracking application with budget management, real-time analytics, and beautiful data visualizations.
 
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.0+-blue)](https://react.dev/)
![GitHub stars](https://img.shields.io/github/stars/yourusername/expense-tracker?style=social)
 
## ✨ Features
 
### 💳 Expense Management
- ✅ **Add, Edit & Delete Expenses** - Manage transactions with detailed information
- ✅ **Advanced Filtering** - Filter by category, date range, payment method
- ✅ **Payment Methods** - Support for cash, credit card, debit card, online transfers
- ✅ **Expense History** - Complete transaction history with pagination
- ✅ **Tags & Notes** - Add custom tags and notes to expenses
### 💼 Budget Tracking
- ✅ **Set Monthly Budgets** - Define spending limits per category
- ✅ **Budget Alerts** - Get notified when spending reaches threshold
- ✅ **Progress Tracking** - Visual progress bars for budget utilization
- ✅ **Budget Status** - Real-time tracking of spent vs. limit
- ✅ **Custom Thresholds** - Set alert triggers at any percentage
### 📊 Analytics & Visualization
- ✅ **Daily Spending Chart** - Interactive line chart for spending trends
- ✅ **Category Breakdown** - Pie chart showing category-wise spending
- ✅ **Monthly Summaries** - Overview of monthly spending patterns
- ✅ **Statistics Dashboard** - Real-time spending metrics
- ✅ **Spending Insights** - Category-wise analysis and percentages
### 👤 User Features
- ✅ **Secure Authentication** - JWT-based login & registration
- ✅ **Password Reset** - Forgot password with email verification
- ✅ **Profile Management** - Update personal information
- ✅ **Currency Selection** - Support for multiple currencies
- ✅ **Custom Categories** - Create custom expense categories
### 🎨 UI/UX
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Beautiful Interface** - Modern design with Tailwind CSS
- ✅ **Dark Mode Ready** - CSS variables for easy theming
- ✅ **Toast Notifications** - User-friendly feedback messages
- ✅ **Loading States** - Smooth loading indicators
- ✅ **Form Validation** - Client and server-side validation
---
 
## 🛠 Tech Stack
 
### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) - React framework with SSR
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- **HTTP Client**: [Axios](https://axios-http.com/) - Promise-based HTTP client
- **Charts**: [Recharts](https://recharts.org/) - React charting library
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful icon library
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/) - Toast notifications
### Backend
- **Runtime**: [Node.js](https://nodejs.org/) - JavaScript runtime
- **Framework**: [Express.js](https://expressjs.com/) - Web framework
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Relational database
- **Cloud Database**: [Supabase](https://supabase.com/) - PostgreSQL as a service
- **Authentication**: [JWT](https://jwt.io/) - JSON Web Tokens
- **Password Hashing**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Password hashing
- **Validation**: [Joi](https://joi.dev/) - Schema validation
- **Email**: [Nodemailer](https://nodemailer.com/) - Email sending
---
 
## 📸 Screenshots
 
### Landing Page
 
 
 ![Uploading landing<img width="2877" height="1528" alt="dasshbord" src="https://github.com/user-attachments/assets/9cd2c5a7-49e9-4821-b961-fdf8ee66faf6" />
 page.png…]()

 ### Dashboard
 <img width="2877" height="1528" alt="dasshbord" src="https://github.com/user-attachments/assets/11534db6-4778-4921-9c81-d24b6192c14b" />

---
 
## 🚀 Quick Start
 
### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL 12+ or Supabase account
- npm or yarn
### Installation
 
1. **Clone the repository**
```bash
git clone https://github.com/Asucexio/expense-tracker.git
cd expense-tracker
```
 
2. **Setup Backend**
```bash
cd expense-tracker-backend
 
# Install dependencies
npm install
 
# Configure environment
cp .env.example .env
# Edit .env with your database credentials
 
# Initialize database
psql expense_tracker < database.sql
 
# Start server
npm run dev
```
 
Backend runs on `http://localhost:5000`
 
3. **Setup Frontend**
```bash
cd ../expense-tracker-frontend
 
# Install dependencies
npm install
 
# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL
 
# Start development server
npm run dev
```
 
Frontend runs on `http://localhost:3000`
 
4. **Open in Browser**
```
http://localhost:3000
```
 
---
 
## 📚 Usage
 
### Creating an Account
1. Click "Sign Up" on landing page
2. Enter name, email, and password
3. Account created with default expense categories
4. Redirected to dashboard
### Adding an Expense
1. Go to **Expenses** section
2. Click **"Add Expense"**
3. Fill in details (category, amount, date, payment method)
4. Click **"Add Expense"**
5. View in expense list and dashboard
### Setting a Budget
1. Go to **Budgets** section
2. Click **"New Budget"**
3. Select category and set monthly limit
4. Set alert threshold (optional)
5. Click **"Create Budget"**
6. Track spending against budget
### Viewing Analytics
1. Go to **Dashboard**
2. See summary cards (total spent, transactions, active budgets)
3. View daily spending chart
4. Check category breakdown pie chart
5. See spending by category table
### Resetting Password
1. Go to **Login** page
2. Click **"Forgot password?"**
3. Enter email address
4. Check email for reset link
5. Click link and set new password
---
 
## 🔐 Security Features
 
- **Password Hashing**: Passwords hashed with bcryptjs (10 rounds)
- **JWT Authentication**: Secure token-based authentication
- **Token Refresh**: Automatic token refresh on expiry
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: Server-side validation with Joi
- **CORS Protection**: CORS middleware configured
- **Password Reset**: Secure token-based password reset
- **Email Verification**: Reset links sent via email
---
 
## 📖 API Documentation
 
### Authentication Endpoints
```
POST   /api/auth/register              Register new user
POST   /api/auth/login                 Login user
POST   /api/auth/refresh-token         Refresh access token
GET    /api/auth/me                    Get current user
POST   /api/auth/forgot-password       Request password reset
POST   /api/auth/reset-password        Reset password with token
```
 
### Expense Endpoints
```
POST   /api/expenses                   Create expense
GET    /api/expenses                   Get all expenses (with filters)
GET    /api/expenses/:id               Get single expense
PUT    /api/expenses/:id               Update expense
DELETE /api/expenses/:id               Delete expense
GET    /api/expenses/stats/summary     Get expense statistics
```
 
### Budget Endpoints
```
POST   /api/budgets                    Set budget
GET    /api/budgets                    Get all budgets
GET    /api/budgets/:categoryId/status Get budget status
DELETE /api/budgets/:id                Delete budget
```
 
### Category Endpoints
```
GET    /api/categories                 Get all categories
POST   /api/categories                 Create custom category
PUT    /api/categories/:id             Update category
DELETE /api/categories/:id             Delete category
```
 
### User Endpoints
```
GET    /api/users/me                   Get user profile
PUT    /api/users/profile              Update profile
POST   /api/users/password/change      Change password
GET    /api/users/summary/dashboard    Get dashboard summary
```
 
 
## 🌐 Deployment
 
### Deploy Frontend to Vercel
```bash
npm i -g vercel
vercel
```
 
### Deploy Backend to Railway
1. Connect GitHub repository
2. Create new project
3. Add PostgreSQL add-on
4. Set environment variables
5. Deploy
### Deploy with Docker
```bash
docker build -t expense-tracker-backend .
docker run -p 5000:5000 expense-tracker-backend
```
 
---
 
## 🤝 Contributing
 
Contributions are welcome! Here's how to contribute:
 
1. **Fork the repository**
```bash
git clone https://github.com/Asucexio/expense-tracker.git
```
 
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```
 
3. **Make your changes**
```bash
git add .
git commit -m 'Add amazing feature'
```
 
4. **Push to branch**
```bash
git push origin feature/amazing-feature
```
 
5. **Open a Pull Request**
### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Test your changes
- Update documentation as needed
- Add comments for complex logic
---
 
## 📝 License
 
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
 
```
MIT License
 
Copyright (c) 2026 [Asmamew Admasu]
 
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
 
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```
 
---
 
## 🎓 Learning Resources
 
This project demonstrates:
- ✅ Full-stack web development
- ✅ RESTful API design
- ✅ JWT authentication
- ✅ Database design & relationships
- ✅ React hooks & state management
- ✅ TypeScript for type safety
- ✅ Responsive web design
- ✅ Form handling & validation
- ✅ Error handling & logging
- ✅ Security best practices
Great for learning or as a portfolio project!
 
---
 
## 📞 Support
 
- **Issues**: [GitHub Issues](https://github.com/Asucexio/expense-tracker/issues)
- **Email**:  asmamewadmasuofficial@gmail.com
 
---
 
## 🗺️ Roadmap
 
- [ ] Mobile app (React Native)
- [ ] Dark mode implementation
- [ ] Recurring expenses
- [ ] Expense reports (PDF/CSV)
- [ ] Data export functionality
- [ ] Multi-user shared budgets
- [ ] Receipt upload feature
- [ ] Push notifications
- [ ] Advanced filtering & search
- [ ] Spending predictions
---
 
## 🙏 Acknowledgments
 
- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Charts by [Recharts](https://recharts.org/)
- Database by [Supabase](https://supabase.com/)
- Inspired by popular finance apps
---
 
## 📊 Project Statistics
 
- **Total Files**: 40+
- **Lines of Code**: 3000+
- **API Endpoints**: 22
- **Database Tables**: 8
- **Frontend Pages**: 10+
- **Development Time**: Complete & production-ready
---
 
## 💻 System Requirements
 
### Minimum
- Processor: 1.5 GHz dual-core
- RAM: 2 GB
- Storage: 200 MB
- Node.js: 18.0.0+
- PostgreSQL: 12+
### Recommended
- Processor: 2.5 GHz quad-core
- RAM: 8 GB
- Storage: 1 GB SSD
- Node.js: 20+
- PostgreSQL: 15+
---
  
 
 
## ⭐ Show Your Support
 
Give a ⭐️ if this project helped you!
 
```bash
# Star the repo
git star Asucexio/expense-tracker
 
# Fork and contribute
git fork Asucexio/expense-tracker
```
 
---
 
 
---
 
**Happy Expense Tracking! 💰**
 
Made with ❤️ by [Asmamew Admasu](https://github.com/Asucexio)
 
---
 
## 📅 Version History
 
### v1.0.0 (Current)
- ✅ User authentication
- ✅ Expense management
- ✅ Budget tracking
- ✅ Analytics dashboard
- ✅ Password reset
- ✅ Responsive design
### v0.9.0 (Beta)
- Initial release
- Core features
- Beta testing phase
---
 
## 🔗 Links
 
- **Live Demo**: [_(https://expense-tracker-lilac-nine-36.vercel.app/)]
- **GitHub**: [https://github.com/Asucexio/expense-tracker](https://github.com/Asucexio/expense-tracker)
- **Issues**: [GitHub Issues](https://github.com/Asucexio/expense-tracker/issues)
 
---
 
**Last Updated**: May 2026
**Maintained By**:  Asmamew Admasu
 

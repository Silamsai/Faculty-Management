# Faculty Management System

## Login Credentials

### Admin
- **Email**: admin@edu.com
- **Password**: admin@1234

### Dean
- **Email**: dean@edu.com
- **Password**: dean@123

### Vice Chancellor (VC)
- **Email**: vc@edu.com
- **Password**: vc@12345

### Researcher
- **Email**: researcher@edu.com
- **Password**: researcher@123

> Note: Faculty members do not have default credentials. They must register through the signup process. New faculty accounts are created with "pending" status and require approval by an admin or dean before they can log in.

## 🚀 Features

### ✅ **Completed Frontend Features**
- **Homepage**: Modern design with faculty photo, animations, and blue accents
- **Authentication System**: 
  - Login/Signup overlays with form validation
  - 8-character minimum password requirement
  - Email uniqueness validation
  - Password recovery functionality
- **Role-based Dashboards**:
  - **Faculty Dashboard**: Profile editing, attendance tracking, leave management, scheduling
  - **Dean Dashboard**: Faculty management, leave approval/rejection system
  - **Admin Dashboard**: User management for all roles
  - **Researcher Dashboard**: Research publication review system
- **Leave Management Workflow**:
  - Faculty can apply for leave
  - Applications appear in Dean dashboard
  - Dean can approve/reject with status updating in Faculty dashboard
- **Dark/Light Theme Toggle**
- **Responsive Design**

### ✅ **Completed Backend Features**
- **Node.js/Express API**: RESTful API with proper error handling
- **MongoDB Integration**: User and leave application models
- **Authentication System**:
  - JWT-based authentication
  - Bcrypt password hashing
  - Email uniqueness validation with proper error messages
  - Password recovery with email notifications
- **Leave Management API**:
  - Submit leave applications
  - Review and approve/reject applications
  - Get applications by user or all applications
  - Leave statistics and reporting
- **User Management API**:
  - User registration and login
  - Profile management
  - Admin user management functions
  - Role-based access control
- **Faculty Management API**:
  - Get all faculty details
  - Add new faculty
  - Edit/update faculty
  - Delete faculty
- **Email Service**: 
  - Welcome emails for new users
  - Password reset emails with secure tokens

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Lucide React** for icons
- **CSS Custom Properties** for theming
- **Responsive Design** with CSS Grid/Flexbox

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Nodemailer** for email services
- **CORS** for cross-origin requests

## 📁 Project Structure

```
luffy/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service functions
│   │   └── App.jsx         # Main application component
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── config/             # Database configuration
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd luffy
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your MongoDB URI and email settings
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start MongoDB** (if running locally)

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:8080`

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 🔧 Environment Configuration

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/faculty_management_system
JWT_SECRET=your_super_secret_jwt_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=8080
FRONTEND_URL=http://localhost:5173
```

## 🎯 Key Features Implemented

### 1. **Email Uniqueness Validation** ✅
- Users cannot register with the same email twice
- Clear error messages for duplicate emails
- Proper database constraints and error handling

### 2. **Password Recovery System** ✅
- Forgot password functionality with email verification
- Secure token-based password reset
- Email notifications with reset links

### 3. **Interactive Leave Management** ✅
- Faculty apply for leave → appears in Dean dashboard
- Dean approve/reject → status updates in Faculty dashboard
- Real-time synchronization between user roles

### 4. **Comprehensive Authentication** ✅
- 8-character minimum password validation
- JWT-based session management
- Role-based access control
- Secure password hashing

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/verify` - Verify JWT token

### Faculty Management
- `GET /api/faculty` - Get all faculty details
- `POST /api/faculty` - Add a new faculty
- `PUT /api/faculty/:id` - Edit/update a faculty
- `DELETE /api/faculty/:id` - Delete a faculty

### Leave Management
- `POST /api/leaves/apply` - Submit leave application
- `GET /api/leaves/my-applications` - Get user's applications
- `GET /api/leaves/all` - Get all applications (Dean/Admin)
- `PUT /api/leaves/:id/review` - Approve/reject application

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/all` - Get all users (Admin)
- `PUT /api/users/:id/status` - Update user status

## 🎨 User Interface Features

- **Modern Design**: Clean, professional interface
- **Dark/Light Themes**: User preference toggle
- **Responsive**: Works on desktop, tablet, and mobile
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client and server-side validation

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side data validation
- **CORS Configuration**: Secure cross-origin requests
- **Error Handling**: No sensitive data exposure

## 📧 Email Integration

- **Welcome Emails**: Sent upon successful registration
- **Password Reset**: Secure token-based reset emails
- **Professional Templates**: HTML email templates
- **Error Handling**: Graceful fallback if email fails

## 🎯 Next Steps for Production

1. **Email Configuration**: Set up production email service (SendGrid, etc.)
2. **Database**: Configure production MongoDB (MongoDB Atlas)
3. **Security**: Add rate limiting, helmet.js, input sanitization
4. **File Upload**: Add profile image upload functionality
5. **Notifications**: Real-time notifications for leave approvals
6. **Reports**: PDF generation for leave reports
7. **Deployment**: Deploy to cloud platforms (Vercel, Render, etc.)

## 🎉 System Status

**✅ FULLY FUNCTIONAL SYSTEM**
- Frontend and backend completely integrated
- All authentication flows working
- Leave management system operational
- Faculty management API implemented
- Email notifications functional
- Database persistence working
- Error handling implemented
- User experience optimized

The Faculty Management System is now ready for use with full functionality including user registration, authentication, leave management, faculty management, and administrative features!
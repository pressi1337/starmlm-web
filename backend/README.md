# Starup Backend API

A comprehensive backend API for the Starup promotional training platform built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete user lifecycle management with referral system
- **Video Management**: Daily, training, and promotion video management
- **Quiz System**: Interactive quizzes with multilingual support (English/Tamil)
- **Pin Requests**: Level upgrade system with pin generation and activation
- **Referral System**: Multi-level referral tracking with configurable earnings
- **Earnings Management**: Comprehensive earning tracking across multiple wallets
- **Withdrawal System**: Secure withdrawal processing with admin approval
- **YouTube Integration**: YouTube channel management for additional content

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Email**: Nodemailer

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Make sure MongoDB is running
   npm run seed  # Optional: Seed with sample data
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update user profile
- `POST /api/v1/auth/logout` - User logout

### Users (Admin Only)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/stats/overview` - User statistics

### Videos
- `GET /api/v1/videos` - Get all videos
- `GET /api/v1/videos/daily/today` - Get today's daily video
- `GET /api/v1/videos/training/current` - Get current training video
- `GET /api/v1/videos/promotion/session` - Get session promotion videos
- `POST /api/v1/videos` - Create video (Admin)
- `PUT /api/v1/videos/:id` - Update video (Admin)
- `DELETE /api/v1/videos/:id` - Delete video (Admin)
- `POST /api/v1/videos/:id/watch` - Mark video as watched

### Quizzes
- `GET /api/v1/quizzes` - Get all quizzes
- `GET /api/v1/quizzes/video/:videoId` - Get quiz by video ID
- `POST /api/v1/quizzes` - Create quiz (Admin)
- `PUT /api/v1/quizzes/:id` - Update quiz (Admin)
- `POST /api/v1/quizzes/:id/submit` - Submit quiz answers

### Pin Requests
- `GET /api/v1/pins` - Get pin requests
- `POST /api/v1/pins/request` - Create pin request
- `PUT /api/v1/pins/:id/approve` - Approve pin request (Admin)
- `POST /api/v1/pins/:id/activate` - Activate pin
- `PUT /api/v1/pins/:id/reject` - Reject pin request (Admin)
- `GET /api/v1/pins/stats/overview` - Pin statistics (Admin)

### Referrals
- `GET /api/v1/referrals/tree` - Get referral tree
- `GET /api/v1/referrals/settings` - Get referral settings (Admin)
- `PUT /api/v1/referrals/settings` - Update referral settings (Admin)
- `POST /api/v1/referrals/process-bonus` - Process referral bonus

### Earnings
- `GET /api/v1/earnings` - Get earnings history
- `GET /api/v1/earnings/stats` - Get earnings statistics
- `POST /api/v1/earnings/transfer` - Transfer between wallets

### Withdrawals
- `GET /api/v1/withdrawals` - Get withdrawal requests
- `POST /api/v1/withdrawals` - Create withdrawal request
- `PUT /api/v1/withdrawals/:id/process` - Process withdrawal (Admin)
- `GET /api/v1/withdrawals/stats/overview` - Withdrawal statistics (Admin)

### YouTube Channels
- `GET /api/v1/youtube` - Get YouTube channels
- `POST /api/v1/youtube` - Create YouTube channel (Admin)
- `PUT /api/v1/youtube/:id` - Update YouTube channel (Admin)
- `DELETE /api/v1/youtube/:id` - Delete YouTube channel (Admin)

## Database Models

### User Model
- Authentication and profile information
- Role-based access control (admin, promotor, promotor1-4)
- Earnings tracking (cash, grow, scratch wallets)
- Training progress and video watch history
- Referral system integration

### Video Model
- Support for daily, training, and promotion videos
- YouTube link integration
- Session-based scheduling for promotion videos
- View and completion tracking

### Quiz Model
- Multilingual questions (English/Tamil)
- Multiple choice answers with correct answer marking
- Time limits and scoring system
- Role-based earnings configuration

### Pin Request Model
- Level upgrade request management
- Approval workflow with admin controls
- Pin generation and activation tracking

### Referral Setting Model
- Configurable referral bonus ranges
- Level-based earning structures

### Earning Model
- Comprehensive transaction tracking
- Multiple earning types and wallet support
- Related entity tracking for audit trails

### Withdrawal Model
- Secure withdrawal request processing
- Multiple payment methods (Bank, UPI)
- Admin approval workflow

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS configuration
- Input validation and sanitization
- Role-based access control
- Secure file upload handling

## Development

### Running Tests
```bash
npm test
```

### Database Seeding
```bash
node src/scripts/seedData.js
```

### Environment Variables
See `.env.example` for required environment variables.

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure Cloudinary for file uploads
5. Set up email service for notifications
6. Configure rate limiting and security headers

## API Response Format

All API responses follow this consistent format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data
  "pagination": {}, // For paginated responses
  "errors": [] // For validation errors
}
```

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Authentication/authorization errors
- Database errors
- File upload errors
- Rate limiting errors

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables
- Different limits can be set for different endpoints
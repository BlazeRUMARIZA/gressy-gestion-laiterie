# Dairy Management System

A full-stack web application for managing dairy farms, built with Node.js, React, and MySQL.

## Features

- 🐮 **Cow Management**: Track all cows with detailed information (tag number, breed, status, etc.)
- 🥛 **Milk Production**: Record and monitor daily milk production with morning, afternoon, and evening sessions
- 🏥 **Health Records**: Maintain comprehensive health records including diagnoses, treatments, and veterinary information
- 🌾 **Feed Management**: Track feed consumption, costs, and suppliers
- 📊 **Dashboard**: Real-time statistics and trends for milk production, cow health, and feed costs
- 🔐 **Authentication**: Secure login system with role-based access (admin, manager, staff)

## Tech Stack

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React.js
- React Router
- Axios for API calls
- Modern CSS with responsive design

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd dairy-management-system
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE dairy_management;
```

2. Configure database connection:
```bash
cd server
cp .env.example .env
```

3. Edit `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dairy_management
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

### 4. Start the application

#### Development Mode (with hot reload)

From the root directory:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend (port 3000).

#### Or start separately:

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm start
```

## Default Login Credentials

- **Username:** admin
- **Password:** admin123

⚠️ **Important:** Change the default password after first login in production!

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Cows
- `GET /api/cows` - Get all cows (with optional filters: status, search)
- `GET /api/cows/:id` - Get single cow
- `POST /api/cows` - Create new cow
- `PUT /api/cows/:id` - Update cow
- `DELETE /api/cows/:id` - Delete cow

### Milk Production
- `GET /api/milk` - Get all milk records (with optional filters: startDate, endDate, cow_id)
- `GET /api/milk/:id` - Get single record
- `POST /api/milk` - Create new record
- `PUT /api/milk/:id` - Update record
- `DELETE /api/milk/:id` - Delete record
- `GET /api/milk/stats/summary` - Get milk statistics

### Health Records
- `GET /api/health` - Get all health records
- `GET /api/health/:id` - Get single record
- `POST /api/health` - Create new record
- `PUT /api/health/:id` - Update record
- `DELETE /api/health/:id` - Delete record

### Feed Records
- `GET /api/feed` - Get all feed records
- `GET /api/feed/:id` - Get single record
- `POST /api/feed` - Create new record
- `PUT /api/feed/:id` - Update record
- `DELETE /api/feed/:id` - Delete record
- `GET /api/feed/stats/summary` - Get feed statistics

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Deployment

### Using Docker

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Manual Deployment

1. **Build the React app:**
```bash
cd client
npm run build
```

2. **Set production environment variables:**
```bash
cd server
# Edit .env file with production values
NODE_ENV=production
```

3. **Start the server:**
```bash
cd server
npm start
```

4. **Serve the React build:**
   - Option 1: Use a web server (nginx, Apache) to serve the `client/build` directory
   - Option 2: Configure Express to serve static files from `client/build`

## Project Structure

```
dairy-management-system/
├── server/
│   ├── config/
│   │   └── database.js       # Database configuration and initialization
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── cows.js            # Cow management routes
│   │   ├── milk.js            # Milk production routes
│   │   ├── health.js          # Health records routes
│   │   ├── feed.js            # Feed records routes
│   │   └── dashboard.js       # Dashboard routes
│   ├── index.js               # Server entry point
│   ├── package.json
│   └── .env.example
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── utils/             # Utilities (API, Auth context)
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Database Schema

The application automatically creates the following tables on first run:
- `users` - User accounts and authentication
- `cows` - Cow information
- `milk_production` - Daily milk production records
- `health_records` - Health and veterinary records
- `feed_records` - Feed consumption and costs

## Security Notes

- Change the default JWT_SECRET in production
- Use strong passwords for database access
- Enable HTTPS in production
- Regularly update dependencies
- Implement rate limiting for production use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on the repository.

# Deployment Guide

This guide covers different deployment options for the Dairy Management System.

## Option 1: Docker Compose (Recommended)

This is the easiest way to deploy the entire application.

### Prerequisites
- Docker
- Docker Compose

### Steps

1. **Clone the repository:**
```bash
git clone <repository-url>
cd dairy-management-system
```

2. **Update environment variables:**
Edit `docker-compose.yml` and update:
- MySQL root password
- Database user credentials
- JWT_SECRET (use a strong random string)

3. **Start the services:**
```bash
docker-compose up -d
```

4. **Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost/api

5. **View logs:**
```bash
docker-compose logs -f
```

6. **Stop the services:**
```bash
docker-compose down
```

## Option 2: Manual Deployment

### Backend Deployment

1. **Install dependencies:**
```bash
cd server
npm install --production
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your production values
```

3. **Start with PM2 (recommended for production):**
```bash
npm install -g pm2
pm2 start index.js --name dairy-backend
pm2 save
pm2 startup
```

### Frontend Deployment

1. **Build the React app:**
```bash
cd client
npm install
npm run build
```

2. **Serve with Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dairy-management-system/client/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Option 3: Cloud Platform Deployment

### Heroku

1. **Install Heroku CLI**

2. **Create Heroku apps:**
```bash
# For backend
cd server
heroku create dairy-backend
heroku addons:create cleardb:ignite

# For frontend
cd ../client
heroku create dairy-frontend
```

3. **Deploy:**
```bash
# Backend
cd server
git push heroku main

# Frontend
cd client
git push heroku main
```

### AWS EC2

1. **Launch EC2 instance** (Ubuntu recommended)

2. **Install dependencies:**
```bash
sudo apt update
sudo apt install nodejs npm mysql-server nginx
```

3. **Set up MySQL:**
```bash
sudo mysql_secure_installation
sudo mysql -u root -p
CREATE DATABASE dairy_management;
CREATE USER 'dairy_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON dairy_management.* TO 'dairy_user'@'localhost';
FLUSH PRIVILEGES;
```

4. **Clone and deploy:**
```bash
git clone <repository-url>
cd dairy-management-system/server
npm install --production
cp .env.example .env
# Edit .env
pm2 start index.js --name dairy-backend
```

5. **Configure Nginx** (see Frontend Deployment section)

## Environment Variables

### Required Variables

```env
# Server
PORT=5000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=dairy_management
DB_PORT=3306

# Security
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
```

### Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (at least 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Use strong database passwords
- [ ] Restrict database access (firewall rules)
- [ ] Enable rate limiting
- [ ] Set up regular backups
- [ ] Keep dependencies updated
- [ ] Use environment variables (never commit .env)

## Database Backup

### Manual Backup
```bash
mysqldump -u dairy_user -p dairy_management > backup.sql
```

### Automated Backup (Cron)
```bash
# Add to crontab (crontab -e)
0 2 * * * mysqldump -u dairy_user -p'password' dairy_management > /backups/dairy_$(date +\%Y\%m\%d).sql
```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

### Health Check
The application provides a health check endpoint:
```bash
curl http://localhost:5000/api/health
```

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running: `sudo systemctl status mysql`
- Check credentials in .env file
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

### Build Errors
- Clear node_modules and reinstall
- Check Node.js version (should be 14+)
- Verify all dependencies are installed

## Scaling

For high-traffic deployments:
- Use a load balancer (nginx, HAProxy)
- Set up multiple backend instances
- Use Redis for session management
- Implement database connection pooling
- Use CDN for static assets


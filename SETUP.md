# Project Setup Guide

## Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (for production) or SQLite (for development)

## Backend Setup

### 1. Create Environment File
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```
SECRET_KEY=your_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

# APIs
OPENAI_API_KEY=your_openai_key
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_API_KEY=your_adzuna_api_key
```

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 5. Run Development Server
```bash
python manage.py runserver
```
The API will be available at `http://localhost:8000/`

## Frontend Setup

### 1. Create Environment File
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
REACT_APP_API_URL=http://localhost:8000
```

For production, update to your production backend URL.

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Run Development Server
```bash
npm start
```
The application will open at `http://localhost:3000/`

## Important Security Notes

### ✅ What Was Fixed
1. **API Keys**: Removed exposed API keys from frontend code
2. **Environment Variables**: All sensitive data now uses `.env` files
3. **CORS**: Restricted to specific origins instead of allowing all
4. **Database**: Credentials moved to environment variables
5. **Backend Endpoints**: Created `/chat/` and `/jobs/` endpoints to handle API calls securely
6. **Input Validation**: Added validators for model fields
7. **Error Handling**: Improved error messages and logging
8. **Database Indexes**: Added for commonly queried fields

### 🔒 Security Best Practices
1. Never commit `.env` files to git (already in .gitignore)
2. Use environment variables for all sensitive data
3. Change `SECRET_KEY` before production deployment
4. Keep `DEBUG=False` in production
5. Use strong database passwords
6. Rotate API keys regularly
7. Use HTTPS in production

## API Endpoints

### User Management
- `POST /users/` - Create user account
- `GET /users/me/` - Get current user profile
- `PUT /users/me/update/` - Update user profile
- `DELETE /users/me/delete/` - Delete user account
- `GET /users/all/` - List all users

### Careers
- `GET /careers/` - List all careers

### Chat (Requires Authentication)
- `POST /chat/` - Send message to AI chatbot
  ```json
  {
    "message": "Tell me about AI careers",
    "career": "AI Engineering" (optional)
  }
  ```

### Jobs (Requires Authentication)
- `GET /jobs/?query=python&location=us&page=1` - Search jobs

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
python manage.py runserver 8001
```

### Database Errors
```bash
# Reset database (development only)
rm db.sqlite3
python manage.py migrate
```

### API Key Not Found
Make sure `.env` file exists and contains all required keys.

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Update `SECRET_KEY` to a strong random string
3. Update `ALLOWED_HOSTS` with your domain
4. Use PostgreSQL instead of SQLite
5. Collect static files: `python manage.py collectstatic --noinput`
6. Use environment variables for all sensitive data
7. Enable HTTPS
8. Set up proper logging and monitoring

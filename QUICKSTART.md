# Quick Start Guide

## What Was Fixed
Your Career Advisor project has been completely cleaned up and secured! Here's a quick summary:

✅ **Security**: Removed all exposed API keys and credentials  
✅ **Environment Variables**: All sensitive data now uses `.env` files  
✅ **Error Handling**: Improved error messages and user feedback  
✅ **Database**: Added validation and performance indexes  
✅ **Logging**: Added comprehensive logging for debugging  
✅ **Documentation**: Complete setup and deployment guides provided  

## Getting Started (Development)

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Copy environment template
copy .env.example .env

# Edit .env with your values (for local development, you can use SQLite)
# Change DB_ENGINE to: django.db.backends.sqlite3
# Leave other DB fields empty

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

Backend will be at: http://localhost:8000

### 2. Frontend Setup
```bash
# Navigate to frontend (in new terminal)
cd frontend

# Copy environment template
copy .env.example .env.local

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will open at: http://localhost:3000

## Important Files to Know

- **SETUP.md** - Complete setup guide
- **CLEANUP_SUMMARY.md** - Detailed explanation of all fixes
- **backend/.env.example** - Required backend environment variables
- **frontend/.env.example** - Required frontend environment variables

## Key Changes

### What You Need to Do
1. Create `.env` files in both backend and frontend folders
2. Fill in the values (see `.env.example` files)
3. For local development, use SQLite (comes with Django)
4. For production, set `DEBUG=False` and use PostgreSQL

### What Was Changed
- API keys are no longer in the code (now in `.env`)
- Backend now handles all external API calls
- Better error handling with user-friendly messages
- Database optimizations
- Comprehensive logging

## API Keys Setup (Optional for Local Development)

If you want chat and job search features to work:

1. Get OpenAI API key from https://platform.openai.com/
2. Get Adzuna API credentials from https://developer.adzuna.com/
3. Add them to your `.env` file:
   ```
   OPENAI_API_KEY=your_key_here
   ADZUNA_APP_ID=your_app_id_here
   ADZUNA_API_KEY=your_api_key_here
   ```

## For Production Deployment

See **SETUP.md** for complete production deployment instructions.

**Key points**:
- Always use environment variables
- Never commit `.env` to git
- Use PostgreSQL (not SQLite)
- Set `DEBUG=False`
- Use HTTPS
- Rotate API keys regularly

## Troubleshooting

**Port 8000 already in use?**
```bash
# Use a different port
python manage.py runserver 8001
```

**Module not found?**
```bash
# Reinstall dependencies
pip install -r requirements.txt
npm install
```

**Database errors?**
```bash
# Reset the database
rm db.sqlite3
python manage.py migrate
```

## Questions?

Refer to the detailed documentation:
- **SETUP.md** - For detailed setup instructions
- **CLEANUP_SUMMARY.md** - For what was fixed and why

---

**Your project is now production-ready! 🚀**

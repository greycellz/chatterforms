# Development Environment Setup

## 🎯 Current Status

### ✅ Completed:
- **Frontend**: `chatterforms` repository with `develop` branch
- **Backend**: `my-poppler-api` repository renamed to `chatterforms-api` with `develop` branch
- **Production**: Both running on Railway/Vercel

### 📋 Next Steps:

## 1. Railway Development Environment Setup

### Create New Railway Project
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `greycellz/my-poppler-api` repository
4. Set branch to `develop`
5. Name: `chatterforms-api-dev`

### Environment Variables
Copy from production and add:
```bash
NODE_ENV=development
# All other variables remain the same
```

## 2. Vercel Development Environment Setup

### Create Preview Deployment
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select `chatterforms` project
3. Go to Settings → Git
4. Enable "Preview Deployment" for `develop` branch
5. Set environment variables:
   ```bash
   NEXT_PUBLIC_API_URL=https://chatterforms-api-dev.railway.app
   ```

## 3. Test Development Environment

### Test Backend
```bash
# Test the dev API
curl https://chatterforms-api-dev.railway.app/health
```

### Test Frontend
```bash
# Visit the preview URL
https://chatterforms-git-develop-greycellz.vercel.app
```

## 4. Development Workflow

### Daily Development
```bash
# Backend changes
cd my-poppler-api
git checkout develop
# Make changes
git add .
git commit -m "feat: authentication progress"
git push origin develop
# Railway auto-deploys

# Frontend changes  
cd chatterforms
git checkout develop
# Make changes
git add .
git commit -m "feat: authentication UI"
git push origin develop
# Vercel auto-deploys
```

### Production Deployment
```bash
# When ready for production
git checkout main
git merge develop
git push origin main
```

## 🎯 Ready to Start Authentication Implementation

Once the development environments are set up and tested, we can begin:

1. **Backend Authentication** (Railway dev environment)
2. **Frontend Authentication** (Vercel preview environment)
3. **Database Schema Updates** (Firestore with prefixes)

## 📝 Notes

- **Database**: Using same Firestore with collection prefixes for development
- **Environment Isolation**: Separate Railway/Vercel deployments
- **Rollback**: Easy rollback by reverting to main branch
- **Testing**: Full integration testing on development environment

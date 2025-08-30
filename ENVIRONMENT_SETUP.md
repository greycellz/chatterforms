# Environment Management Guide

## 🎯 Overview
This guide outlines how to manage development and production environments for ChatterForms during the authentication implementation phase.

## 📋 Current State
- **Git**: Single `main` branch
- **Railway**: Single production deployment
- **Vercel**: Single production deployment
- **Database**: Single Firestore instance

## 🚀 Environment Strategy

### Git Branch Strategy
```
main (production) ← Current working MVP
├── develop (development) ← New branch for auth features
└── feature/auth-system ← Feature branch (optional)
```

### Railway Environment Strategy
```
Production: chatterforms-api (current)
Development: chatterforms-api-dev (new)
```

### Vercel Environment Strategy
```
Production: chatterforms (current)
Preview: chatterforms-dev (new)
```

---

## 🛠️ Setup Instructions

### 1. Git Branch Management

#### Current Status
- ✅ `main` branch: Production-ready MVP
- ✅ `develop` branch: Created for authentication development

#### Workflow
```bash
# Development workflow
git checkout develop
# Make changes
git add .
git commit -m "feat: add authentication system"
git push origin develop

# When ready for production
git checkout main
git merge develop
git push origin main
```

### 2. Railway Environment Setup

#### Create Development Environment
1. **Create new Railway project**: `chatterforms-api-dev`
2. **Connect to `develop` branch**
3. **Set environment variables**:
   ```bash
   # Copy from production and modify as needed
   GOOGLE_APPLICATION_CREDENTIALS_JSON=...
   NODE_ENV=development
   ```

#### Environment Variables Strategy
```bash
# Production (existing)
NODE_ENV=production
GOOGLE_APPLICATION_CREDENTIALS_JSON=...

# Development (new)
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS_JSON=...
# Add development-specific variables
SENDGRID_API_KEY=...
JWT_SECRET=...
```

### 3. Vercel Environment Setup

#### Create Preview Environment
1. **Create new Vercel project**: `chatterforms-dev`
2. **Connect to `develop` branch**
3. **Set environment variables**:
   ```bash
   # Copy from production and modify
   NEXT_PUBLIC_API_URL=https://chatterforms-api-dev.railway.app
   ```

#### Environment Variables Strategy
```bash
# Production (existing)
NEXT_PUBLIC_API_URL=https://chatterforms-api.railway.app

# Development (new)
NEXT_PUBLIC_API_URL=https://chatterforms-api-dev.railway.app
```

### 4. Database Strategy

#### Option A: Shared Database (Recommended for MVP)
- **Pros**: Simpler, no data migration needed
- **Cons**: Development affects production data
- **Mitigation**: Use different collection prefixes for development

#### Option B: Separate Databases
- **Pros**: Complete isolation
- **Cons**: More complex setup, data migration needed
- **Implementation**: Create separate Firestore projects

#### Recommended Approach: Shared Database with Prefixes
```javascript
// Development collections
const devPrefix = process.env.NODE_ENV === 'development' ? 'dev_' : '';

// Use in code
const usersCollection = `${devPrefix}users`;
const formsCollection = `${devPrefix}forms`;
```

---

## 🔄 Development Workflow

### Daily Development
```bash
# 1. Start development
git checkout develop

# 2. Make changes
# - Update Railway backend (my-poppler-api/)
# - Update Next.js frontend (src/app/)

# 3. Test locally
npm run dev  # Frontend
cd my-poppler-api && npm start  # Backend

# 4. Deploy to development
git add .
git commit -m "feat: authentication progress"
git push origin develop

# 5. Test on development environment
# - https://chatterforms-dev.vercel.app
# - https://chatterforms-api-dev.railway.app
```

### Production Deployment
```bash
# 1. Test thoroughly on development
# 2. Merge to main
git checkout main
git merge develop
git push origin main

# 3. Production automatically deploys
# - Vercel: https://chatterforms.vercel.app
# - Railway: https://chatterforms-api.railway.app
```

---

## 🧪 Testing Strategy

### Development Testing
- **Local testing**: `npm run dev` + Railway backend
- **Development environment**: Full integration testing
- **Feature testing**: Test authentication flows
- **Regression testing**: Ensure existing features work

### Production Testing
- **Smoke testing**: Basic functionality
- **User acceptance**: Real user testing
- **Performance testing**: Load and stress testing
- **Security testing**: Authentication security

---

## 🚨 Rollback Strategy

### Emergency Rollback
```bash
# 1. Revert to previous commit
git checkout main
git reset --hard HEAD~1
git push --force origin main

# 2. Production automatically reverts
# 3. Notify users of temporary issues
```

### Gradual Rollback
```bash
# 1. Disable new features via feature flags
# 2. Monitor error rates
# 3. Gradually rollback if issues persist
```

---

## 📊 Monitoring & Alerts

### Development Monitoring
- **Railway logs**: Monitor backend errors
- **Vercel logs**: Monitor frontend errors
- **Database queries**: Monitor Firestore usage
- **Authentication logs**: Monitor auth attempts

### Production Monitoring
- **Error tracking**: Sentry or similar
- **Performance monitoring**: Vercel Analytics
- **User feedback**: In-app feedback system
- **Security alerts**: Failed login attempts

---

## 🔐 Security Considerations

### Development Security
- **Environment isolation**: Separate API keys
- **Data isolation**: Use prefixes for collections
- **Access control**: Limit development access
- **Logging**: Monitor development activity

### Production Security
- **Authentication**: Secure session management
- **Rate limiting**: Prevent abuse
- **Data encryption**: HIPAA compliance
- **Access logs**: Audit trail

---

## 📝 Environment Checklist

### Development Setup
- [ ] Create `develop` branch
- [ ] Set up Railway development environment
- [ ] Set up Vercel preview environment
- [ ] Configure environment variables
- [ ] Test development deployment
- [ ] Set up monitoring and logging

### Production Protection
- [ ] Ensure `main` branch is stable
- [ ] Set up automated testing
- [ ] Configure rollback procedures
- [ ] Set up monitoring alerts
- [ ] Document emergency procedures

### Team Communication
- [ ] Document environment strategy
- [ ] Train team on workflow
- [ ] Set up communication channels
- [ ] Establish review process
- [ ] Plan user communication

---

## 🎯 Next Steps

1. **Set up Railway development environment**
2. **Set up Vercel preview environment**
3. **Configure environment variables**
4. **Test development workflow**
5. **Begin authentication implementation on `develop` branch**

This setup ensures that:
- ✅ Current MVP remains stable and accessible
- ✅ Development can proceed without affecting production
- ✅ Easy rollback if issues arise
- ✅ Gradual deployment and testing
- ✅ User testing can continue on production

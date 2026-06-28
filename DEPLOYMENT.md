# Deployment Guide

## Overview

This guide covers deploying the Luxe Salon Platform to production using:
- **Frontend**: Vercel (Next.js hosting)
- **Database**: Supabase or Neon (managed PostgreSQL)
- **Backend**: Vercel API Routes or separate Render/Railway instance

## Prerequisites

- GitHub repository with the project code
- Accounts: Vercel, Supabase/Neon, Stripe, Cloudinary, Twilio (optional)
- Domain name (optional but recommended)

## Step 1: Database Setup

### Option A: Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database** and copy the connection string
3. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

### Option B: Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string from the dashboard
3. Format: `postgresql://[USER]@[HOST]/[DATABASE]?sslmode=require`

### Run Migrations

```bash
# Set DATABASE_URL temporarily
export DATABASE_URL="your-connection-string"

# Push schema
npx prisma db push

# Seed data (optional, for demo)
npm run db:seed
```

## Step 2: Environment Configuration

Create these environment variables in your hosting platform:

### Required
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-a-random-64-char-string
JWT_SECRET=generate-a-random-64-char-string
```

### Optional (integrations)
```
# Stripe (payments)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (image storage)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Nodemailer (email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Luxe Salon <bookings@your-domain.com>

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

## Step 3: Deploy to Vercel

### Via GitHub (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Vercel auto-detects Next.js — confirm settings
5. Add all environment variables from Step 2
6. Click **Deploy**

### Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### Post-Deployment

1. Set your custom domain in Vercel dashboard
2. Update `NEXTAUTH_URL` to your domain
3. Run `npx prisma db push` if not done already
4. Test the booking flow end-to-end

## Step 4: Configure Integrations

### Stripe

1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from **Developers → API keys**
3. Create webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.failed`
4. Copy webhook signing secret

### Cloudinary

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get credentials from **Dashboard**
3. Set upload preset for salon images

### Twilio

1. Create account at [twilio.com](https://twilio.com)
2. Get a phone number with SMS capability
3. For WhatsApp, enable WhatsApp sandbox or production access
4. Copy Account SID, Auth Token, and phone numbers

### Email (Nodemailer)

For Gmail:
1. Enable 2FA on your Google account
2. Generate an App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use the app password as `SMTP_PASS`

For production, consider SendGrid, Postmark, or AWS SES.

## Step 5: Custom Domain & SSL

### Vercel

1. Go to **Project Settings → Domains**
2. Add your domain (e.g., `luxesalon.com`)
3. Follow DNS instructions (usually add A/CNAME records)
4. SSL is automatic via Let's Encrypt

### DNS Records

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Step 6: Monitoring & Maintenance

### Logs
- Vercel: **Dashboard → Logs** for runtime logs
- Database: Supabase/Neon dashboard for query logs

### Backups
- Supabase: Automatic daily backups (7-day retention)
- Neon: Point-in-time recovery (branching)
- Consider additional backups for critical data

### Performance
- Vercel Analytics for Core Web Vitals
- Lighthouse CI for regular audits
- Monitor API response times

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Uptime Robot for availability monitoring

## Scaling Considerations

### Database
- Add read replicas for heavy read workloads
- Use connection pooling (Supabase/Neon include this)
- Index frequently queried columns

### API
- Implement caching (Redis/Upstash) for:
  - Service listings
  - Availability slots
  - Static content
- Use edge functions for low-latency responses

### Images
- Serve via Cloudinary with automatic optimization
- Use Next.js Image component (already configured)
- Enable AVIF/WebP formats

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
npx prisma db execute --stdin <<< "SELECT 1"
```

### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading
- Verify variable names match exactly
- Redeploy after adding new variables
- Check for typos in `.env` file

## Support

For issues:
1. Check Vercel deployment logs
2. Review database connection status
3. Verify all environment variables are set
4. Check browser console for client errors
5. Review API route responses in Network tab

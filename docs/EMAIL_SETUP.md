# Email Report Feature Setup Guide

The Route Analyzer now includes an email report feature that allows users to send themselves a beautifully formatted HTML email containing the route analysis with embedded map and elevation chart images.

## Overview

This feature uses [Resend](https://resend.com), a modern email API service that offers a free tier perfect for Vercel deployments:
- **Free tier**: 100 emails/day, 3,000 emails/month
- **No credit card required** for the free tier
- **Easy integration** with Next.js
- **Reliable delivery** with detailed analytics

## Setup Instructions

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name (e.g., "Route Analyzer Production")
5. Copy the API key (it starts with `re_`)

### 3. Configure Environment Variables

#### For Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Resend API key to `.env.local`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

#### For Vercel Deployment

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key (starts with `re_`)
   - **Environments**: Select Production, Preview, and Development
4. Click **Save**
5. Redeploy your application for the changes to take effect

## Email Domain Configuration (Optional)

By default, the email feature uses Resend's test domain (`onboarding@resend.dev`). This works for testing but has limitations:
- Emails may be marked as spam
- Limited to verified email addresses

### Setting Up a Custom Domain

For production use, it's recommended to configure your own domain:

1. Go to **Domains** in your Resend dashboard
2. Click **Add Domain**
3. Enter your domain name (e.g., `yourdomain.com`)
4. Follow the DNS configuration instructions to add the required records
5. Wait for domain verification (usually takes a few minutes)
6. Update the `from` address in `/app/api/send-email/route.ts`:
   ```typescript
   from: 'Route Analyzer <noreply@yourdomain.com>'
   ```

## Feature Details

### What Gets Sent

The email includes:
- **Rich HTML formatting** with professional styling
- **Route summary** with key statistics
- **AI coaching insights** (if OpenAI is configured)
- **High-resolution screenshots**:
  - Elevation profile chart
  - Interactive route map
- **Mile-by-mile breakdown table** with terrain descriptions
- **Mobile-responsive design** for viewing on any device

### Screenshot Capture

The feature uses `html2canvas` to capture client-side screenshots of:
- The elevation chart (SVG converted to PNG)
- The Leaflet map (rendered canvas)

Screenshots are captured at 2x scale for high resolution and embedded directly in the email as base64-encoded data URLs.

### User Experience

1. User clicks the **Email Report** button
2. A modal appears asking for their email address
3. Client captures screenshots of the map and chart
4. Data is sent to the `/api/send-email` endpoint
5. Server generates HTML email and sends via Resend
6. User receives confirmation and the modal auto-closes

## Troubleshooting

### Error: "Email service not configured"

**Cause**: The `RESEND_API_KEY` environment variable is not set.

**Solution**: Add the API key to your environment variables as described above.

### Emails not being received

**Possible causes**:
1. Email is in spam folder - check spam/junk folders
2. Invalid email address - verify the email address is correct
3. Rate limit exceeded - free tier allows 100 emails/day
4. Using test domain - consider setting up a custom domain

**Solution**: Check Resend dashboard logs for delivery status and any errors.

### Screenshot quality issues

**Cause**: Browser rendering or timing issues with html2canvas.

**Solution**: The feature uses a 2x scale for high resolution. If issues persist, check browser console for errors.

### Build errors

**Error**: "Missing API key" during build

**Solution**: The code is designed to work without the API key during build time. The key is only required at runtime. If you see this error, ensure you're using the latest version of the code where `new Resend()` is called inside the request handler, not at module level.

## API Usage Monitoring

Monitor your email usage in the Resend dashboard:
- View sent emails
- Check delivery status
- Monitor rate limits
- Review email opens and clicks

## Cost Considerations

The free tier (100 emails/day) should be sufficient for most personal projects. If you exceed the free tier:
- **Growth Plan**: $20/month for 50,000 emails/month
- **Pro Plan**: Contact Resend for custom pricing

For a running route analyzer, typical usage patterns suggest most users will stay well within the free tier limits.

## Security Notes

- API keys are stored securely as environment variables
- Email addresses are validated before sending
- HTML content is sanitized (though user input is minimal)
- No sensitive data is logged or stored
- Resend provides detailed security and compliance documentation

## Alternative Email Services

While this implementation uses Resend, you could adapt it to use:
- **SendGrid**: Also has a free tier (100 emails/day)
- **AWS SES**: Pay-as-you-go pricing, requires AWS account
- **Nodemailer with Gmail**: Free but requires app-specific password

Resend was chosen for its simplicity, generous free tier, and excellent Next.js integration.

## Support

For issues with:
- **Resend service**: Contact [Resend Support](https://resend.com/support)
- **This implementation**: Open an issue on the GitHub repository

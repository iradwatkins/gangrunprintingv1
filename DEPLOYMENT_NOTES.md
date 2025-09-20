# Deployment Notes - Push Notifications & PWA

## Environment Variables to Add in Dokploy

Add these to your GangRun Printing application environment variables in Dokploy:

```env
# Push Notifications - REQUIRED for notifications to work
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BIzmq1ShjRgxpW4XnHSh2IeXLK6_uLtNMAnnPNJNJ5Pj3DD7JRXFajvI7KZpoujH8J1ZE0Kl-Io5oa8rJRlCIlY
VAPID_PRIVATE_KEY=3e4BbIRQtOoayCLuW7zqWbXLqqxrHNM6pjc9jL8xvDk
VAPID_SUBJECT=mailto:support@gangrunprinting.com
```

## Database Migration

After deployment, the database will automatically apply the new schema for:

- `PushSubscription` table
- `PushNotification` table

## Verify PWA is Working

1. Visit your production site with HTTPS
2. Check for the install button in the browser address bar
3. After 30 seconds, you should see a PWA install prompt
4. After 1 minute, you should see a notification permission prompt

## Testing Push Notifications

1. Enable notifications when prompted
2. Go to any authenticated page
3. Look for "Test Notification" button
4. Click to verify notifications are working

## Important Notes

- PWA requires HTTPS to work (Dokploy with Let's Encrypt handles this)
- Push notifications only work on HTTPS sites
- Service worker will be registered automatically in production
- Dark theme toggle is in the header (sun/moon icon)

## Deployment Steps in Dokploy

1. Go to your GangRun Printing application in Dokploy
2. Add the environment variables above
3. Deploy the latest code from GitHub
4. The application will build and start automatically
5. Visit your site to verify everything is working

# Gmail Integration Setup

## Composio Integration (Currently Implemented)

Your Gmail integration now uses Composio for easier setup and management.

### Required Environment Variables

Add these to your backend functions environment:

```bash
# Composio API Keys
COMPOSIO_API_KEY_DEV=your_composio_dev_key_here
COMPOSIO_API_KEY_PROD=your_composio_prod_key_here
COMPOSIO_REDIRECT_URL=https://app.composio.dev/redirect
```

### Composio Setup

1. **Get Composio API Keys:**
   - Go to [Composio Dashboard](https://app.composio.dev/)
   - Create an account or log in
   - Navigate to API Keys section
   - Copy your API keys for development and production

2. **Configure Gmail in Composio:**
   - In the Composio dashboard, go to "Apps"
   - Find and enable "Gmail"
   - Follow the setup instructions for Gmail API access

3. **Update Environment Variables:**
   - Add the Composio API keys to your backend environment
   - For Firebase Functions, you can set these using:
   ```bash
   firebase functions:config:set composio.api_key_dev="your_dev_key"
   firebase functions:config:set composio.api_key_prod="your_prod_key"
   ```

### Testing the Integration

1. **Connect Gmail:**
   - Go to your app's integrations page
   - Click "Connect" on the Gmail integration
   - This will open a Composio OAuth window
   - Authorize access to your Gmail account
   - The integration should automatically save to your database

2. **Verify Connection:**
   - Check your Firestore database for the integration document
   - The integration should have `provider: 'COMPOSIO'`
   - Test sending an email through your app

### Alternative: Direct Google OAuth (Backup)

If you prefer direct Google OAuth integration instead of Composio:

#### Required Environment Variables
```bash
# Google OAuth Credentials (Alternative to Composio)
G_AUTH_CLIENT_ID=your_google_client_id_here
G_AUTH_CLIENT_SECRET=your_google_client_secret_here
```

#### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000/api/oauth2callback`
     - For production: `https://yourdomain.com/api/oauth2callback`

## Troubleshooting

### Common Issues:

1. **"Composio API key not configured" error**
   - Verify environment variables are set correctly
   - Check if you're using the right environment (dev/prod)
   - Restart your backend services after adding env vars

2. **"Popup blocked" error**
   - Users need to allow popups for your domain
   - Add user-friendly messaging about this

3. **Connection timeout**
   - Check Composio dashboard for connection status
   - Verify your Composio account has Gmail app enabled
   - Check network connectivity

4. **Integration not showing as connected in UI**
   - Verify the integration document was created in Firestore
   - Check that the provider field matches ('COMPOSIO')
   - Look at browser console for any JavaScript errors

### Debugging Steps:

1. **Check Backend Logs:**
   ```bash
   # For Firebase Functions
   firebase functions:log
   ```

2. **Check Frontend Console:**
   - Open browser developer tools
   - Look for errors during the connection process
   - Verify API calls are successful

3. **Verify Firestore Data:**
   - Check that integration documents are being created
   - Verify the structure matches expected format

### Security Notes:

- Never commit API keys to version control
- Use different keys for development and production
- Regularly rotate API keys
- Monitor API usage and quotas
- Review connected accounts periodically

## Integration Benefits

Using Composio provides several advantages:

1. **Simplified OAuth Management** - Composio handles the complex OAuth flows
2. **Better Error Handling** - More robust connection management
3. **Enhanced Security** - Composio manages token refresh and security
4. **Rich API Support** - Access to full Gmail API capabilities
5. **Easy Scaling** - Better support for multiple user connections

# My Files - Personal Cloud Storage

A simple, password-protected file management app using a Worker API backend. Built with vanilla JavaScript - no build tools required.

## Features

- **Password Protection**: API-based authentication with JWT tokens
- **File Upload**: Drag-and-drop or click to browse
- **File Management**: List, download, and delete files
- **Responsive Design**: Works on mobile and desktop
- **Dark Theme**: Monospace font with dark color scheme
- **Simple Deployment**: Deploy to GitHub Pages in minutes
- **Secure Storage**: Files stored in R2 with Cloudflare Workers

## Prerequisites

1. A GitHub account (for deployment)
2. The API is already configured and running at `https://temp-storage-api.gooners.workers.dev`

## Setup Instructions

### Deploy to GitHub Pages

#### Option A: Using GitHub Web Interface

1. Create a new repository on GitHub (e.g., `my-cloud-storage`)
2. Upload all files (`index.html`, `style.css`, `app.js`, `README.md`)
3. Go to **Settings** > **Pages**
4. Under **Source**, select `main` branch
5. Click **Save**
6. Wait 1-2 minutes, then visit: `https://your-username.github.io/my-cloud-storage`

#### Option B: Using Git CLI

```bash
# Initialize git (if not already done)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/your-username/my-cloud-storage.git

# Push to GitHub
git push -u origin main

# Enable GitHub Pages in Settings > Pages
```

## Usage

### Logging In

1. Visit your deployed app URL
2. Enter your password
3. Click **Unlock**
4. The app will authenticate with the API and receive a JWT token
5. You're now logged in!

> **Note**: The password is verified by the Worker API. Contact the API administrator for the correct password.

### Uploading Files

1. Drag and drop files onto the upload zone, or
2. Click the upload zone to browse and select files
3. Multiple files can be uploaded at once
4. Max file size: 50MB per file

### Managing Files

- **Download**: Click the "Download" button next to any file
- **Delete**: Click the "Delete" button and confirm
- **Refresh**: Click the "Refresh" button to reload the file list

### Logging Out

- Click **Logout** in the top-right corner
- This clears your session
- You'll need to enter the password again to access the app

## Security Notes

- **API-based authentication**: Password verification is handled by the Worker API
- **JWT tokens**: Authentication tokens are stored in sessionStorage
- **Session management**: Tokens expire after a period of inactivity
- **Server-side validation**: All file operations are validated by the API
- **Cloudflare R2**: Files are stored securely in Cloudflare's object storage
- **For personal use**: Perfect for temporary file storage and sharing
- **Token security**: Tokens are only stored in sessionStorage and cleared on logout

Security features:
- Password-protected access
- Token-based authentication
- Server-side file access control
- Automatic session expiration

## Troubleshooting

### Can't login / Wrong password
- Make sure you have the correct password from the API administrator
- Check the browser console for error messages
- Verify the API URL is correct in `app.js`
- Check your network connection

### "Session expired" message
- Your authentication token has expired
- Simply login again to get a new token
- Tokens are stored in sessionStorage and cleared on browser close

### Files won't upload
- Check file size (must be under 50MB)
- Verify you're still logged in (token hasn't expired)
- Check browser console for errors
- Ensure you have network connectivity

### Files won't download
- Verify you're still logged in
- Check that the file still exists
- Check browser console for errors

### Can't delete files
- Verify you're still logged in
- Check browser console for errors
- Ensure you have network connectivity

### API not responding
- Check if the Worker API is online
- Verify the API_URL in `app.js` is correct
- Check browser console for CORS or network errors

## Technical Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Cloudflare Workers API
- **Storage**: Cloudflare R2 (object storage)
- **Auth**: JWT-based authentication
- **Hosting**: GitHub Pages (or any static host)
- **Dependencies**: None (no external libraries)
- **Theme**: Dark mode with monospace font

## File Structure

```
/
├── index.html      # Main app structure
├── style.css       # Minimal responsive styles
├── app.js          # All functionality
└── README.md       # This file
```

## Browser Compatibility

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

Requires:
- sessionStorage (for JWT token storage)
- Fetch API
- Modern ES6+ JavaScript

## License

Free to use for personal projects. No warranty provided.

## Credits

Built with:
- [Cloudflare Workers](https://workers.cloudflare.com) - Serverless backend
- [Cloudflare R2](https://developers.cloudflare.com/r2/) - Object storage

# My Files - Personal Cloud Storage

A simple, password-protected file management app using Supabase Storage. Built with vanilla JavaScript - no build tools required.

## Features

- **Password Protection**: Hardcoded SHA-256 password hash (default: "password")
- **File Upload**: Drag-and-drop or click to browse
- **File Management**: List, download, and delete files
- **Responsive Design**: Works on mobile and desktop
- **Dark Theme**: Monospace font with dark color scheme
- **Simple Deployment**: Deploy to GitHub Pages in minutes

## Prerequisites

1. A Supabase account (free tier works)
2. A GitHub account (for deployment)

## Setup Instructions

### 1. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish setting up (~2 minutes)

### 2. Create Storage Bucket

1. In your Supabase dashboard, go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Name it: `files`
4. Set it as **Public** (or Private - both work, but public is simpler)
5. Click **Create bucket**

### 3. Set Storage Policies

1. Click on the `files` bucket
2. Go to the **Policies** tab
3. Click **New Policy**
4. For quick setup, create these policies:

   **Allow Public Uploads:**
   - Policy name: `Allow public uploads`
   - Allowed operation: `INSERT`
   - Target roles: `public`
   - USING expression: `true`

   **Allow Public Downloads:**
   - Policy name: `Allow public downloads`
   - Allowed operation: `SELECT`
   - Target roles: `public`
   - USING expression: `true`

   **Allow Public Deletes:**
   - Policy name: `Allow public deletes`
   - Allowed operation: `DELETE`
   - Target roles: `public`
   - USING expression: `true`

   > **Note**: These policies are permissive for personal use. For better security, implement Supabase Auth and restrict policies to authenticated users.

### 4. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### 5. Configure the App

1. Open `app.js` in your code editor
2. Find these lines at the top:

   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co';  // USER_REPLACES_THIS
   const SUPABASE_ANON_KEY = 'eyJhbGc...';            // USER_REPLACES_THIS
   const AUTH_HASH = 'cd1575bf99398a48ae4f51e6618d2a89af7e8f16fdc89598acaf385b1b460679';
   ```

3. Replace with your actual values:

   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   const AUTH_HASH = 'cd1575bf99398a48ae4f51e6618d2a89af7e8f16fdc89598acaf385b1b460679'; // SHA-256 of "password"
   ```

4. **(Optional) Change the password**: To use a different password, generate a SHA-256 hash:
   - Visit an online SHA-256 generator or use your browser console:
   ```javascript
   const password = "your-new-password";
   const encoder = new TextEncoder();
   const data = encoder.encode(password);
   crypto.subtle.digest('SHA-256', data).then(hash => {
     console.log(Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));
   });
   ```
   - Replace the `AUTH_HASH` value with your generated hash

### 6. Deploy to GitHub Pages

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
2. Enter the password (default: "password")
3. Click **Unlock**
4. You're now logged in!

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

- **Hardcoded password**: The password is hardcoded in the source code as a SHA-256 hash
- **Client-side only**: Password verification happens in your browser
- **No server**: Everything runs on the client, Supabase handles storage
- **Not for sensitive data**: This is "security through obscurity"
- **Supabase policies**: Anyone with your Supabase URL could access files if they bypass the client
- **For personal use**: Perfect for non-sensitive files, convenient personal storage
- **Change the hash**: If deploying publicly, generate a new hash for your own password

For production use with sensitive data, implement:
- Supabase Auth (user accounts)
- Row Level Security (RLS) policies
- Server-side validation

## Troubleshooting

### "Storage not configured" error
- Check that your Supabase URL and key are correct in `app.js`
- Verify the `files` bucket exists in Supabase Storage
- Check that storage policies are set correctly

### Files won't upload
- Check file size (must be under 50MB)
- Verify storage policies allow INSERT
- Check browser console for errors

### Files won't download
- Verify storage policies allow SELECT
- Check that the file still exists in Supabase

### Can't delete files
- Verify storage policies allow DELETE
- Check browser console for errors

### Wrong password / Can't login
- The default password is "password"
- If you changed the `AUTH_HASH` in `app.js`, make sure you're using the correct password
- Check the browser console for errors

## Technical Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Storage**: Supabase Storage
- **Auth**: Hardcoded SHA-256 hash comparison
- **Hosting**: GitHub Pages (or any static host)
- **Dependencies**: Supabase JS SDK (via CDN)
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
- SubtleCrypto API (HTTPS required in production)
- sessionStorage
- Modern ES6+ JavaScript

## License

Free to use for personal projects. No warranty provided.

## Credits

Built with:
- [Supabase](https://supabase.com) - Backend and storage
- [Supabase JS SDK](https://github.com/supabase/supabase-js) - Client library

# Quick Start Guide

Get your Package Registry frontend running in 3 steps!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Backend URL

Create a `.env` file:

```bash
# If your backend runs on http://localhost:8080 (default)
echo "VITE_API_URL=http://localhost:8080" > .env

# OR if your backend uses a different URL, replace it:
# VITE_API_URL=http://localhost:3000
# VITE_API_URL=https://your-backend.com
```

## Step 3: Start the App

```bash
npm run dev
```

That's it! Open the URL shown in your terminal (usually `http://localhost:8080`).

## First Time Usage

1. Click "Sign Up" tab
2. Create an account
3. Login with your credentials
4. Start uploading and browsing packages!

## Need Admin Access?

When logging in, check the "Login as admin" checkbox.

## Common Issues

**Can't connect to backend?**
- Make sure your backend server is running
- Check your `.env` file has the correct `VITE_API_URL`
- Verify the backend URL (with curl or browser)

**Authentication fails?**
- Make sure you created an account first
- Check username/password are correct
- Verify backend authentication endpoint is working

---

For detailed documentation, see [README.md](./README.md)

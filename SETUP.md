# 🚀 Setup & Installation Guide

## Quick Start (2 minutes)

### 1. Install Node.js
If you don't have Node.js installed:
- Download from [nodejs.org](https://nodejs.org/)
- Choose LTS version (recommended)
- Install and verify: `node --version`

### 2. Install Dependencies
```bash
cd github-folder-uploader
npm install
```

This will install:
- Next.js 14
- React 18
- Tailwind CSS
- Required build tools

### 3. Start Development Server
```bash
npm run dev
```

Output will show:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Environments: .env.local
```

### 4. Open in Browser
- Navigate to `http://localhost:3000`
- The app is ready to use!

---

## GitHub Token Setup

### Generate Personal Access Token

1. **Go to GitHub Settings**
   - Visit https://github.com/settings/tokens
   - Or: GitHub Profile → Settings → Developer settings → Personal access tokens

2. **Create New Token**
   - Click "Generate new token (classic)"
   - (Note: Fine-grained tokens also work but need repo scope)

3. **Configure Token**
   - **Name**: "Folder Uploader" or similar
   - **Expiration**: 30, 60, 90 days, or No expiration
   - **Scopes**: Select `repo` (Full control of private repositories)

4. **Generate & Copy**
   - Click "Generate token"
   - Copy the token immediately (you won't see it again!)
   - Store it safely

5. **Use in App**
   - Paste into "Personal Access Token" field in the app
   - It will auto-save to your browser

### Important Security Notes

⚠️ **DO NOT**:
- Share your token with anyone
- Commit it to git/GitHub
- Post it in forums or issues

✅ **DO**:
- Keep it private
- Use it only in this app
- Delete tokens you don't use
- Regenerate if compromised

---

## Project Structure

```
github-folder-uploader/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main app component
│   │   └── globals.css         # Global styles & animations
│   └── ...
├── public/                      # Static files
├── package.json                # Dependencies
├── next.config.js              # Next.js config
├── tailwind.config.js          # Tailwind config
├── tsconfig.json               # TypeScript config
├── README.md                   # Documentation
└── .gitignore                  # Git ignore rules
```

---

## Available Scripts

### Development
```bash
npm run dev
```
- Starts dev server at http://localhost:3000
- Hot reload on file changes
- Full source maps for debugging

### Production Build
```bash
npm run build
npm start
```
- Optimized production build
- Minified JavaScript and CSS
- Best performance

### Linting
```bash
npm run lint
```
- Checks code quality
- Reports issues
- Helps maintain clean code

---

## Troubleshooting Setup

### Issue: "npm: command not found"
**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

### Issue: "Module not found" errors
**Solution**: Run `npm install` again
```bash
npm install
# or clean install
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 3000 already in use
**Solution**: Use different port
```bash
npm run dev -- -p 3001
```

### Issue: Cannot write to directory
**Solution**: Check file permissions
```bash
chmod -R 755 github-folder-uploader
```

### Issue: Old Node.js version
**Solution**: Update Node.js to 16+
```bash
node --version  # Check current version
# Then update from nodejs.org
```

---

## Environment Variables

Create `.env.local` file (optional):

```env
# These are optional - app works without them
NEXT_PUBLIC_GITHUB_TOKEN=your_token_here
NEXT_PUBLIC_GITHUB_USERNAME=your_username
```

Note: The app primarily uses browser's localStorage for credentials.

---

## Browser Support

**Recommended**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile**:
- iOS Safari (iOS 14+)
- Android Chrome (Android 10+)

---

## Performance Tips

1. **Use Chrome/Chromium for best performance**
2. **Close other heavy apps when uploading large folders**
3. **Use wired connection for large uploads**
4. **Clear browser cache if issues occur**

---

## Building for Different Platforms

### Deploy to Vercel (Recommended)
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy (automatic)

### Deploy to Netlify
1. Build: `npm run build`
2. Set build command: `next build`
3. Set publish directory: `.next`
4. Deploy

### Deploy to Your Server
1. Build: `npm run build`
2. Set NODE_ENV: `export NODE_ENV=production`
3. Start: `npm start`
4. Use process manager (PM2, etc.)

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Start dev server
3. ✅ Get GitHub token
4. ✅ Open http://localhost:3000
5. ✅ Start uploading folders!

For more help, check README.md or GitHub issues.

---

**Happy uploading! 🚀**

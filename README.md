# 📁 GitHub Folder Uploader

A modern Next.js application that allows you to upload entire folders to GitHub repositories with real-time progress tracking, live logging, and dynamic repository creation.

## ✨ Features

### Core Features
- **📂 Folder Selection**: Select entire folders including sub-folders using `webkitdirectory` attribute
- **🚀 Sequential Upload**: Uploads files one-by-one to respect GitHub API rate limits
- **📊 Real-time Progress**: Live progress bar showing upload percentage and file count
- **📋 Live Log Console**: Color-coded terminal-style logs for every file operation
- **🔐 Secure Credentials**: Auto-saves GitHub token and username in browser localStorage
- **✅ Success Tracking**: Completion message with direct link to GitHub repository

### Advanced Features
- **📦 Repository Management**: 
  - Upload to existing repositories
  - Create new repositories on-the-fly
  - Public or private repository options
- **🎯 Target Path**: Upload files to specific directories within repository
- **🛡️ Error Handling**: Robust error handling with user-friendly messages
- **🌓 Dark Theme**: Modern glassmorphism design with dark mode
- **📱 Responsive**: Works on desktop and mobile browsers

### Path Sanitization (Android Fix)
- Automatically removes Android Storage Access Framework (SAF) prefixes
- Cleans up duplicate paths from internal storage
- **CRITICAL**: Removes root folder name to prevent nested folder structure

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- GitHub Personal Access Token (with `repo` and `user` scopes)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or Extract the Project**
```bash
cd github-folder-uploader
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

3. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

4. **Open in Browser**
```
http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

## 🔑 Getting Your GitHub Personal Access Token

1. Go to [GitHub Settings → Developer Settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `user`
4. Copy the token (you won't be able to see it again!)
5. Paste into the application

## 📖 Usage Guide

### Step 1: Enter GitHub Credentials
- **GitHub Personal Access Token**: Paste your PAT (auto-saved)
- **GitHub Username**: Enter your GitHub username (auto-saved)

### Step 2: Choose Repository Mode
- **Existing Repository**: Upload to an existing repo
- **Create New**: Create a new repo (shows privacy options)

### Step 3: Enter Repository Details
- **Repository Name**: Name of the repo (required)
- **Target Path**: (Optional) Directory inside repo where files go (e.g., `src/components`)
- **Repository Privacy**: (If creating new) Toggle to make it private

### Step 4: Select Folder
Click the large folder selection area or the "Choose Folder" button to select a folder from your computer.

### Step 5: Review Files
The table shows all files that will be uploaded with their final paths in the repository.

### Step 6: Start Upload
Click the "🚀 Start Upload" button to begin the upload process.

### Step 7: Monitor Progress
- Watch the **progress bar** update in real-time
- Check the **live log console** for detailed status of each file
- See the **success message** when upload completes
- Click "🔗 Open in GitHub" to view your repository

## 🔧 Technical Details

### Architecture
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom CSS
- **State Management**: React Hooks (useState, useEffect, useRef)
- **API**: GitHub REST API v2022-11-28
- **Storage**: Browser localStorage for credentials

### Key Technologies
- `webkitdirectory`: Allows folder selection in file input
- `FileReader API`: Converts files to Base64 for upload
- `fetch API`: Makes HTTP requests to GitHub API
- `Tailwind CSS`: Responsive glassmorphism styling

### Path Sanitization Logic

The `sanitizeFilePath` function handles complex Android path scenarios:

```javascript
// Original path from Android:
"tree/primary:MyFiles/428/mflix_fixed/app/page.tsx"

// After sanitization:
"app/page.tsx"
```

Process:
1. Remove Android SAF prefixes (`tree/`, `primary:`, etc.)
2. Decode URL-encoded characters (`%3A` → `:`, `%2F` → `/`)
3. Remove internal storage references (`MyFiles/428/`)
4. **Remove root folder name** (mflix_fixed/)
5. Clean up extra slashes and normalize path

### API Endpoints Used

#### 1. Create Repository
```
POST /user/repos
```
Request body:
```json
{
  "name": "repository-name",
  "description": "Uploaded via GitHub Folder Uploader",
  "private": false,
  "auto_init": false
}
```

#### 2. Upload File
```
PUT /repos/{owner}/{repo}/contents/{path}
```
Request body:
```json
{
  "message": "Upload filename",
  "content": "base64-encoded-file-content",
  "branch": "main"
}
```

## 💾 Data Storage

### Browser Storage (localStorage)
- **githubToken**: Your GitHub Personal Access Token
- **githubUsername**: Your GitHub username

⚠️ **Security Note**: Only the token and username are stored locally. These are still sensitive - don't share your browser's localStorage data with others.

## ⚙️ Configuration

### Environment Variables (Optional)
Create a `.env.local` file:

```bash
# Optional configuration
NEXT_PUBLIC_APP_NAME="GitHub Folder Uploader"
NEXT_PUBLIC_GITHUB_API_VERSION="2022-11-28"
```

### Tailwind Configuration
Customize colors and styling in `tailwind.config.js`

## 🐛 Troubleshooting

### Issue: "Repository already exists"
**Solution**: Switch to "Existing Repository" mode and enter the existing repo name.

### Issue: Files not appearing in correct path
**Solution**: Ensure you're using a modern browser with `webkitdirectory` support. Check that target path is correctly formatted (e.g., `src/components` not `src/components/`).

### Issue: Upload fails with 401 error
**Solution**: 
- Verify your GitHub token is valid
- Check that token has `repo` scope
- Re-generate token if it's old (>1 year)

### Issue: Android shows weird nested paths
**Solution**: This is handled automatically by the `sanitizeFilePath` function. If issues persist, ensure browser localStorage is enabled.

### Issue: Progress bar not updating
**Solution**: This is normal on slow connections. Check the live log console to see actual upload progress.

## 📊 Performance & Limits

- **File Size Limit**: GitHub API allows up to 100MB per file
- **Rate Limit**: 60 requests/minute for authenticated users
- **Upload Speed**: Depends on file size and internet connection
- **Browser**: Works best on Chrome/Chromium-based browsers

## 🔒 Security Considerations

1. **Token Storage**: Never commit your `.env` files with real tokens
2. **Browser Storage**: localStorage is not encrypted - don't use on shared computers
3. **HTTPS Only**: Always use HTTPS in production
4. **Token Scope**: Use minimal required scopes (only `repo` and `user`)

## 📝 File Structure

```
github-folder-uploader/
├── src/
│   └── app/
│       ├── page.tsx          # Main component (all logic here)
│       ├── layout.tsx         # Root layout
│       └── globals.css        # Global styles
├── public/                    # Static files
├── package.json              # Dependencies
├── next.config.js            # Next.js config
├── tailwind.config.js        # Tailwind config
├── postcss.config.js         # PostCSS config
└── README.md                 # This file
```

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and enhancement requests.

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

- GitHub REST API documentation
- Next.js team for the amazing framework
- Tailwind CSS for beautiful styling
- The web development community

## 📧 Support

For issues, questions, or feature requests, please create an issue on GitHub.

---

**Made with ❤️ | Powered by GitHub REST API**

Happy uploading! 🚀

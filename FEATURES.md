# 🎯 Features Documentation

## Core Features

### 1. 📁 Folder Upload with Subfolder Support
- Upload entire folder structures in one go
- Preserves folder hierarchy
- Supports unlimited nesting levels
- All files and subfolders included

**How it works:**
1. Click "Click to Select Folder"
2. Choose a folder from your computer
3. All files and subfolders are instantly listed
4. Click "Start Upload" to begin

### 2. 🤖 Android Path Sanitization
Automatically cleans up corrupted paths from Android devices:
- Removes `tree/primary:` prefixes
- Removes `document/` prefixes
- Decodes URL-encoded characters (%3A → :, %2F → /)
- Strips the root folder name
- Files upload to correct location

**Example:**
```
❌ Before: tree/primary:MyFiles/428/mflix_fixed/document/app/page.tsx
✅ After:  app/page.tsx
```

### 3. 📦 Repository Management

#### Use Existing Repository
- Upload to a repository you already own
- No new repo created
- Simple and fast

#### Create New Repository
- Create repository directly from the app
- No need to visit GitHub
- Can make it private immediately
- Auto-initializes with README

### 4. 🔐 Security Features

#### Auto-Save Credentials
- Token stored in browser's localStorage
- Username automatically saved
- Auto-fills on next visit
- Never sent to any server (GitHub only)
- You can clear anytime by emptying fields

#### Secure Token Handling
- Token displayed as password field (dots)
- Only transmitted via HTTPS to GitHub
- Not logged or stored anywhere except localStorage
- Tokens are personal - keep them secret!

### 5. 📊 Upload Progress Tracking

#### Real-Time Progress Bar
- Animated bar shows upload percentage
- Updates with each completed file
- Color-coded gradient (purple to pink)
- Responsive and smooth

#### File Count Display
- Shows current file: "5 of 20 files"
- Calculates percentage: "25%"
- Updates in real-time
- Visible while uploading

### 6. 📝 Detailed Log Terminal

#### Log Types
- **⏳ Pending**: File queued for upload
- **✅ Success**: File uploaded successfully
- **❌ Error**: Upload failed with reason
- **ℹ️ Info**: General information messages
- **⚠️ Warning**: Important notices

#### Features
- Color-coded logs (green, red, blue, orange)
- Real-time updates as files upload
- Scrollable terminal interface
- Shows file paths and sizes
- Preserves full history
- Auto-scroll to latest message

#### Example Log:
```
🚀 Starting upload process...
📂 Selected folder with 20 files
📤 Starting file upload to user/repo...
⏳ Uploading src/components/Button.tsx...
✅ Success: src/components/Button.tsx uploaded!
⏳ Uploading src/styles/globals.css...
✅ Success: src/styles/globals.css uploaded!
...
✨ All files uploaded successfully!
```

### 7. ⚡ Sequential File Uploading

#### Smart Upload Strategy
- Files upload one-by-one (sequential)
- 500ms delay between uploads
- Respects GitHub API rate limits
- More reliable than parallel uploads
- Avoids "too many requests" errors

#### Rate Limit Protection
- GitHub: 5000 requests/hour for authenticated users
- Sequential approach: ~120 files/hour
- Plenty of room for safety margin
- Can upload thousands of files

### 8. ✨ Success Notification

#### Completion Screen
- Shows when ALL files uploaded
- Animated appearance with scale effect
- Green checkmark ✅
- Success message

#### Direct GitHub Link
- "Open in GitHub" button
- Opens: `https://github.com/username/reponame`
- Opens in new tab
- View uploaded files immediately

### 9. 🎨 Modern UI Design

#### Glassmorphism Theme
- Frosted glass effect buttons
- Semi-transparent panels
- Blur backdrop effects
- Purple and pink gradients
- Dark theme for eye comfort

#### Responsive Layout
- Desktop: 3-column layout
  - Left: Form (2 cols)
  - Right: Preview + Logs (1 col)
- Tablet: 2-column layout
- Mobile: Single column (stacked)
- Full-width on small screens

#### User Experience
- Clear visual hierarchy
- Intuitive button placements
- Status badges and icons
- Helpful placeholder text
- Disabled states during upload

### 10. 🛠️ Error Handling

#### Input Validation
- Check if token provided
- Check if username provided
- Check if repo name provided
- Check if files selected
- Clear error messages

#### GitHub API Errors
- Invalid token: "Invalid authentication"
- Repo not found: "Repository not found"
- Rate limit: "API rate limit exceeded"
- File too large: "File exceeds size limit"

#### Recovery
- Detailed error in logs
- Can retry upload
- Can change credentials
- Can select different folder
- No data loss

### 11. 💾 Target Folder Path

#### Optional Subdirectory Upload
- Specify where in repo to upload
- Example: `src/components`
- Files go into that folder
- Useful for existing projects

#### Usage
- Leave empty for root upload
- Type path like `images/uploads`
- Path created automatically
- Works with nested folders

### 12. 📱 Mobile Support

#### Web Browser Upload
- Works on Android phones
- Works on iOS/iPad
- Responsive design
- Touch-friendly buttons
- Same features as desktop

#### File Selection
- webkitdirectory support
- Android file picker
- iOS Files app integration
- Easy folder selection

---

## Advanced Features

### Rate Limiting Strategy
```javascript
// Sequential upload with delays
for (let i = 0; i < files.length; i++) {
  await uploadFile(files[i])
  if (i < files.length - 1) {
    await delay(500) // 500ms between files
  }
}
```

### Base64 Encoding
- Files converted to Base64 for API
- Large files handled efficiently
- No file size restriction in code
- GitHub API limits apply

### Path Cleaning Algorithm
```javascript
1. Decode URL characters (%3A → :)
2. Remove SAF prefixes (tree/, document/)
3. Remove duplicate slashes
4. Remove root folder name
5. Return clean relative path
```

### State Management
- React hooks (useState, useEffect, useRef)
- localStorage for persistence
- Real-time progress updates
- Smooth animations

---

## Limitations & Considerations

### File Size Limits
- Single file: GitHub API limits (~100MB)
- Total upload: Only limited by your connection
- Large folders: May take significant time

### API Rate Limits
- GitHub: 5000 requests/hour (authenticated)
- This app: ~120 files/hour safely
- Adequate for most use cases

### Browser Storage
- localStorage: ~5-10MB on most browsers
- Only credentials stored (very small)
- Credentials never expire in app

### Concurrent Uploads
- Sequential uploading (one at a time)
- More reliable than parallel
- Slower but guaranteed success
- Better for API stability

---

## Tips & Best Practices

### 1. Token Management
✅ DO:
- Create token with `repo` scope only
- Use expiring tokens when possible
- Delete unused tokens
- Create new token if compromised

❌ DON'T:
- Share token with anyone
- Use tokens with admin scope
- Commit token to repository
- Post token in public forums

### 2. Upload Preparation
✅ DO:
- Remove unnecessary files first
- Test with small folder first
- Check internet connection
- Have GitHub ready

❌ DON'T:
- Upload huge binary files
- Rename files while uploading
- Close browser during upload
- Use VPN (if having issues)

### 3. After Upload
✅ DO:
- Verify files on GitHub
- Create a proper commit message
- Add README to repo
- Update .gitignore if needed

❌ DON'T:
- Immediately delete local files
- Forget to commit if using existing repo
- Upload credentials or secrets
- Upload temporary files

---

## Keyboard Shortcuts

- **Tab**: Navigate between fields
- **Enter**: Focus file selection or submit
- **Ctrl+A**: Select all logs text
- **Escape**: Close any popups (if added)

---

## Accessibility Features

- Semantic HTML elements
- Proper label associations
- Color contrast compliance
- Keyboard navigation support
- Focus indicators on buttons
- ARIA labels on important elements

---

## Performance Metrics

### Upload Speed
- Average: 5-15 files per second
- Depends on file sizes
- Network speed matters
- GitHub API response time varies

### Browser Memory
- Minimal memory footprint
- Handles large file lists
- Efficient state management
- No memory leaks

### Load Time
- Initial load: ~2-3 seconds
- With cached assets: ~500ms
- No external CDN dependencies
- Fully optimized

---

For more information, see README.md or SETUP.md

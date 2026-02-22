'use client';

import React, { useState, useRef, useEffect } from 'react';

// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

/**
 * Represents a selected file from the folder
 */
interface FileItem {
  file: File;
  relativePath: string;
}

/**
 * Represents a log entry in the upload log console
 */
interface UploadStatus {
  fileName: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  message: string;
  timestamp: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * CRITICAL FUNCTION: Sanitizes file paths from Android Storage Access Framework (SAF)
 * This function:
 * 1. Removes Android SAF prefixes (tree/primary:, document/, etc.)
 * 2. Decodes URL-encoded characters (%3A, %2F, etc.)
 * 3. Removes duplicate paths and prefixes from Android internal storage
 * 4. **MOST IMPORTANT**: Removes the root folder name to keep GitHub repo clean
 * 
 * Example:
 * Input:  "tree/primary:MyFiles/428/mflix_fixed/app/page.tsx"
 * Output: "app/page.tsx"
 * 
 * @param originalPath - The original file path from webkitRelativePath
 * @param file - The File object (optional additional context)
 * @returns Cleaned file path with root folder removed
 */
const sanitizeFilePath = (originalPath: string, file: File): string => {
  // Start with the original path
  let cleanPath = originalPath;

  // STEP 1: Remove Android SAF prefixes
  // These prefixes are added by Android's Storage Access Framework when accessing folders
  // Examples: "tree/primary:", "document/primary:", "primary:"
  cleanPath = cleanPath.replace(/^tree\/[^:]+:/g, '');
  cleanPath = cleanPath.replace(/^document\/[^:]+:/g, '');
  cleanPath = cleanPath.replace(/^primary:/g, '');

  // STEP 2: Decode URL-encoded characters
  // Android may encode special characters like : becomes %3A and / becomes %2F
  cleanPath = decodeURIComponent(cleanPath);

  // STEP 3: Remove common Android duplicates and internal storage references
  // Pattern: "MyFiles/428/" prefix from Android internal storage paths
  cleanPath = cleanPath.replace(/^MyFiles\/\d+\//g, '');
  // Remove duplicate "primary:" references that might appear mid-path
  cleanPath = cleanPath.replace(/\/primary:[^/]*/g, '');

  // STEP 4: Remove leading slashes (normalize path start)
  cleanPath = cleanPath.replace(/^\//g, '');

  // STEP 5: Clean up multiple consecutive slashes (normalize separators)
  cleanPath = cleanPath.replace(/\/+/g, '/');

  // STEP 6: **CRITICAL** Remove root folder name from the path
  // This is the most important step to fix the nested folder issue
  // When user selects "mflix_fixed" folder, we want files to be uploaded as:
  // "app/page.tsx" not "mflix_fixed/app/page.tsx"
  // 
  // Method: Split path by /, remove first element (root folder), rejoin
  const pathParts = cleanPath.split('/');
  if (pathParts.length > 1) {
    // More than one directory level, so remove the root folder name
    cleanPath = pathParts.slice(1).join('/');
  }

  return cleanPath;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * GitHub Folder Uploader - Main React Component
 * Handles:
 * - Folder selection with webkitdirectory attribute
 * - Credential management with localStorage
 * - Sequential file uploads to GitHub via REST API
 * - Real-time progress tracking and live logging
 * - Repository creation with public/private options
 */
export default function Home() {
  // ==========================================================================
  // STATE MANAGEMENT - FORM INPUTS
  // ==========================================================================

  // GitHub API credentials
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [repoName, setRepoName] = useState('');
  const [targetPath, setTargetPath] = useState('');

  // ==========================================================================
  // STATE MANAGEMENT - REPOSITORY MODE
  // ==========================================================================

  // Controls whether to use existing repository or create new one
  const [repoMode, setRepoMode] = useState<'existing' | 'create'>('existing');
  // Controls repository privacy (only relevant when creating new repo)
  const [isPrivate, setIsPrivate] = useState(false);

  // ==========================================================================
  // STATE MANAGEMENT - FILE UPLOAD
  // ==========================================================================

  // List of selected files with sanitized paths
  const [files, setFiles] = useState<FileItem[]>([]);
  // Whether upload process is currently active
  const [uploading, setUploading] = useState(false);
  // Upload progress percentage (0-100)
  const [uploadProgress, setUploadProgress] = useState(0);
  // Array of log entries showing real-time upload status
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  // Whether all files have been successfully uploaded
  const [uploadCompleted, setUploadCompleted] = useState(false);

  // ==========================================================================
  // STATE MANAGEMENT - COMPONENT HYDRATION
  // ==========================================================================

  // Flag to prevent hydration errors from localStorage access
  const [isClient, setIsClient] = useState(false);

  // ==========================================================================
  // REFERENCES
  // ==========================================================================

  // Reference to hidden file input for folder selection
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Reference to log console div for auto-scrolling to bottom
  const logConsoleRef = useRef<HTMLDivElement>(null);

  // ==========================================================================
  // EFFECTS - LOAD/SAVE CREDENTIALS
  // ==========================================================================

  /**
   * Effect: Load saved credentials from localStorage on component mount
   * 
   * This runs only once when component mounts to prevent hydration errors
   * Fills in form fields with previously saved credentials if available
   */
  useEffect(() => {
    setIsClient(true);

    // Try to get saved credentials from browser localStorage
    const savedToken = localStorage.getItem('githubToken');
    const savedUsername = localStorage.getItem('githubUsername');

    // If credentials were previously saved, restore them to state
    if (savedToken) setToken(savedToken);
    if (savedUsername) setUsername(savedUsername);
  }, []); // Empty dependency array = runs only on mount

  /**
   * Effect: Save credentials to localStorage whenever they change
   * 
   * This provides auto-save functionality:
   * - User enters token → automatically saved to localStorage
   * - User enters username → automatically saved to localStorage
   * - Page reload → credentials restored automatically
   */
  useEffect(() => {
    if (!isClient) return; // Don't save if not on client-side yet

    localStorage.setItem('githubToken', token);
    localStorage.setItem('githubUsername', username);
  }, [token, username, isClient]);

  /**
   * Effect: Auto-scroll log console to bottom when new logs are added
   * 
   * Provides better user experience by automatically showing latest log entries
   * without user needing to manually scroll
   */
  useEffect(() => {
    if (logConsoleRef.current) {
      logConsoleRef.current.scrollTop = logConsoleRef.current.scrollHeight;
    }
  }, [uploadStatuses]);

  // ==========================================================================
  // EVENT HANDLERS - FILE SELECTION
  // ==========================================================================

  /**
   * Handler: Process folder selection via file input element
   * 
   * When user selects a folder:
   * 1. Extract all files from FileList
   * 2. Get webkitRelativePath for each file
   * 3. Sanitize paths (remove Android SAF prefixes, root folder)
   * 4. Store in state for display and upload
   */
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    // Convert FileList to array with sanitized paths
    const fileArray: FileItem[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      // Get the relative path within the selected folder
      // This is a Chromium feature that's widely supported on modern browsers
      const relativePath = (file as any).webkitRelativePath || file.name;

      fileArray.push({
        file,
        // CRITICAL: Sanitize the path to remove Android prefixes and root folder
        relativePath: sanitizeFilePath(relativePath, file),
      });
    }

    // Reset upload state when new folder is selected
    setFiles(fileArray);
    setUploadProgress(0);
    setUploadStatuses([]);
    setUploadCompleted(false);
  };

  // ==========================================================================
  // LOGGING UTILITIES
  // ==========================================================================

  /**
   * Utility: Add a log entry to the live upload log console
   * 
   * This is used throughout the upload process to provide real-time feedback
   * Shows file status, errors, success messages, etc.
   * 
   * @param fileName - Name of the file being processed
   * @param status - Status type (pending, uploading, success, error)
   * @param message - Descriptive message with emoji and details
   */
  const addLog = (fileName: string, status: UploadStatus['status'], message: string) => {
    // Get current time for the log entry
    const timestamp = new Date().toLocaleTimeString();

    // Add new log entry to the state array
    // This will automatically trigger re-render and show the log
    setUploadStatuses((prev) => [...prev, { fileName, status, message, timestamp }]);
  };

  // ==========================================================================
  // API FUNCTIONS - REPOSITORY CREATION
  // ==========================================================================

  /**
   * API Call: Create a new GitHub repository
   * 
   * Makes POST request to GitHub REST API: /user/repos
   * Creates a new public or private repository under the authenticated user
   * 
   * Request body includes:
   * - name: Repository name (required)
   * - description: About the repo
   * - private: Boolean flag for private repo
   * - auto_init: Whether to initialize with README (we set to false)
   * 
   * Response: Created repository details including ID, URL, etc.
   * 
   * Error handling:
   * - 401 Unauthorized: Invalid token
   * - 422 Unprocessable: Repository name already exists
   * 
   * @returns Promise<boolean> - True if repository was created successfully
   */
  const createRepository = async (): Promise<boolean> => {
    try {
      // Log that we're starting repository creation
      addLog('System', 'uploading', `🔄 Creating new repository "${repoName}"...`);

      // Make POST request to GitHub API to create new repository
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          // Authorization header with Personal Access Token
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
          // Specific GitHub API version for consistency
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          name: repoName,
          description: `Uploaded via GitHub Folder Uploader`,
          private: isPrivate,
          auto_init: false, // Don't auto-initialize with README
        }),
      });

      // Check if request was successful
      if (!response.ok) {
        // Try to get detailed error message from GitHub API
        const errorData = await response.json();

        // Handle specific error case: repository already exists
        if (response.status === 422) {
          addLog(
            'System',
            'error',
            `❌ Repository "${repoName}" already exists. Please use "Existing Repository" mode.`
          );
          return false;
        }

        // Throw generic error for other cases
        throw new Error(errorData.message || 'Failed to create repository');
      }

      // Log success message
      addLog('System', 'success', `✅ Repository "${repoName}" created successfully!`);
      return true;
    } catch (error: any) {
      // Catch and log any errors that occurred during repository creation
      addLog('System', 'error', `❌ Error creating repository: ${error.message}`);
      return false;
    }
  };

  // ==========================================================================
  // API FUNCTIONS - FILE UPLOAD
  // ==========================================================================

  /**
   * Main Upload Function: Orchestrates sequential file uploads to GitHub
   * 
   * Process:
   * 1. Validate all inputs (token, username, repo name, files selected)
   * 2. If "Create New" mode: Create repository first
   * 3. For each file:
   *    a. Read file and convert to Base64
   *    b. Construct GitHub API path
   *    c. Make PUT request to GitHub
   *    d. Log result (success or error)
   * 4. Update progress bar
   * 5. Mark upload as completed when all files done
   * 
   * GitHub API Endpoint: PUT /repos/{owner}/{repo}/contents/{path}
   * This endpoint creates or updates a file in the repository
   * 
   * Why sequential (not parallel)?
   * - GitHub API has rate limits (60 requests/min for authenticated users)
   * - Sequential uploads ensure we don't hit rate limits
   * - Easier to track progress and handle errors
   */
  const uploadFilesToGitHub = async () => {
    // =======================================================================
    // STEP 1: VALIDATION
    // =======================================================================

    // Check that all required credentials are filled in
    if (!token || !username || !repoName) {
      alert('Please fill in all required fields (Token, Username, Repository Name)');
      return;
    }

    // Check that at least one file was selected
    if (files.length === 0) {
      alert('Please select a folder to upload');
      return;
    }

    // =======================================================================
    // STEP 2: INITIALIZE UPLOAD STATE
    // =======================================================================

    // Mark that upload is in progress (disables button, shows progress bar)
    setUploading(true);
    // Clear any previous logs
    setUploadStatuses([]);
    // Reset progress to 0%
    setUploadProgress(0);
    // Mark upload as not completed (in case this is a retry)
    setUploadCompleted(false);

    try {
      // =======================================================================
      // STEP 3: CREATE REPOSITORY IF NEEDED
      // =======================================================================

      // If user selected "Create New Repository" mode
      if (repoMode === 'create') {
        // Call repository creation API
        const created = await createRepository();
        // If creation failed, stop the upload process
        if (!created) {
          setUploading(false);
          return;
        }
      }

      // =======================================================================
      // STEP 4: SEQUENTIAL FILE UPLOAD LOOP
      // =======================================================================

      // Use for...of loop (not Promise.all) to ensure sequential uploads
      // This respects GitHub API rate limits
      for (let i = 0; i < files.length; i++) {
        // Destructure file info from current file
        const { file, relativePath } = files[i];
        const fileName = file.name;

        // Log that we're starting to upload this file
        addLog(fileName, 'uploading', `⏳ Uploading ${fileName}...`);

        try {
          // ================================================================
          // CONVERT FILE TO BASE64
          // ================================================================

          // Use FileReader API to read file content as Base64
          // Base64 is required by GitHub API (can't upload binary directly)
          const fileContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            // When file reading is complete
            reader.onload = () => {
              // FileReader.result returns data URL like: "data:text/plain;base64,SGVsbG8..."
              const result = reader.result as string;
              // Extract just the Base64 part (after the comma)
              const base64 = result.split(',')[1];
              resolve(base64);
            };

            // If file reading fails
            reader.onerror = reject;

            // Start reading file as data URL (Base64 encoded)
            reader.readAsDataURL(file);
          });

          // ================================================================
          // CONSTRUCT GITHUB API PATH
          // ================================================================

          // Build the path where file will be uploaded in the repository
          // relativePath is already sanitized (root folder removed)
          // If user specified a targetPath, prepend it
          const finalPath = targetPath
            ? `${targetPath}/${relativePath}`
            : relativePath;

          // ================================================================
          // MAKE PUT REQUEST TO GITHUB API
          // ================================================================

          // Use GitHub REST API to create/update file
          // Endpoint: PUT /repos/{owner}/{repo}/contents/{path}
          const uploadResponse = await fetch(
            `https://api.github.com/repos/${username}/${repoName}/contents/${finalPath}`,
            {
              method: 'PUT',
              headers: {
                // Authentication token
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                // Specific GitHub API version
                'X-GitHub-Api-Version': '2022-11-28',
              },
              // Request body with file content
              body: JSON.stringify({
                message: `Upload ${fileName}`, // Commit message
                content: fileContent, // File content in Base64
                branch: 'main', // Upload to main branch
              }),
            }
          );

          // ================================================================
          // HANDLE RESPONSE
          // ================================================================

          // Check if upload was successful
          if (uploadResponse.ok) {
            // Success! Log the successful upload
            addLog(fileName, 'success', `✅ Successfully uploaded ${fileName}`);
          } else {
            // Upload failed, try to get error details from GitHub API
            const errorData = await uploadResponse.json();
            addLog(
              fileName,
              'error',
              `❌ Failed to upload ${fileName}: ${errorData.message || 'Unknown error'}`
            );
          }
        } catch (error: any) {
          // Catch any unexpected errors during file upload
          addLog(
            fileName,
            'error',
            `❌ Error uploading ${fileName}: ${error.message}`
          );
        }

        // ================================================================
        // UPDATE PROGRESS BAR
        // ================================================================

        // Calculate progress percentage (0-100)
        const progress = Math.round(((i + 1) / files.length) * 100);
        setUploadProgress(progress);
      }

      // =======================================================================
      // STEP 5: MARK UPLOAD AS COMPLETED
      // =======================================================================

      // All files have been processed (successfully or with errors)
      setUploadCompleted(true);
    } catch (error: any) {
      // Catch any unexpected errors during the entire upload process
      alert(`Error: ${error.message}`);
    } finally {
      // =======================================================================
      // STEP 6: CLEANUP
      // =======================================================================

      // Mark upload as no longer in progress
      // This re-enables the upload button for potential retries
      setUploading(false);
    }
  };

  // ==========================================================================
  // RENDER / JSX - RETURN COMPONENT UI
  // ==========================================================================

  // Only render component after hydration (to avoid hydration errors)
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* ====================================================================
            HEADER SECTION - TITLE AND DESCRIPTION
            ==================================================================== */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
            GitHub Folder Uploader
          </h1>
          <p className="text-slate-300">Upload entire folders to your GitHub repository with ease</p>
        </div>

        {/* ====================================================================
            MAIN CONTAINER WITH GLASSMORPHISM EFFECT
            ==================================================================== */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
          
          {/* ==================================================================
              SECTION 1: CONFIGURATION FORM - GITHUB CREDENTIALS & OPTIONS
              ================================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Field: GitHub Personal Access Token */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                🔐 GitHub Personal Access Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
              />
              <p className="text-xs text-slate-400 mt-1">Your token is saved locally in browser storage (localStorage)</p>
            </div>

            {/* Field: GitHub Username */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                👤 GitHub Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-username"
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
              />
              <p className="text-xs text-slate-400 mt-1">This will also be auto-saved in browser storage</p>
            </div>

            {/* Field: Repository Mode Toggle */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                📦 Repository Mode
              </label>
              <div className="flex gap-4">
                {/* Option 1: Use Existing Repository */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="repoMode"
                    value="existing"
                    checked={repoMode === 'existing'}
                    onChange={() => setRepoMode('existing')}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-300">Existing Repository</span>
                </label>

                {/* Option 2: Create New Repository */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="repoMode"
                    value="create"
                    checked={repoMode === 'create'}
                    onChange={() => setRepoMode('create')}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-300">Create New</span>
                </label>
              </div>
            </div>

            {/* Field: Repository Name */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                📝 Repository Name
              </label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-awesome-repo"
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
              />
            </div>

            {/* Field: Target Path in Repository (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                🎯 Target Path (Optional)
              </label>
              <input
                type="text"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                placeholder="src/components"
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition"
              />
              <p className="text-xs text-slate-400 mt-1">If specified, files will be placed inside this folder</p>
            </div>

            {/* Field: Repository Privacy Toggle (Only shows when creating new repo) */}
            {repoMode === 'create' && (
              <div>
                <label className="block text-sm font-semibold text-blue-300 mb-2">
                  🔒 Repository Privacy
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(!isPrivate)}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-300">
                    {isPrivate ? 'Private Repository' : 'Public Repository'}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* ==================================================================
              SECTION 2: FOLDER SELECTION AREA
              Interactive drag-and-drop / click area to select folder
              ================================================================== */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-400/50 rounded-2xl p-12 text-center cursor-pointer transition hover:border-blue-300 hover:bg-blue-400/5 mb-8"
          >
            <div className="text-5xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-white mb-2">Select Folder to Upload</h3>
            <p className="text-slate-400 mb-4">Click here to choose a folder from your device</p>
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold text-white">
              Choose Folder
            </div>

            {/* Hidden file input with webkitdirectory attribute
                This allows users to select entire folders instead of individual files */}
            <input
              ref={fileInputRef}
              type="file"
              webkitdirectory="true"
              multiple
              onChange={handleFolderSelect}
              className="hidden"
            />
          </div>

          {/* ==================================================================
              SECTION 3: FILES LIST TABLE
              Shows all selected files and their paths in the repository
              ================================================================== */}
          {files.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                📄 Files to Upload ({files.length})
              </h3>
              <div className="max-h-64 overflow-y-auto rounded-xl bg-slate-700/30 border border-slate-600">
                <table className="w-full text-sm text-slate-300">
                  <thead className="sticky top-0 bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">File Name</th>
                      <th className="px-4 py-3 text-left font-semibold">Path in Repo</th>
                      <th className="px-4 py-3 text-right font-semibold">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((item, index) => {
                      // Calculate final path based on whether targetPath was specified
                      const finalPath = targetPath
                        ? `${targetPath}/${item.relativePath}`
                        : item.relativePath;

                      return (
                        <tr key={index} className="border-t border-slate-600/30 hover:bg-slate-600/20">
                          <td className="px-4 py-3">{item.file.name}</td>
                          <td className="px-4 py-3 text-slate-400">{finalPath}</td>
                          <td className="px-4 py-3 text-right">{(item.file.size / 1024).toFixed(2)} KB</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================================
              SECTION 4: UPLOAD PROGRESS BAR
              Shown during active upload process
              ================================================================== */}
          {uploading && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-white">Upload Progress</h3>
                <span className="text-blue-300 font-semibold">
                  {Math.round((uploadProgress / 100) * files.length)} / {files.length} files
                </span>
              </div>
              {/* Progress bar container */}
              <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600">
                {/* Progress bar fill - animates smoothly as progress increases */}
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {/* Percentage display below progress bar */}
              <p className="text-slate-400 text-sm mt-2">{uploadProgress}% Complete</p>
            </div>
          )}

          {/* ==================================================================
              SECTION 5: SUCCESS MESSAGE & OPEN REPOSITORY BUTTON
              Shown after upload completes successfully (100%)
              ================================================================== */}
          {uploadCompleted && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/50 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">✅</span>
                <h3 className="text-xl font-semibold text-green-300">Upload Completed Successfully!</h3>
              </div>
              <p className="text-slate-300 mb-4">Your folder has been uploaded to your GitHub repository.</p>
              {/* Dynamic link to the GitHub repository
                  Opens in new tab with target="_blank" */}
              <a
                href={`https://github.com/${username}/${repoName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:from-green-600 hover:to-emerald-600 transition"
              >
                🔗 Open in GitHub
              </a>
            </div>
          )}

          {/* ==================================================================
              SECTION 6: LIVE UPLOAD LOG CONSOLE
              Shows real-time status updates as files are uploaded
              ================================================================== */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">📋 Live Upload Log</h3>
            {/* Log console container with auto-scroll */}
            <div
              ref={logConsoleRef}
              className="w-full h-64 bg-slate-900/50 border border-slate-600 rounded-lg p-4 overflow-y-auto font-mono text-sm"
            >
              {uploadStatuses.length === 0 ? (
                <div className="text-slate-500">Logs will appear here during upload...</div>
              ) : (
                // Display each log entry with appropriate color based on status
                uploadStatuses.map((status, index) => (
                  <div key={index} className="text-slate-300 mb-2">
                    <span className="text-slate-500">[{status.timestamp}]</span>{' '}
                    <span
                      className={
                        status.status === 'success'
                          ? 'text-green-400'
                          : status.status === 'error'
                            ? 'text-red-400'
                            : status.status === 'uploading'
                              ? 'text-yellow-400'
                              : 'text-slate-300'
                      }
                    >
                      {status.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ==================================================================
              SECTION 7: MAIN UPLOAD BUTTON
              Triggers the entire upload process
              ================================================================== */}
          <button
            onClick={uploadFilesToGitHub}
            // Disable button if already uploading or no files selected
            disabled={uploading || files.length === 0}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed font-bold text-white rounded-xl transition text-lg"
          >
            {uploading ? '⏳ Uploading...' : '🚀 Start Upload'}
          </button>
        </div>

        {/* ====================================================================
            FOOTER SECTION
            ==================================================================== */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>Made with ❤️ | Powered by GitHub REST API</p>
        </div>
      </div>
    </div>
  );
}

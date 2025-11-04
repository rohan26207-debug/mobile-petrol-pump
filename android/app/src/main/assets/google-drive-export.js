/**
 * === Google Drive Export Integration (Final Unified Version) ===
 * Works in both Web and Android WebView builds.
 * - Android uses redirect URI: com.mobilepetrolpump:/oauth2redirect
 * - Web uses redirect URI: http://localhost
 */

// Global token cache
let googleAccessToken = null;

/**
 * Get platform-specific OAuth configuration
 */
function getGoogleOAuthConfig() {
  const isAndroid = !!window.MPumpCalcAndroid;
  return {
    client_id: window.ANDROID_OAUTH_CLIENT_ID || '411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com',
    redirect_uri: isAndroid ? 'com.mobilepetrolpump:/oauth2redirect' : 'http://localhost',
    scope: 'https://www.googleapis.com/auth/drive.file',
    response_type: 'token',
    include_granted_scopes: 'true',
    prompt: 'consent'
  };
}

/**
 * Build the OAuth URL for login
 */
function buildGoogleOAuthUrl() {
  const params = new URLSearchParams(getGoogleOAuthConfig()).toString();
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Entry point — Call this to trigger export flow
 * Usage: exportToGoogleDrive()
 */
async function exportToGoogleDrive() {
  try {
    // 1️⃣ Check if token already available from previous session
    if (googleAccessToken) {
      console.log('Using cached access token...');
      await uploadBackupToDrive(googleAccessToken);
      return;
    }

    // 2️⃣ Otherwise start OAuth flow
    const authUrl = buildGoogleOAuthUrl();
    console.log('🔗 OAuth URL:', authUrl);

    // Open Google OAuth in Android WebView (native bridge)
    if (window.MPumpCalcAndroid && window.MPumpCalcAndroid.openGoogleOAuth) {
      window.MPumpCalcAndroid.openGoogleOAuth(authUrl);
      console.log('📱 Opening Google OAuth in browser...');
    } else {
      // Fallback for testing in desktop browser
      console.log('🌐 Desktop mode: redirecting to OAuth...');
      window.location.href = authUrl;
    }
  } catch (err) {
    console.error('❌ Drive export error:', err);
    alert('Failed to start Google Drive export: ' + err.message);
  }
}

/**
 * Callback invoked by Android when OAuth completes successfully
 * This is called from MainActivity.java via evaluateJavascript()
 */
function handleGoogleOAuthCallback(token) {
  if (!token) {
    console.error('❌ Google login failed: no token received');
    alert('Google login failed.');
    return;
  }

  console.log('✅ Received Google access token:', token.substring(0, 20) + '...');
  googleAccessToken = token;

  // Immediately upload latest backup file
  uploadBackupToDrive(token);
}

/**
 * Get local backup data
 */
async function getBackupData() {
  const backup = localStorage.getItem('mpump_backup');
  if (backup) {
    try {
      return JSON.parse(backup);
    } catch (e) {
      console.warn('Failed to parse mpump_backup, using raw data');
    }
  }
  
  // Fallback: collect all localStorage data
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = localStorage.getItem(key);
  }
  return data;
}

/**
 * === Upload or Overwrite backup.json ===
 * 1. Searches Drive for existing file
 * 2. If found → update existing file
 * 3. Else → create new one
 */
async function uploadBackupToDrive(token) {
  try {
    console.log('📤 Starting backup upload to Drive...');
    
    const headers = {
      'Authorization': 'Bearer ' + token
    };

    // 🔸 Step 1: Search for existing backup.json
    const searchRes = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=name='backup.json' and trashed=false&fields=files(id,name)",
      { headers }
    );

    const searchData = await searchRes.json();
    const existingFile = searchData.files?.[0];

    // 🔸 Step 2: Get backup data
    const jsonData = await getBackupData();

    // 🔸 Step 3: Build multipart upload body
    const metadata = {
      name: 'backup.json',
      mimeType: 'application/json'
    };
    
    const boundary = 'mpumpBoundary' + Date.now();
    const delimiter = '--' + boundary + '\r\n';
    const closeDelimiter = '--' + boundary + '--';

    const body =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      '\r\n' +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(jsonData) +
      '\r\n' +
      closeDelimiter;

    // 🔸 Step 4: Upload or Update
    let res;
    if (existingFile) {
      console.log('📄 Found existing backup.json, updating:', existingFile.id);
      res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`,
        {
          method: 'PATCH',
          headers: {
            ...headers,
            'Content-Type': 'multipart/related; boundary=' + boundary
          },
          body: body
        }
      );
    } else {
      console.log('🆕 Creating new backup.json file...');
      res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'multipart/related; boundary=' + boundary
          },
          body: body
        }
      );
    }

    if (res.ok) {
      const result = await res.json();
      console.log('✅ Backup successfully uploaded! File ID:', result.id);
      alert('✅ Backup successfully uploaded to Google Drive!');
      
      // Store success info
      localStorage.setItem('last_drive_backup', new Date().toISOString());
      localStorage.setItem('last_drive_file_id', result.id);
      
    } else {
      const err = await res.text();
      console.error('❌ Drive upload failed:', res.status, err);
      alert('Upload failed (HTTP ' + res.status + '):\n' + err);
    }
  } catch (err) {
    console.error('❌ Upload error:', err);
    alert('Drive upload error: ' + err.message);
  }
}

/**
 * Check if user is connected to Google Drive
 */
function isConnectedToDrive() {
  return googleAccessToken !== null;
}

/**
 * Get last backup timestamp
 */
function getLastBackupTime() {
  return localStorage.getItem('last_drive_backup') || 'Never';
}

/**
 * Clear cached token (sign out)
 */
function disconnectFromDrive() {
  googleAccessToken = null;
  localStorage.removeItem('last_drive_backup');
  localStorage.removeItem('last_drive_file_id');
  console.log('🔓 Disconnected from Google Drive');
  alert('Disconnected from Google Drive');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    exportToGoogleDrive,
    handleGoogleOAuthCallback,
    uploadBackupToDrive,
    isConnectedToDrive,
    getLastBackupTime,
    disconnectFromDrive
  };
}

// Make available globally for Android callbacks
window.exportToGoogleDrive = exportToGoogleDrive;
window.handleGoogleOAuthCallback = handleGoogleOAuthCallback;
window.onGoogleDriveTokenReceived = handleGoogleOAuthCallback; // Alias for Android
window.isConnectedToDrive = isConnectedToDrive;
window.getLastBackupTime = getLastBackupTime;
window.disconnectFromDrive = disconnectFromDrive;

console.log('✅ Google Drive Export module loaded');

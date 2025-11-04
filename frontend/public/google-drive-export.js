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
 * Upload backup.json to Google Drive (browser-side upload)
 * This runs in JavaScript after receiving the token
 */
async function uploadBackupToDrive(token) {
  try {
    console.log('📤 Starting backup upload to Drive...');
    
    // Get your backup data from app's local storage
    const backupData = localStorage.getItem('mpump_backup') || 
                       localStorage.getItem('petrol_pump_data') || 
                       JSON.stringify({
                         timestamp: new Date().toISOString(),
                         message: 'Backup from Mobile Petrol Pump',
                         sales: [],
                         credit: [],
                         income: [],
                         expenses: []
                       });
    
    const blob = new Blob([backupData], { type: 'application/json' });

    const metadata = {
      name: `backup_${new Date().toISOString().replace(/[:.]/g, '_')}.json`,
      mimeType: 'application/json'
    };

    const boundary = '-------MPumpCalcFormBoundary' + Date.now();
    
    // Build multipart request body
    const body =
      `--${boundary}\r\n` +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) + '\r\n' +
      `--${boundary}\r\n` +
      'Content-Type: application/json\r\n\r\n';

    const end = `\r\n--${boundary}--`;

    // Combine all parts
    const blobArrayBuffer = await blob.arrayBuffer();
    const formData = new Blob(
      [body, blobArrayBuffer, end], 
      { type: 'multipart/related; boundary=' + boundary }
    );

    // Upload to Drive REST API
    console.log('📡 Uploading to Google Drive API...');
    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'multipart/related; boundary=' + boundary
      },
      body: formData
    });

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

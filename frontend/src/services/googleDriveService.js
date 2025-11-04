// Google Drive Backup Service

// Web Client ID (for browser OAuth flows)
const WEB_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com';

// Detect platform and use appropriate Client ID
const GOOGLE_CLIENT_ID = (() => {
  // Check if running in Android WebView
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = ua.includes('android');
  const isWebView = ua.includes('wv') || ua.includes('mpumpcalc') || typeof window.MPumpCalcAndroid !== 'undefined';
  
  if (isAndroid && isWebView && window.ANDROID_OAUTH_CLIENT_ID) {
    // ANDROID_OAUTH_CLIENT_ID is injected by MainActivity.java
    // It actually contains the WEB_CLIENT_ID because browser OAuth MUST use Web client
    console.log('Using Web Client ID for Android browser OAuth flow');
    return window.ANDROID_OAUTH_CLIENT_ID;
  }
  
  // Use Web Client ID for browser
  console.log('Using Web OAuth Client ID for Google Drive');
  return WEB_CLIENT_ID;
})();

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

class GoogleDriveService {
  constructor() {
    this.accessToken = null;
    this.tokenClient = null;
    this.gapiInited = false;
    this.gisInited = false;
    this.isAndroid = this.detectAndroidWebView();
    
    // Setup OAuth callback handler for Android
    if (this.isAndroid) {
      window.handleGoogleOAuthCallback = this.handleOAuthCallback.bind(this);
    }
  }

  // Detect if running in Android WebView
  detectAndroidWebView() {
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.includes('android');
    const isWebView = ua.includes('wv') || ua.includes('mpumpcalc');
    return isAndroid && (isWebView || window.MPumpCalcAndroid);
  }

  // Handle OAuth callback from Android external browser
  handleOAuthCallback(accessToken) {
    try {
      this.accessToken = accessToken;
      
      // Only set token in gapi if it's initialized
      if (window.gapi && window.gapi.client && this.gapiInited) {
        try {
          window.gapi.client.setToken({ access_token: this.accessToken });
        } catch (e) {
          console.warn('Could not set token in gapi.client:', e);
          // Not critical - we'll use the token directly in fetch calls
        }
      }
      
      console.log('✓ Access token received from Android OAuth');
      
      // Trigger any pending callbacks
      if (this.pendingAuthCallback) {
        this.pendingAuthCallback(accessToken);
        this.pendingAuthCallback = null;
      }
    } catch (error) {
      console.error('Error in handleOAuthCallback:', error);
      if (this.pendingAuthCallback) {
        this.pendingAuthCallback = null;
      }
    }
  }

  // Initialize Google API
  async initializeGoogleAPI() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              discoveryDocs: [DISCOVERY_DOC],
            });
            this.gapiInited = true;
            console.log('✓ Google API initialized');
            resolve();
          } catch (error) {
            console.error('Failed to initialize Google API:', error);
            reject(error);
          }
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // Initialize Google Identity Services
  initializeGIS() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: '', // Will be set during auth
        });
        this.gisInited = true;
        console.log('✓ Google Identity Services initialized');
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // Request access token
  async requestAccessToken() {
    // For Android WebView, use external browser flow
    if (this.isAndroid) {
      return this.requestAccessTokenAndroid();
    }
    
    // Standard web flow
    return new Promise((resolve, reject) => {
      try {
        this.tokenClient.callback = (response) => {
          if (response.error !== undefined) {
            reject(response);
            return;
          }
          this.accessToken = response.access_token;
          window.gapi.client.setToken({ access_token: this.accessToken });
          console.log('✓ Access token obtained');
          resolve(this.accessToken);
        };

        if (this.accessToken === null) {
          // Prompt for consent
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
          // Skip display of account chooser
          this.tokenClient.requestAccessToken({ prompt: '' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // Request access token for Android using external browser
  async requestAccessTokenAndroid() {
    return new Promise((resolve, reject) => {
      try {
        // OAuth configuration for Web client
        const client_id = GOOGLE_CLIENT_ID;
        const redirect_uri = 'http://localhost'; // must match Google Console
        const scope = 'https://www.googleapis.com/auth/drive.file';
        const response_type = 'token';
        const include_granted_scopes = 'true';
        const prompt = 'consent'; // always show account picker
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(client_id)}` +
          `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
          `&response_type=${encodeURIComponent(response_type)}` +
          `&scope=${encodeURIComponent(scope)}` +
          `&include_granted_scopes=${encodeURIComponent(include_granted_scopes)}` +
          `&prompt=${encodeURIComponent(prompt)}`;
        
        console.log('Using Web Client ID for Android OAuth');
        console.log('Redirect URI:', redirect_uri);
        console.log('Auth URL:', authUrl);
        
        // Store callback for when OAuth completes
        this.pendingAuthCallback = (token) => {
          resolve(token);
        };
        
        // Open external browser via Android interface
        if (window.MPumpCalcAndroid && window.MPumpCalcAndroid.openGoogleOAuth) {
          window.MPumpCalcAndroid.openGoogleOAuth(authUrl);
        } else {
          // Fallback: open in new window
          window.open(authUrl, '_blank');
        }
        
        // Set a timeout in case user doesn't complete OAuth
        setTimeout(() => {
          if (this.pendingAuthCallback) {
            this.pendingAuthCallback = null;
            reject(new Error('OAuth timeout - user did not complete authorization'));
          }
        }, 300000); // 5 minute timeout
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // Upload backup to Google Drive
  async uploadBackup(data, filename) {
    try {
      // For Android, skip gapi initialization - we use direct fetch
      if (!this.isAndroid) {
        if (!this.gapiInited) {
          await this.initializeGoogleAPI();
        }
        
        if (!this.gisInited) {
          await this.initializeGIS();
        }
      }

      if (!this.accessToken) {
        await this.requestAccessToken();
      }

      const fileContent = JSON.stringify(data, null, 2);
      const file = new Blob([fileContent], { type: 'application/json' });
      
      const metadata = {
        name: filename,
        mimeType: 'application/json',
        description: 'Mobile Petrol Pump Backup',
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: form,
        }
      );

      // Check status first - doesn't consume body
      if (!response.ok) {
        console.error('Upload failed with status:', response.status);
        throw new Error(`Upload failed: HTTP ${response.status}`);
      }

      // Only read body if response is OK
      const result = await response.json();
      console.log('✓ Backup uploaded to Google Drive:', result.id);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // List backup files from Google Drive
  async listBackupFiles() {
    try {
      // For Android, skip gapi initialization - we use direct fetch
      if (!this.isAndroid) {
        if (!this.gapiInited) {
          await this.initializeGoogleAPI();
        }
        
        if (!this.gisInited) {
          await this.initializeGIS();
        }
      }

      if (!this.accessToken) {
        await this.requestAccessToken();
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=mimeType='application/json' and trashed=false&orderBy=modifiedTime desc&pageSize=10`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      // Check status first - doesn't consume body
      if (!response.ok) {
        console.error('List files failed with status:', response.status);
        throw new Error(`Failed to list files: HTTP ${response.status}`);
      }

      // Only read body if response is OK
      const result = await response.json();
      console.log('✓ Found backup files:', result.files?.length || 0);
      return result.files || [];
    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  }

  // Download backup from Google Drive
  async downloadBackup(fileId) {
    try {
      if (!this.accessToken) {
        await this.requestAccessToken();
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      // Check status first - doesn't consume body
      if (!response.ok) {
        console.error('Download failed with status:', response.status);
        throw new Error(`Download failed: HTTP ${response.status}`);
      }

      // Only read body if response is OK
      const data = await response.json();
      console.log('✓ Backup downloaded from Google Drive');
      return data;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.accessToken !== null;
  }

  // Sign out
  signOut() {
    this.accessToken = null;
    if (window.gapi && window.gapi.client) {
      window.gapi.client.setToken(null);
    }
    console.log('✓ Signed out from Google Drive');
  }
}

export default new GoogleDriveService();

// Global callback for Android OAuth token
// Called by MainActivity.java after successful OAuth
window.onGoogleDriveTokenReceived = function(token) {
  console.log('✅ Received Google Drive token from Android');
  const service = new GoogleDriveService();
  if (service.pendingAuthCallback) {
    service.pendingAuthCallback(token);
    service.pendingAuthCallback = null;
  }
  // Also store for direct access
  localStorage.setItem('gdrive_token', token);
};

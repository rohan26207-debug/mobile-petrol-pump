/**
 * Google Drive Integration for Web-Based Android App
 * Handles export/import entirely in JavaScript
 * No native Java code needed!
 */

// Configuration
const GOOGLE_DRIVE_CONFIG = {
  clientId: window.ANDROID_OAUTH_CLIENT_ID || '411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com',
  redirectUri: 'http://localhost',
  scope: 'https://www.googleapis.com/auth/drive.file',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
};

class GoogleDriveService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Check if running in Android app
   */
  isAndroid() {
    return window.isAndroidApp === true || /Android/i.test(navigator.userAgent);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    if (!this.accessToken) return false;
    if (!this.tokenExpiry) return true;
    return new Date() < this.tokenExpiry;
  }

  /**
   * Start OAuth flow
   */
  async authenticate() {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({
        client_id: GOOGLE_DRIVE_CONFIG.clientId,
        redirect_uri: GOOGLE_DRIVE_CONFIG.redirectUri,
        response_type: 'token',
        scope: GOOGLE_DRIVE_CONFIG.scope,
        include_granted_scopes: 'true',
        state: 'mpump_auth',
        prompt: 'consent'
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      
      // Open OAuth in new window/tab
      const width = 500;
      const height = 600;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;
      
      const authWindow = window.open(
        authUrl,
        'Google Drive Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth callback
      const checkAuth = setInterval(() => {
        try {
          if (authWindow.closed) {
            clearInterval(checkAuth);
            if (!this.accessToken) {
              reject(new Error('Authentication cancelled'));
            }
          }
          
          // Check if we got redirected back with token
          if (authWindow.location.href.startsWith(GOOGLE_DRIVE_CONFIG.redirectUri)) {
            const hash = authWindow.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            
            this.accessToken = params.get('access_token');
            const expiresIn = parseInt(params.get('expires_in') || '3600');
            this.tokenExpiry = new Date(Date.now() + (expiresIn * 1000));
            
            authWindow.close();
            clearInterval(checkAuth);
            
            if (this.accessToken) {
              this.saveToken();
              resolve(this.accessToken);
            } else {
              reject(new Error('No access token received'));
            }
          }
        } catch (e) {
          // Cross-origin error - ignore
        }
      }, 500);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkAuth);
        if (authWindow && !authWindow.closed) {
          authWindow.close();
        }
        reject(new Error('Authentication timeout'));
      }, 300000);
    });
  }

  /**
   * Save token to localStorage
   */
  saveToken() {
    if (this.accessToken) {
      localStorage.setItem('gdrive_access_token', this.accessToken);
      if (this.tokenExpiry) {
        localStorage.setItem('gdrive_token_expiry', this.tokenExpiry.toISOString());
      }
    }
  }

  /**
   * Load token from localStorage
   */
  loadToken() {
    this.accessToken = localStorage.getItem('gdrive_access_token');
    const expiry = localStorage.getItem('gdrive_token_expiry');
    if (expiry) {
      this.tokenExpiry = new Date(expiry);
    }
    return this.isAuthenticated();
  }

  /**
   * Clear stored token
   */
  clearToken() {
    this.accessToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('gdrive_access_token');
    localStorage.removeItem('gdrive_token_expiry');
  }

  /**
   * Export data to Google Drive
   */
  async exportToGoogleDrive(data, filename = 'mpump-backup.json') {
    // Authenticate if needed
    if (!this.isAuthenticated()) {
      if (!this.loadToken()) {
        await this.authenticate();
      }
    }

    try {
      // Check if file exists
      const existingFile = await this.findFile(filename);
      
      // Create file content
      const fileContent = JSON.stringify(data, null, 2);
      const blob = new Blob([fileContent], { type: 'application/json' });

      // Upload or update
      if (existingFile) {
        return await this.updateFile(existingFile.id, blob, filename);
      } else {
        return await this.createFile(blob, filename);
      }
    } catch (error) {
      console.error('Export to Drive failed:', error);
      
      // If auth error, clear token and retry once
      if (error.message.includes('401') || error.message.includes('auth')) {
        this.clearToken();
        throw new Error('Authentication expired. Please try again.');
      }
      
      throw error;
    }
  }

  /**
   * Import data from Google Drive
   */
  async importFromGoogleDrive(filename = 'mpump-backup.json') {
    // Authenticate if needed
    if (!this.isAuthenticated()) {
      if (!this.loadToken()) {
        await this.authenticate();
      }
    }

    try {
      // Find the file
      const file = await this.findFile(filename);
      
      if (!file) {
        throw new Error(`File "${filename}" not found on Google Drive`);
      }

      // Download file content
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Import from Drive failed:', error);
      
      // If auth error, clear token
      if (error.message.includes('401') || error.message.includes('auth')) {
        this.clearToken();
        throw new Error('Authentication expired. Please try again.');
      }
      
      throw error;
    }
  }

  /**
   * Find file by name
   */
  async findFile(filename) {
    const query = encodeURIComponent(`name='${filename}' and trashed=false`);
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0] : null;
  }

  /**
   * Create new file
   */
  async createFile(blob, filename) {
    const metadata = {
      name: filename,
      mimeType: 'application/json'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: form
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  /**
   * Update existing file
   */
  async updateFile(fileId, blob, filename) {
    const metadata = {
      name: filename,
      mimeType: 'application/json'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: form
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Update failed: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  /**
   * List all backup files
   */
  async listBackupFiles() {
    if (!this.isAuthenticated()) {
      if (!this.loadToken()) {
        await this.authenticate();
      }
    }

    const query = encodeURIComponent("name contains 'mpump-backup' and trashed=false");
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,createdTime,modifiedTime)&orderBy=modifiedTime desc`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`List failed: ${response.status}`);
    }

    const data = await response.json();
    return data.files || [];
  }
}

// Create global instance
window.googleDriveService = new GoogleDriveService();

console.log('✅ Google Drive Service loaded (Web-based)');

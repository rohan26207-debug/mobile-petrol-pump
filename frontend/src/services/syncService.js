// Cloud Sync Service
import authService from './authService';
import { exportAllData, importAllData } from './localStorage';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.lastSyncTime = localStorage.getItem('last_sync_time');
    this.autoSyncEnabled = localStorage.getItem('auto_sync_enabled') !== 'false'; // Default true
    this.syncInterval = null;
  }

  async uploadData() {
    if (!authService.isAuthenticated()) {
      console.log('Not authenticated, skipping upload');
      return { success: false, message: 'Not authenticated' };
    }

    if (this.isSyncing) {
      console.log('Sync already in progress');
      return { success: false, message: 'Sync in progress' };
    }

    this.isSyncing = true;

    try {
      // Get all local data
      const localData = exportAllData();

      // Prepare sync data
      const syncData = {
        customers: localData.customers || [],
        credit_records: localData.creditRecords || [],
        payments: localData.payments || [],
        sales: localData.sales || [],
        income_records: localData.incomeRecords || [],
        expense_records: localData.expenseRecords || [],
        fuel_settings: localData.fuelSettings || null,
        stock_records: localData.stockRecords || [],
        notes: localData.notes || [],
        contact_info: localData.contactInfo || null,
        app_preferences: localData.preferences || null,
      };

      const response = await fetch(`${API_URL}/api/sync/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(syncData),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Update last sync time
      const syncTime = new Date().toISOString();
      localStorage.setItem('last_sync_time', syncTime);
      this.lastSyncTime = syncTime;

      console.log('✓ Data uploaded successfully');
      return { success: true, message: 'Data synced to cloud', time: syncTime };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, message: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  async downloadData() {
    if (!authService.isAuthenticated()) {
      console.log('Not authenticated, skipping download');
      return { success: false, message: 'Not authenticated' };
    }

    if (this.isSyncing) {
      console.log('Sync already in progress');
      return { success: false, message: 'Sync in progress' };
    }

    this.isSyncing = true;

    try {
      const response = await fetch(`${API_URL}/api/sync/download`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Merge cloud data with local data
        const cloudData = result.data;
        
        // Convert to localStorage format
        const dataToImport = {
          customers: cloudData.customers || [],
          creditRecords: cloudData.credit_records || [],
          payments: cloudData.payments || [],
          sales: cloudData.sales || [],
          incomeRecords: cloudData.income_records || [],
          expenseRecords: cloudData.expense_records || [],
          fuelSettings: cloudData.fuel_settings || {},
          stockRecords: cloudData.stock_records || [],
          notes: cloudData.notes || [],
          contactInfo: cloudData.contact_info || {},
          preferences: cloudData.app_preferences || {},
        };

        // Import cloud data (this will merge with local data)
        importAllData(dataToImport);

        // Update last sync time
        const syncTime = new Date().toISOString();
        localStorage.setItem('last_sync_time', syncTime);
        this.lastSyncTime = syncTime;

        console.log('✓ Data downloaded successfully');
        return { success: true, message: 'Data synced from cloud', time: syncTime };
      }

      return { success: true, message: 'No cloud data found' };
    } catch (error) {
      console.error('Download error:', error);
      return { success: false, message: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  async syncData() {
    // Full sync: upload local data, then download to get merged data
    console.log('Starting full sync...');
    
    const uploadResult = await this.uploadData();
    if (!uploadResult.success) {
      return uploadResult;
    }

    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay

    const downloadResult = await this.downloadData();
    return downloadResult;
  }

  startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    if (!this.autoSyncEnabled) {
      console.log('Auto-sync is disabled');
      return;
    }

    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      if (authService.isAuthenticated() && navigator.onLine) {
        console.log('Auto-sync triggered');
        this.syncData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Also sync on online event
    window.addEventListener('online', () => {
      if (authService.isAuthenticated()) {
        console.log('Device came online, syncing...');
        this.syncData();
      }
    });

    console.log('Auto-sync started (every 5 minutes)');
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  setAutoSyncEnabled(enabled) {
    this.autoSyncEnabled = enabled;
    localStorage.setItem('auto_sync_enabled', enabled ? 'true' : 'false');
    
    if (enabled) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }

  getLastSyncTime() {
    return this.lastSyncTime;
  }

  isAutoSyncEnabled() {
    return this.autoSyncEnabled;
  }
}

export default new SyncService();

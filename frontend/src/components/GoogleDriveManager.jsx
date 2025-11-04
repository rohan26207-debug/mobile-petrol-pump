import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Upload, Download, Cloud, CloudOff, RefreshCw, List } from 'lucide-react';

const GoogleDriveManager = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backupFiles, setBackupFiles] = useState([]);
  const [showFileList, setShowFileList] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    if (window.googleDriveService) {
      setIsConnected(window.googleDriveService.loadToken());
    }
  }, []);

  const connect = async () => {
    try {
      setLoading(true);
      if (!window.googleDriveService) {
        throw new Error('Google Drive service not loaded');
      }
      
      await window.googleDriveService.authenticate();
      setIsConnected(true);
      alert('✅ Connected to Google Drive successfully!');
    } catch (error) {
      console.error('Connection error:', error);
      alert('❌ Connection failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    if (window.googleDriveService) {
      window.googleDriveService.clearToken();
      setIsConnected(false);
      alert('Disconnected from Google Drive');
    }
  };

  const getAllAppData = () => {
    return {
      salesData: JSON.parse(localStorage.getItem('mpump_sales_data') || '[]'),
      creditData: JSON.parse(localStorage.getItem('mpump_credit_data') || '[]'),
      incomeData: JSON.parse(localStorage.getItem('mpump_income_data') || '[]'),
      expenseData: JSON.parse(localStorage.getItem('mpump_expense_data') || '[]'),
      fuelSettings: JSON.parse(localStorage.getItem('mpump_fuel_settings') || '{}'),
      nozzles: JSON.parse(localStorage.getItem('mpump_nozzles') || '[]'),
      exportDate: new Date().toISOString(),
      version: '2.0',
      appName: 'Mobile Petrol Pump'
    };
  };

  const exportData = async () => {
    try {
      setLoading(true);
      
      if (!window.googleDriveService) {
        throw new Error('Google Drive service not loaded');
      }

      // Check authentication
      if (!window.googleDriveService.isAuthenticated()) {
        await window.googleDriveService.authenticate();
      }

      // Get all app data
      const data = getAllAppData();
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `mpump-backup-${date}.json`;
      
      // Export to Drive
      await window.googleDriveService.exportToGoogleDrive(data, filename);
      
      alert(`✅ Data exported successfully to Google Drive!\nFile: ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Export failed: ' + error.message);
      
      // If auth error, disconnect
      if (error.message.includes('expired') || error.message.includes('Authentication')) {
        disconnect();
      }
    } finally {
      setLoading(false);
    }
  };

  const importData = async (filename = null) => {
    try {
      setLoading(true);
      
      if (!window.googleDriveService) {
        throw new Error('Google Drive service not loaded');
      }

      // Check authentication
      if (!window.googleDriveService.isAuthenticated()) {
        await window.googleDriveService.authenticate();
      }

      // If no filename specified, use today's backup
      if (!filename) {
        const date = new Date().toISOString().split('T')[0];
        filename = `mpump-backup-${date}.json`;
      }

      // Import from Drive
      const data = await window.googleDriveService.importFromGoogleDrive(filename);
      
      // Restore data
      if (data.salesData) localStorage.setItem('mpump_sales_data', JSON.stringify(data.salesData));
      if (data.creditData) localStorage.setItem('mpump_credit_data', JSON.stringify(data.creditData));
      if (data.incomeData) localStorage.setItem('mpump_income_data', JSON.stringify(data.incomeData));
      if (data.expenseData) localStorage.setItem('mpump_expense_data', JSON.stringify(data.expenseData));
      if (data.fuelSettings) localStorage.setItem('mpump_fuel_settings', JSON.stringify(data.fuelSettings));
      if (data.nozzles) localStorage.setItem('mpump_nozzles', JSON.stringify(data.nozzles));
      
      alert(`✅ Data imported successfully!\n\nImported from: ${filename}\nExport date: ${new Date(data.exportDate).toLocaleString()}\n\nThe app will now reload.`);
      
      // Reload to apply changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Import error:', error);
      alert('❌ Import failed: ' + error.message);
      
      // If auth error, disconnect
      if (error.message.includes('expired') || error.message.includes('Authentication')) {
        disconnect();
      }
    } finally {
      setLoading(false);
    }
  };

  const listBackups = async () => {
    try {
      setLoading(true);
      
      if (!window.googleDriveService) {
        throw new Error('Google Drive service not loaded');
      }

      if (!window.googleDriveService.isAuthenticated()) {
        await window.googleDriveService.authenticate();
      }

      const files = await window.googleDriveService.listBackupFiles();
      setBackupFiles(files);
      setShowFileList(true);
    } catch (error) {
      console.error('List error:', error);
      alert('❌ Failed to list backups: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {isConnected ? (
            <Cloud className="w-5 h-5 text-green-500" />
          ) : (
            <CloudOff className="w-5 h-5 text-gray-400" />
          )}
          Google Drive Backup
        </h3>
        {isConnected && (
          <button
            onClick={disconnect}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Disconnect
          </button>
        )}
      </div>

      {!isConnected ? (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">
            Connect to Google Drive to automatically backup and restore your data.
          </p>
          <Button onClick={connect} disabled={loading} className="w-full">
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 mr-2" />
                Connect to Google Drive
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
            <Cloud className="w-4 h-4" />
            <span>Connected to Google Drive</span>
          </div>

          <Button
            onClick={exportData}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Export to Drive
              </>
            )}
          </Button>

          <Button
            onClick={() => importData()}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Import from Drive
              </>
            )}
          </Button>

          <Button
            onClick={listBackups}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            <List className="w-4 h-4 mr-2" />
            View All Backups
          </Button>

          {showFileList && backupFiles.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium mb-2">Available Backups:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {backupFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => importData(file.name)}
                  >
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(file.modifiedTime).toLocaleString()}
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-blue-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {showFileList && backupFiles.length === 0 && (
            <div className="mt-4 border-t pt-4 text-center text-gray-500">
              No backups found. Create one by clicking "Export to Drive".
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 pt-2 border-t">
        <p>💡 Tip: Export your data regularly to keep it safe in the cloud!</p>
      </div>
    </div>
  );
};

export default GoogleDriveManager;

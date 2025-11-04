// Auto Google Drive Backup Hook
import { useEffect } from 'react';
import googleDriveService from '../services/googleDriveService';
import { exportAllData } from '../services/localStorage';

export const useAutoGoogleDriveBackup = (enabled, toast) => {
  useEffect(() => {
    if (!enabled) {
      console.log('Auto Google Drive backup is disabled');
      return;
    }

    const checkAndBackup = async () => {
      const lastBackupTime = localStorage.getItem('last_gdrive_backup');
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      // Check if 24 hours have passed since last backup
      if (!lastBackupTime || (now - parseInt(lastBackupTime)) >= twentyFourHours) {
        console.log('Auto Google Drive backup triggered...');

        try {
          // Check if user has already authenticated with Google
          if (!googleDriveService.isAuthenticated()) {
            console.log('Not authenticated with Google Drive, skipping auto-backup');
            return;
          }

          // Get all data
          const allData = exportAllData();
          
          // Create filename with timestamp
          const timestamp = new Date().toISOString().split('T')[0];
          const filename = `mobile-petrol-pump-backup-${timestamp}.json`;
          
          // Upload to Google Drive
          await googleDriveService.uploadBackup(allData, filename);
          
          // Update last backup time
          localStorage.setItem('last_gdrive_backup', now.toString());
          
          console.log('✓ Auto backup to Google Drive completed');
          
          if (toast) {
            toast({
              title: "✓ Auto Backup Complete",
              description: `Data backed up to Google Drive automatically`,
            });
          }
        } catch (error) {
          console.error('Auto backup failed:', error);
          // Don't show error toast for auto-backup failures (silent failure)
        }
      } else {
        const nextBackup = new Date(parseInt(lastBackupTime) + twentyFourHours);
        console.log('Next auto backup at:', nextBackup.toLocaleString());
      }
    };

    // Check immediately on mount
    checkAndBackup();

    // Set up interval to check every hour
    const intervalId = setInterval(() => {
      checkAndBackup();
    }, 60 * 60 * 1000); // Check every hour

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, toast]);
};

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import firebaseSyncService from '../services/firebaseSync';

const SyncStatus = ({ isDarkMode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  // Trigger sync when coming back online
  useEffect(() => {
    if (isOnline && isAuthenticated) {
      setIsSyncing(true);
      // Sync will happen automatically by Firebase
      setTimeout(() => setIsSyncing(false), 2000);
    }
  }, [isOnline, isAuthenticated]);

  // Manual sync trigger
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await firebaseSyncService.syncAllLocalData();
      setTimeout(() => setIsSyncing(false), 1000);
    } catch (error) {
      console.error('Manual sync failed:', error);
      setIsSyncing(false);
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border`}>
      {/* Online/Offline Status */}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className={`w-px h-4 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />

      {/* Sync Status */}
      <div className="flex items-center gap-1">
        {isSyncing ? (
          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
        ) : isOnline && isAuthenticated ? (
          <Cloud className="w-4 h-4 text-blue-500" />
        ) : (
          <CloudOff className="w-4 h-4 text-gray-400" />
        )}
        <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {isSyncing ? 'Syncing...' : isOnline && isAuthenticated ? 'Synced' : 'Local'}
        </span>
      </div>

      {/* Manual Sync Button (only show when online) */}
      {isOnline && isAuthenticated && !isSyncing && (
        <>
          <div className={`w-px h-4 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
          <button
            onClick={handleManualSync}
            className={`text-xs px-2 py-1 rounded ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            title="Sync all local data to cloud"
          >
            Sync Now
          </button>
        </>
      )}
    </div>
  );
};

export default SyncStatus;

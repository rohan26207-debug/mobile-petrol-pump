import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RefreshCw, Database, Upload, Download } from 'lucide-react';

const SyncDebugPanel = ({ isDarkMode }) => {
  const [syncStatus, setSyncStatus] = useState({
    authenticated: false,
    userId: null,
    email: null,
    syncInitialized: false,
    firestoreConnected: false,
  });
  const [localData, setLocalData] = useState({
    customers: 0,
    credits: 0,
    payments: 0,
  });
  const [firebaseData, setFirebaseData] = useState({
    customers: 0,
    credits: 0,
    payments: 0,
  });

  const checkSyncStatus = async () => {
    try {
      const { auth } = require('../services/firebase');
      const user = auth.currentUser;
      
      setSyncStatus({
        authenticated: !!user,
        userId: user?.uid || null,
        email: user?.email || null,
        syncInitialized: true,
        firestoreConnected: true,
      });

      // Check local storage data
      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      const credits = JSON.parse(localStorage.getItem('creditData') || '[]');
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');

      setLocalData({
        customers: customers.length,
        credits: credits.length,
        payments: payments.length,
      });

      // Check Firebase data
      if (user) {
        const { collection, query, where, getDocs } = require('firebase/firestore');
        const { db } = require('../services/firebase');

        const customersSnap = await getDocs(
          query(collection(db, 'customers'), where('userId', '==', user.uid))
        );
        const creditsSnap = await getDocs(
          query(collection(db, 'creditSales'), where('userId', '==', user.uid))
        );
        const paymentsSnap = await getDocs(
          query(collection(db, 'payments'), where('userId', '==', user.uid))
        );

        setFirebaseData({
          customers: customersSnap.size,
          credits: creditsSnap.size,
          payments: paymentsSnap.size,
        });
      }
    } catch (error) {
      console.error('Sync status check failed:', error);
    }
  };

  const forceSyncToFirebase = async () => {
    try {
      const firebaseSyncService = require('../services/firebaseSync').default;
      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      
      console.log('🔄 Force syncing', customers.length, 'customers to Firebase...');
      
      for (const customer of customers) {
        await firebaseSyncService.syncCustomer(customer, 'add');
      }
      
      alert('✅ Force sync completed! Check Firebase Console.');
      await checkSyncStatus();
    } catch (error) {
      alert('❌ Force sync failed: ' + error.message);
      console.error(error);
    }
  };

  const forcePullFromFirebase = async () => {
    try {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const { db, auth } = require('../services/firebase');
      const user = auth.currentUser;

      if (!user) {
        alert('❌ Not authenticated');
        return;
      }

      console.log('📥 Pulling data from Firebase...');

      const customersSnap = await getDocs(
        query(collection(db, 'customers'), where('userId', '==', user.uid))
      );

      const customers = [];
      customersSnap.forEach((doc) => {
        customers.push(doc.data());
      });

      localStorage.setItem('customers', JSON.stringify(customers));
      
      alert(`✅ Pulled ${customers.length} customers from Firebase!`);
      await checkSyncStatus();
      window.location.reload();
    } catch (error) {
      alert('❌ Pull failed: ' + error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    checkSyncStatus();
  }, []);

  return (
    <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Sync Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
          <h3 className="font-semibold mb-2">Authentication Status</h3>
          <div className="space-y-1 text-sm">
            <div>Authenticated: {syncStatus.authenticated ? '✅' : '❌'}</div>
            <div>Email: {syncStatus.email || 'Not logged in'}</div>
            <div>User ID: {syncStatus.userId || 'N/A'}</div>
          </div>
        </div>

        {/* Data Counts */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-50'}`}>
            <h4 className="font-semibold text-sm mb-2">📱 Local Storage</h4>
            <div className="text-xs space-y-1">
              <div>Customers: {localData.customers}</div>
              <div>Credits: {localData.credits}</div>
              <div>Payments: {localData.payments}</div>
            </div>
          </div>

          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900' : 'bg-green-50'}`}>
            <h4 className="font-semibold text-sm mb-2">☁️ Firebase</h4>
            <div className="text-xs space-y-1">
              <div>Customers: {firebaseData.customers}</div>
              <div>Credits: {firebaseData.credits}</div>
              <div>Payments: {firebaseData.payments}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            onClick={checkSyncStatus} 
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>

          <Button 
            onClick={forceSyncToFirebase} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Force Push to Firebase
          </Button>

          <Button 
            onClick={forcePullFromFirebase} 
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Force Pull from Firebase
          </Button>
        </div>

        {/* Warning */}
        {localData.customers !== firebaseData.customers && (
          <div className="p-3 bg-yellow-100 text-yellow-900 rounded-lg text-sm">
            ⚠️ Mismatch detected! Local and Firebase data don't match.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SyncDebugPanel;

# Android Native Firestore Integration Guide

## Current Status: Web-Based Sync ✅

Your Android app **already has Firebase sync working** through the WebView! The JavaScript Firebase SDK in your web app handles all synchronization automatically.

**What's Working:**
- ✅ Web app Firebase SDK runs in WebView
- ✅ Real-time listeners work through JavaScript
- ✅ Offline persistence enabled in web app
- ✅ Data syncs across web and Android

---

## Option 1: Keep Current Setup (Recommended)

**Pros:**
- ✅ Already working - no changes needed
- ✅ Same codebase for web and Android
- ✅ Automatic updates through web app code
- ✅ Easier to maintain

**Cons:**
- ❌ Slightly slower than native (negligible for most use cases)
- ❌ Depends on WebView lifecycle

**Recommendation:** **Keep this setup unless you have specific performance requirements.**

---

## Option 2: Add Native Android Firestore (Advanced)

If you want **native Android Firestore listeners** for maximum performance:

### Step 1: Add Firebase Dependencies

**File:** `android/app/build.gradle`

```gradle
dependencies {
    // Existing dependencies...
    
    // Firebase BOM (Bill of Materials)
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    
    // Firestore
    implementation 'com.google.firebase:firebase-firestore'
    
    // Optional: Analytics
    implementation 'com.google.firebase:firebase-analytics'
}
```

### Step 2: Add Google Services Plugin

**File:** `android/app/build.gradle` (at top)

```gradle
plugins {
    id 'com.android.application'
    id 'com.google.gms.google-services'  // Add this
}
```

**File:** `android/build.gradle` (project level)

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'  // Add this
    }
}
```

### Step 3: Add google-services.json

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: **manager-petrol-pump-9e452**
3. Go to Project Settings → Your Apps → Android App
4. Download `google-services.json`
5. Place it in: `android/app/google-services.json`

### Step 4: Create Firestore Sync Service

**File:** `android/app/src/main/java/com/mobilepetrolpump/app/FirestoreSyncService.java`

```java
package com.mobilepetrolpump.app;

import android.util.Log;
import android.webkit.WebView;
import com.google.firebase.firestore.DocumentChange;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreSettings;
import com.google.firebase.firestore.ListenerRegistration;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

public class FirestoreSyncService {
    private static final String TAG = "FirestoreSync";
    private FirebaseFirestore db;
    private WebView webView;
    private List<ListenerRegistration> listeners = new ArrayList<>();
    private String userId;

    public FirestoreSyncService(WebView webView) {
        this.webView = webView;
        this.db = FirebaseFirestore.getInstance();
        
        // Enable offline persistence
        FirebaseFirestoreSettings settings = new FirebaseFirestoreSettings.Builder()
                .setPersistenceEnabled(true)
                .build();
        db.setFirestoreSettings(settings);
        
        Log.d(TAG, "Firestore sync service initialized with offline persistence");
    }

    public void startListening(String userId) {
        this.userId = userId;
        Log.d(TAG, "Starting Firestore listeners for user: " + userId);
        
        // Listen to customers
        listenToCollection("customers", userId);
        
        // Listen to credit sales
        listenToCollection("creditSales", userId);
        
        // Listen to payments
        listenToCollection("payments", userId);
        
        // Listen to settlements
        listenToCollection("settlements", userId);
        
        // Listen to sales
        listenToCollection("sales", userId);
        
        // Listen to income/expenses
        listenToCollection("incomeExpenses", userId);
    }

    private void listenToCollection(String collectionName, String userId) {
        ListenerRegistration registration = db.collection(collectionName)
                .whereEqualTo("userId", userId)
                .addSnapshotListener((snapshots, error) -> {
                    if (error != null) {
                        Log.e(TAG, "Listen failed for " + collectionName, error);
                        return;
                    }

                    if (snapshots != null && !snapshots.isEmpty()) {
                        for (DocumentChange dc : snapshots.getDocumentChanges()) {
                            handleDocumentChange(collectionName, dc);
                        }
                    }
                });
        
        listeners.add(registration);
        Log.d(TAG, "Listener added for collection: " + collectionName);
    }

    private void handleDocumentChange(String collection, DocumentChange dc) {
        try {
            JSONObject data = new JSONObject(dc.getDocument().getData());
            
            String changeType = dc.getType().toString();
            Log.d(TAG, collection + " " + changeType + ": " + data);
            
            // Notify WebView about the change
            String jsCode = String.format(
                "if (window.handleFirestoreChange) { " +
                "  window.handleFirestoreChange('%s', '%s', %s); " +
                "} else { " +
                "  window.dispatchEvent(new Event('localStorageChange')); " +
                "}",
                collection, changeType, data.toString()
            );
            
            webView.post(() -> webView.evaluateJavascript(jsCode, null));
            
        } catch (Exception e) {
            Log.e(TAG, "Error handling document change", e);
        }
    }

    public void stopListening() {
        Log.d(TAG, "Stopping all Firestore listeners");
        for (ListenerRegistration listener : listeners) {
            listener.remove();
        }
        listeners.clear();
    }
}
```

### Step 5: Update MainActivity

**File:** `android/app/src/main/java/com/mobilepetrolpump/app/MainActivity.java`

```java
package com.mobilepetrolpump.app;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.FirebaseApp;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private FirestoreSyncService syncService;
    private static final String WEB_APP_URL = "file:///android_asset/index.html";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize Firebase
        FirebaseApp.initializeApp(this);

        webView = new WebView(this);
        setContentView(webView);

        // Enable JavaScript and local storage
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setDatabaseEnabled(true);
        
        // Enable debugging
        WebView.setWebContentsDebuggingEnabled(true);

        // Initialize Firestore sync service
        syncService = new FirestoreSyncService(webView);

        // Add JavaScript interface for native sync
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidSync");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                view.evaluateJavascript("window.isAndroidApp = true;", null);
                view.evaluateJavascript("window.hasNativeFirestore = true;", null);
            }
        });

        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl(WEB_APP_URL);
    }

    // JavaScript Bridge
    public class AndroidBridge {
        @JavascriptInterface
        public void startFirestoreSync(String userId) {
            runOnUiThread(() -> {
                syncService.startListening(userId);
            });
        }

        @JavascriptInterface
        public void stopFirestoreSync() {
            runOnUiThread(() -> {
                syncService.stopListening();
            });
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (syncService != null) {
            syncService.stopListening();
        }
        if (webView != null) {
            webView.destroy();
        }
    }
}
```

### Step 6: Call from Web App (Optional)

If you add native sync, update your web app to use it:

**File:** `frontend/src/services/firebase.js`

```javascript
// Detect if Android native Firestore is available
if (window.isAndroidApp && window.hasNativeFirestore && window.AndroidSync) {
  console.log('🤖 Using native Android Firestore sync');
  
  // Start native sync when user logs in
  auth.onAuthStateChanged((user) => {
    if (user) {
      window.AndroidSync.startFirestoreSync(user.uid);
    } else {
      window.AndroidSync.stopFirestoreSync();
    }
  });
} else {
  console.log('🌐 Using web Firebase SDK');
}
```

---

## Comparison

| Feature | Web-Based Sync | Native Android Sync |
|---------|---------------|---------------------|
| Setup Complexity | ✅ Simple (already done) | ❌ Complex (needs native code) |
| Performance | ⚡ Good | ⚡⚡ Excellent |
| Maintenance | ✅ Easy | ❌ Requires Android knowledge |
| Offline Support | ✅ Yes | ✅ Yes |
| Real-time Updates | ✅ Yes | ✅ Yes |
| Code Sharing | ✅ 100% shared | ❌ Separate Android code |

---

## Recommendation

**Keep the current web-based sync** unless you specifically need:
- Maximum performance for large datasets (10k+ records)
- Background sync when app is closed
- Native Android features (notifications, etc.)

**Your current setup is production-ready and works perfectly for most use cases!** 🎉

The native approach adds complexity without significant benefit for a WebView app.

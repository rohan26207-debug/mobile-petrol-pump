package com.mobilepetrolpump.app;

import android.Manifest;
import android.app.DownloadManager;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.Environment;
import android.os.ParcelFileDescriptor;
import android.print.PageRange;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintDocumentInfo;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    
    // OFFLINE MODE: Load from local assets for offline functionality
    // App works without internet, syncs to Google Drive when online
    private static final String APP_URL = "file:///android_asset/index.html";
    
    // ONLINE MODE: Load from Vercel (always latest version, requires internet)
    // Uncomment line below to use online mode instead
    // private static final String APP_URL = "https://mobilepetrolpump.vercel.app/";
    
    // WEB OAuth Client ID for browser-based OAuth flow
    // This MUST be used for browser OAuth, not the Android client ID
    private static final String WEB_CLIENT_ID = "411840168577-hqpoggit0nncfetfgtu4g465udsbuhla.apps.googleusercontent.com";
    
    // Android OAuth 2.0 Client ID (NOT used for WebView browser OAuth)
    // Only use this if implementing native Google Sign-In
    private static final String ANDROID_CLIENT_ID = "411840168577-aal2up192b0obmomjcjg8tu4u1r5556b.apps.googleusercontent.com";
    
    private static final int SELECT_JSON_FILE_REQUEST = 102;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Handle OAuth deep link if app was opened via redirect
        handleOAuthDeepLink(getIntent());

        // Initialize WebView
        webView = findViewById(R.id.webview);
        setupWebView();

        // Load app
        webView.loadUrl(APP_URL);
        
        // Inject WEB Client ID into JavaScript after page loads
        webView.postDelayed(() -> {
            injectWebClientId();
        }, 1000); // Wait 1 second for page to load
    }
    
    private void injectWebClientId() {
        // CRITICAL: Inject WEB_CLIENT_ID for browser OAuth flow
        // Browser OAuth flows MUST use Web application client ID, NOT Android client ID
        String jsCode = "window.ANDROID_OAUTH_CLIENT_ID = '" + WEB_CLIENT_ID + "';" +
                       "console.log('Web OAuth Client ID injected for Android browser flow:', window.ANDROID_OAUTH_CLIENT_ID);";
        webView.evaluateJavascript(jsCode, null);
    }

    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        
        // Enable JavaScript
        webSettings.setJavaScriptEnabled(true);
        
        // Add JavaScript Interface for PDF handling
        webView.addJavascriptInterface(new PdfJavaScriptInterface(this), "MPumpCalcAndroid");
        
        // Enable DOM Storage for localStorage
        webSettings.setDomStorageEnabled(true);
        
        // Enable Database
        webSettings.setDatabaseEnabled(true);

        // Enable Zoom
        webSettings.setSupportZoom(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        
        // Enable viewport
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        
        // Enable file access
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        
        // Allow file URLs to access other file URLs (needed for loading JS/CSS from assets)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            webSettings.setAllowFileAccessFromFileURLs(true);
            webSettings.setAllowUniversalAccessFromFileURLs(true);
        }
        
        // Mixed content mode
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
        
        // Set User Agent
        String userAgent = webSettings.getUserAgentString();
        webSettings.setUserAgentString(userAgent + " MPumpCalc/1.0");
        
        // WebView Client
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                android.util.Log.d("OAuthRedirect", "Intercepted URL: " + url);

                // ✅ If Google OAuth redirect comes back to app, launch intent
                if (url.startsWith("com.mobilepetrolpump.app:/oauth2redirect")) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true; // prevent WebView reload
                }

                if (url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1")) {
                    if (url.contains("access_token=")) {
                        Uri uri = Uri.parse(url.replace("#", "?"));
                        String accessToken = uri.getQueryParameter("access_token");
                        handleAccessToken(accessToken);
                    } else if (url.contains("error=")) {
                        Uri uri = Uri.parse(url.replace("#", "?"));
                        String error = uri.getQueryParameter("error");
                        Toast.makeText(MainActivity.this, "OAuth failed: " + error, Toast.LENGTH_LONG).show();
                    }
                    return true;
                }

                if (url.contains("accounts.google.com/o/oauth2")) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }

                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Inject CSS to hide any unwanted elements if needed
            }
        });
        
        // WebChrome Client for alerts, confirm, etc
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                super.onProgressChanged(view, newProgress);
                // You can add a progress bar here
            }
        });
        
        // Download Listener for PDF downloads
        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition,
                                        String mimeType, long contentLength) {
                downloadFile(url, userAgent, contentDisposition, mimeType);
            }
        });
    }

    private void downloadFile(String url, String userAgent, String contentDisposition, String mimeType) {
        try {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setMimeType(mimeType);
            
            String cookies = CookieManager.getInstance().getCookie(url);
            request.addRequestHeader("cookie", cookies);
            request.addRequestHeader("User-Agent", userAgent);
            
            request.setDescription("Downloading file...");
            request.setTitle(URLUtil.guessFileName(url, contentDisposition, mimeType));
            
            request.allowScanningByMediaScanner();
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS,
                    URLUtil.guessFileName(url, contentDisposition, mimeType));
            
            DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
            dm.enqueue(request);
            
            Toast.makeText(getApplicationContext(), "Downloading...", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(getApplicationContext(), "Download failed", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Handle Access Token from OAuth redirect
     * Sends token directly to JavaScript and triggers automatic backup upload
     */
    private void handleAccessToken(String accessToken) {
        if (accessToken == null || accessToken.isEmpty()) {
            Toast.makeText(this, "Access token missing", Toast.LENGTH_SHORT).show();
            return;
        }

        android.util.Log.d("OAuth", "Access token received: " + accessToken.substring(0, Math.min(20, accessToken.length())) + "...");
        
        // Send token directly to JavaScript
        runOnUiThread(() -> {
            webView.evaluateJavascript("onGoogleDriveTokenReceived('" + accessToken + "')", null);
            Toast.makeText(MainActivity.this, "✅ Connected to Google Drive", Toast.LENGTH_SHORT).show();
            
            // Automatically upload latest backup.json (if exists)
            File backupFile = new File(getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), "backup.json");
            if (backupFile.exists()) {
                uploadBackupToDrive(accessToken, backupFile);
            } else {
                android.util.Log.d("DriveUpload", "No local backup.json found to upload");
            }
        });
    }
    
    /**
     * Uploads a local backup JSON file to the user's Google Drive
     */
    private void uploadBackupToDrive(String accessToken, File backupFile) {
        if (accessToken == null || accessToken.isEmpty()) {
            Toast.makeText(this, "Google Drive not connected", Toast.LENGTH_SHORT).show();
            return;
        }

        new Thread(() -> {
            android.util.Log.d("DriveUpload", "🚀 Uploading " + backupFile.getAbsolutePath() + " to Drive");
            try {
                String boundary = "----MPumpCalcBoundary" + System.currentTimeMillis();
                String metadata = "{ \"name\": \"" + backupFile.getName() + "\", " +
                        "\"mimeType\": \"application/json\" }";

                java.net.URL url = new java.net.URL("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart");
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setDoOutput(true);
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                conn.setRequestProperty("Content-Type", "multipart/related; boundary=" + boundary);

                java.io.OutputStream output = conn.getOutputStream();
                java.io.PrintWriter writer = new java.io.PrintWriter(new java.io.OutputStreamWriter(output, "UTF-8"), true);

                // Metadata
                writer.append("--").append(boundary).append("\r\n");
                writer.append("Content-Type: application/json; charset=UTF-8\r\n\r\n");
                writer.append(metadata).append("\r\n");

                // File content
                writer.append("--").append(boundary).append("\r\n");
                writer.append("Content-Type: application/json\r\n\r\n");
                writer.flush();

                java.io.FileInputStream inputStream = new java.io.FileInputStream(backupFile);
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    output.write(buffer, 0, bytesRead);
                }
                output.flush();
                inputStream.close();

                writer.append("\r\n--").append(boundary).append("--\r\n");
                writer.close();

                int responseCode = conn.getResponseCode();
                if (responseCode == 200) {
                    android.util.Log.d("DriveUpload", "Backup uploaded successfully");
                    runOnUiThread(() ->
                            Toast.makeText(MainActivity.this, "✅ Backup uploaded to Google Drive", Toast.LENGTH_LONG).show());
                } else {
                    java.io.InputStream errorStream = conn.getErrorStream();
                    String errorMsg = "";
                    if (errorStream != null) {
                        java.util.Scanner s = new java.util.Scanner(errorStream).useDelimiter("\\A");
                        errorMsg = s.hasNext() ? s.next() : "";
                        s.close();
                    }
                    android.util.Log.e("DriveUpload", "Upload failed: " + responseCode + " " + errorMsg);
                    String finalErrorMsg = errorMsg;
                    runOnUiThread(() ->
                            Toast.makeText(MainActivity.this, "Upload failed: " + responseCode + " " + finalErrorMsg, Toast.LENGTH_LONG).show());
                }

                conn.disconnect();

            } catch (Exception e) {
                e.printStackTrace();
                android.util.Log.e("DriveUpload", "Upload error", e);
                runOnUiThread(() ->
                        Toast.makeText(MainActivity.this, "Upload error: " + e.getMessage(), Toast.LENGTH_LONG).show());
            }
        }).start();
    }

    private void handleOAuthDeepLink(Intent intent) {
        if (intent == null || intent.getData() == null) return;

        Uri uri = intent.getData();
        String url = uri.toString();
        android.util.Log.d("OAuthRedirect", "Deep link received: " + url);

        // ✅ Handle both localhost and app-scheme redirects
        if (url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1")
                || url.startsWith("com.mobilepetrolpump.app:/oauth2redirect")) {

            // Convert fragment (#) into query (?) to extract parameters
            String fixedUrl = url.replace("#", "?");
            Uri parsedUri = Uri.parse(fixedUrl);

            String accessToken = parsedUri.getQueryParameter("access_token");
            String error = parsedUri.getQueryParameter("error");

            if (error != null) {
                Toast.makeText(this, "OAuth failed: " + error, Toast.LENGTH_LONG).show();
                android.util.Log.e("OAuthRedirect", "OAuth error: " + error);
                return;
            }

            if (accessToken != null && !accessToken.isEmpty()) {
                android.util.Log.d("OAuthRedirect", "✅ Access token: " + accessToken.substring(0, Math.min(20, accessToken.length())) + "...");
                handleAccessToken(accessToken);
            } else {
                android.util.Log.e("OAuthRedirect", "⚠️ No access_token found in redirect");
            }
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
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleOAuthDeepLink(intent);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == SELECT_JSON_FILE_REQUEST && resultCode == RESULT_OK) {
            if (data != null) {
                Uri uri = data.getData();
                if (uri != null) {
                    readJsonFile(uri);
                }
            }
        }
    }

    private void readJsonFile(Uri uri) {
        try {
            ContentResolver resolver = getContentResolver();
            InputStream inputStream = resolver.openInputStream(uri);
            
            if (inputStream != null) {
                StringBuilder stringBuilder = new StringBuilder();
                byte[] buffer = new byte[1024];
                int bytesRead;
                
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    stringBuilder.append(new String(buffer, 0, bytesRead));
                }
                
                inputStream.close();
                
                final String jsonData = stringBuilder.toString();
                
                // Call JavaScript function to handle import
                runOnUiThread(() -> {
                    // Escape the JSON string properly for JavaScript
                    String escapedJson = jsonData
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"")
                        .replace("\n", "\\n")
                        .replace("\r", "\\r")
                        .replace("\t", "\\t");
                    
                    String jsCode = "if (typeof window.handleAndroidImport === 'function') { " +
                                   "window.handleAndroidImport(\"" + escapedJson + "\"); " +
                                   "}";
                    
                    webView.evaluateJavascript(jsCode, null);
                    Toast.makeText(MainActivity.this, "Loading backup data...", Toast.LENGTH_SHORT).show();
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
            runOnUiThread(() -> {
                Toast.makeText(MainActivity.this, "Failed to read file: " + e.getMessage(), Toast.LENGTH_LONG).show();
            });
        }
    }


    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }

    // JavaScript Interface for PDF handling
    public class PdfJavaScriptInterface {
        Context context;

        PdfJavaScriptInterface(Context c) {
            context = c;
        }

        @JavascriptInterface
        public void printPdf(String base64Pdf, String fileName) {
            try {
                // Decode base64 to bytes
                byte[] pdfBytes = Base64.decode(base64Pdf, Base64.DEFAULT);
                
                // Save to cache (temporary file)
                File cacheDir = context.getCacheDir();
                File pdfFile = new File(cacheDir, fileName);
                
                FileOutputStream fos = new FileOutputStream(pdfFile);
                fos.write(pdfBytes);
                fos.close();
                
                // Open Android Print Dialog
                runOnUiThread(() -> {
                    printPdfFile(pdfFile, fileName);
                });
                
            } catch (IOException e) {
                e.printStackTrace();
                runOnUiThread(() -> {
                    Toast.makeText(context, "Failed to prepare PDF for printing", Toast.LENGTH_SHORT).show();
                });
            }
        }

        private void printPdfFile(File pdfFile, String jobName) {
            // Get PrintManager
            PrintManager printManager = (PrintManager) context.getSystemService(Context.PRINT_SERVICE);
            
            if (printManager != null) {
                // Create print document adapter
                PrintDocumentAdapter printAdapter = new PdfPrintDocumentAdapter(pdfFile, jobName);
                
                // Start print job
                printManager.print(jobName, printAdapter, null);
                
                Toast.makeText(context, "Opening print dialog...", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(context, "Print service not available", Toast.LENGTH_SHORT).show();
            }
        }

        @JavascriptInterface
        public void openPdfWithViewer(String base64Pdf, String fileName) {
            // Directly save PDF using MediaStore (no permissions needed for Android 10+)
            savePdfFile(base64Pdf, fileName);
        }

        private void savePdfFile(String base64Pdf, String fileName) {
            try {
                // Decode base64 PDF data
                byte[] pdfBytes = Base64.decode(base64Pdf, Base64.DEFAULT);

                // Use MediaStore to save PDF (works on Android 10+ without permissions)
                ContentResolver resolver = context.getContentResolver();
                ContentValues contentValues = new ContentValues();
                contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
                contentValues.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
                contentValues.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

                // Insert new PDF file into MediaStore
                Uri pdfUri = resolver.insert(MediaStore.Files.getContentUri("external"), contentValues);

                if (pdfUri != null) {
                    // Write PDF data to the file
                    try (OutputStream os = resolver.openOutputStream(pdfUri)) {
                        if (os != null) {
                            os.write(pdfBytes);
                            os.flush();
                        }
                    }

                    // Automatically open the PDF file
                    openPdfFileWithUri(pdfUri);

                } else {
                    throw new IOException("Failed to create new MediaStore record.");
                }

            } catch (IOException e) {
                e.printStackTrace();
                runOnUiThread(() -> {
                    Toast.makeText(context, "Failed to save PDF: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
            } catch (Exception e) {
                e.printStackTrace();
                runOnUiThread(() -> {
                    Toast.makeText(context, "An error occurred: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
            }
        }

        private void openPdfFileWithUri(Uri uri) {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/pdf");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NO_HISTORY);

            try {
                context.startActivity(intent);
            } catch (Exception e) {
                e.printStackTrace();
                runOnUiThread(() -> {
                    Toast.makeText(context, "No PDF viewer app found. Please install a PDF reader.", Toast.LENGTH_LONG).show();
                });
            }
        }


        @JavascriptInterface
        public void saveJsonBackup(String jsonData, String fileName) {
            try {
                // Use MediaStore to save JSON backup file
                ContentResolver resolver = context.getContentResolver();
                ContentValues contentValues = new ContentValues();
                contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
                contentValues.put(MediaStore.MediaColumns.MIME_TYPE, "application/json");
                contentValues.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

                // Insert new JSON file into MediaStore
                Uri jsonUri = resolver.insert(MediaStore.Files.getContentUri("external"), contentValues);

                if (jsonUri != null) {
                    // Write JSON data to the file
                    try (OutputStream os = resolver.openOutputStream(jsonUri)) {
                        if (os != null) {
                            os.write(jsonData.getBytes());
                            os.flush();
                        }
                    }

                    // Show success message
                    runOnUiThread(() -> {
                        Toast.makeText(context, "Backup saved to Downloads: " + fileName, Toast.LENGTH_LONG).show();
                    });

                } else {
                    throw new IOException("Failed to create backup file.");
                }

            } catch (IOException e) {
                e.printStackTrace();
                runOnUiThread(() -> {
                    Toast.makeText(context, "Failed to save backup: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
            } catch (Exception e) {
                e.printStackTrace();
                runOnUiThread(() -> {
                    Toast.makeText(context, "An error occurred: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
            }
        }

        @JavascriptInterface
        public void selectJsonBackup() {
            runOnUiThread(() -> {
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/json", "text/plain"});
                
                try {
                    MainActivity.this.startActivityForResult(intent, SELECT_JSON_FILE_REQUEST);
                } catch (Exception e) {
                    e.printStackTrace();
                    Toast.makeText(context, "Failed to open file picker", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void openGoogleOAuth(String authUrl) {
            runOnUiThread(() -> {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(authUrl));
                    context.startActivity(intent);
                    Toast.makeText(context, "Opening Google login...", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    e.printStackTrace();
                    Toast.makeText(context, "Failed to open Google login", Toast.LENGTH_SHORT).show();
                }
            });
        }



        private void openPdfFile(File file) {
            Uri uri;
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                // For Android 7.0+ use FileProvider
                uri = FileProvider.getUriForFile(
                        context,
                        context.getApplicationContext().getPackageName() + ".fileprovider",
                        file
                );
            } else {
                uri = Uri.fromFile(file);
            }
            
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/pdf");
            intent.setFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            
            // Create chooser to show "Open with..." dialog
            Intent chooser = Intent.createChooser(intent, "Open PDF with");
            
            try {
                context.startActivity(chooser);
            } catch (Exception e) {
                runOnUiThread(() -> {
                    Toast.makeText(context, "No PDF viewer found. Please install a PDF reader app.", Toast.LENGTH_LONG).show();
                });
            }
        }
    }

    // Print Document Adapter for PDF
    private class PdfPrintDocumentAdapter extends PrintDocumentAdapter {
        private File pdfFile;
        private String jobName;

        PdfPrintDocumentAdapter(File pdfFile, String jobName) {
            this.pdfFile = pdfFile;
            this.jobName = jobName;
        }

        @Override
        public void onLayout(PrintAttributes oldAttributes, PrintAttributes newAttributes,
                           CancellationSignal cancellationSignal, LayoutResultCallback callback,
                           Bundle extras) {
            if (cancellationSignal.isCanceled()) {
                callback.onLayoutCancelled();
                return;
            }

            PrintDocumentInfo info = new PrintDocumentInfo.Builder(jobName)
                    .setContentType(PrintDocumentInfo.CONTENT_TYPE_DOCUMENT)
                    .setPageCount(PrintDocumentInfo.PAGE_COUNT_UNKNOWN)
                    .build();

            callback.onLayoutFinished(info, true);
        }

        @Override
        public void onWrite(PageRange[] pages, ParcelFileDescriptor destination,
                          CancellationSignal cancellationSignal, WriteResultCallback callback) {
            try {
                FileInputStream input = new FileInputStream(pdfFile);
                FileOutputStream output = new FileOutputStream(destination.getFileDescriptor());

                byte[] buffer = new byte[8192];
                int bytesRead;

                while ((bytesRead = input.read(buffer)) != -1) {
                    if (cancellationSignal.isCanceled()) {
                        callback.onWriteCancelled();
                        input.close();
                        output.close();
                        return;
                    }
                    output.write(buffer, 0, bytesRead);
                }

                input.close();
                output.close();

                callback.onWriteFinished(new PageRange[]{PageRange.ALL_PAGES});

            } catch (IOException e) {
                e.printStackTrace();
                callback.onWriteFailed(e.getMessage());
            }
        }
    }
}
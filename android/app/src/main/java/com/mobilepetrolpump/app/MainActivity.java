package com.mobilepetrolpump.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Mobile Petrol Pump
 * Offline-first Android WebView + Google Drive Export
 * GPT-5 Final Build — 2025
 */
public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private static final String WEB_APP_PATH = "file:///android_asset/index.html";
    private static final String REDIRECT_URI = "http://localhost";
    private static final String TAG = "MPumpCalc";

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowContentAccess(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setLoadWithOverviewMode(true);
        webView.getSettings().setUseWideViewPort(true);
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new WebAppInterface(), "MPumpCalcAndroid");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();

                // Handle OAuth redirect back from Google
                if (uri.toString().startsWith(REDIRECT_URI) && uri.getFragment() != null) {
                    String fragment = uri.getFragment();
                    if (fragment.contains("access_token=")) {
                        String token = extractAccessToken(fragment);
                        Log.d(TAG, "✅ Google OAuth token: " + token);
                        view.loadUrl("javascript:onGoogleDriveTokenReceived('" + token + "')");

                        // Optionally trigger native upload
                        File backupFile = new File(getFilesDir(), "backup.json");
                        if (backupFile.exists()) {
                            uploadBackupToDrive(token, backupFile);
                        } else {
                            runOnUiThread(() -> Toast.makeText(MainActivity.this, "No backup file found.", Toast.LENGTH_SHORT).show());
                        }
                    } else {
                        Toast.makeText(MainActivity.this, "Login failed: No access token", Toast.LENGTH_SHORT).show();
                    }
                    return true;
                }

                return false; // Allow normal navigation
            }
        });

        webView.loadUrl(WEB_APP_PATH);
    }

    /** Extracts access_token=XYZ from URL fragment */
    private String extractAccessToken(String fragment) {
        for (String param : fragment.split("&")) {
            if (param.startsWith("access_token=")) {
                return param.split("=", 2)[1];
            }
        }
        return null;
    }

    /** JS Interface bridge for calling native Android code */
    private class WebAppInterface {

        @JavascriptInterface
        public void openGoogleOAuth(String authUrl) {
            Log.d(TAG, "🌐 Opening Google OAuth: " + authUrl);
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(authUrl));
            startActivity(intent);
        }

        @JavascriptInterface
        public void showToast(String msg) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show());
        }
    }

    /**
     * Uploads (or overwrites) backup.json to the user's Google Drive
     */
    private void uploadBackupToDrive(String accessToken, File backupFile) {
        if (accessToken == null || accessToken.isEmpty()) {
            Toast.makeText(this, "Google Drive not connected", Toast.LENGTH_SHORT).show();
            return;
        }

        new Thread(() -> {
            Log.d(TAG, "🚀 Uploading " + backupFile.getAbsolutePath() + " to Drive (overwrite if exists)");
            try {
                // 1️⃣ Search for existing backup.json
                URL queryUrl = new URL("https://www.googleapis.com/drive/v3/files?q=name='backup.json' and trashed=false");
                HttpURLConnection queryConn = (HttpURLConnection) queryUrl.openConnection();
                queryConn.setRequestProperty("Authorization", "Bearer " + accessToken);
                queryConn.setRequestMethod("GET");

                StringBuilder queryResult = new StringBuilder();
                try (java.io.BufferedReader reader = new java.io.BufferedReader(
                        new java.io.InputStreamReader(queryConn.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        queryResult.append(line);
                    }
                }

                String existingFileId = null;
                org.json.JSONObject jsonResponse = new org.json.JSONObject(queryResult.toString());
                org.json.JSONArray files = jsonResponse.optJSONArray("files");
                if (files != null && files.length() > 0) {
                    existingFileId = files.getJSONObject(0).getString("id");
                    Log.d(TAG, "Found existing backup.json with ID: " + existingFileId);
                }

                // 2️⃣ Prepare multipart request
                String boundary = "----MPumpCalcBoundary" + System.currentTimeMillis();
                String metadata = "{ \"name\": \"" + backupFile.getName() + "\", \"mimeType\": \"application/json\" }";

                String uploadUrl = existingFileId != null
                        ? "https://www.googleapis.com/upload/drive/v3/files/" + existingFileId + "?uploadType=multipart"
                        : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

                HttpURLConnection conn = (HttpURLConnection) new URL(uploadUrl).openConnection();
                conn.setDoOutput(true);
                conn.setRequestMethod(existingFileId != null ? "PATCH" : "POST");
                conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                conn.setRequestProperty("Content-Type", "multipart/related; boundary=" + boundary);

                OutputStream output = conn.getOutputStream();
                java.io.PrintWriter writer = new java.io.PrintWriter(new java.io.OutputStreamWriter(output, "UTF-8"), true);

                // Metadata part
                writer.append("--").append(boundary).append("\r\n");
                writer.append("Content-Type: application/json; charset=UTF-8\r\n\r\n");
                writer.append(metadata).append("\r\n");

                // File content
                writer.append("--").append(boundary).append("\r\n");
                writer.append("Content-Type: application/json\r\n\r\n");
                writer.flush();

                try (FileInputStream inputStream = new FileInputStream(backupFile)) {
                    byte[] buffer = new byte[4096];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        output.write(buffer, 0, bytesRead);
                    }
                }

                output.flush();
                writer.append("\r\n--").append(boundary).append("--\r\n");
                writer.close();

                int responseCode = conn.getResponseCode();
                if (responseCode == 200) {
                    Log.d(TAG, "✅ Backup uploaded or overwritten successfully");
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "✅ Backup uploaded to Google Drive", Toast.LENGTH_LONG).show());
                } else {
                    String errorMsg = "";
                    if (conn.getErrorStream() != null) {
                        java.util.Scanner s = new java.util.Scanner(conn.getErrorStream()).useDelimiter("\\A");
                        errorMsg = s.hasNext() ? s.next() : "";
                        s.close();
                    }
                    Log.e(TAG, "❌ Upload failed: " + responseCode + " " + errorMsg);
                    String finalErrorMsg = errorMsg;
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "Upload failed: " + responseCode + " " + finalErrorMsg, Toast.LENGTH_LONG).show());
                }

                conn.disconnect();

            } catch (Exception e) {
                e.printStackTrace();
                Log.e(TAG, "Upload error", e);
                runOnUiThread(() ->
                        Toast.makeText(MainActivity.this, "Upload error: " + e.getMessage(), Toast.LENGTH_LONG).show());
            }
        }).start();
    }
}

package com.mobilepetrolpump.app;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

/**
 * M.Petrol Pump - Simple Android App
 * Pure WebView wrapper - No cloud sync
 */
public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private static final String WEB_APP_URL = "file:///android_asset/index.html";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        // Enable JavaScript and local storage
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setDatabaseEnabled(true);
        
        // Enable debugging in development
        WebView.setWebContentsDebuggingEnabled(true);

        // Simple WebView Client
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Inject Android flag
                view.evaluateJavascript("window.isAndroidApp = true;", null);
            }
        });

        // Simple Chrome Client
        webView.setWebChromeClient(new WebChromeClient());

        // Load the app
        webView.loadUrl(WEB_APP_URL);
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
        if (webView != null) {
            webView.destroy();
        }
    }
}

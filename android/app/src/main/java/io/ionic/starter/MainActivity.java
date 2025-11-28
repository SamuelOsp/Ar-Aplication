package io.ionic.starter;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        android.webkit.WebView webView = getBridge().getWebView();
        webView.setWebChromeClient(new com.getcapacitor.BridgeWebChromeClient(getBridge()) {
            @Override
            public void onPermissionRequest(final android.webkit.PermissionRequest request) {
                request.grant(request.getResources());
            }
        });
    }
}

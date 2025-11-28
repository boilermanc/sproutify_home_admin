# Quick Fix: MIME Type Error

If you're seeing this error:
```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of ""
```

## Immediate Steps (Do This Now):

### Step 1: Log into Plesk
1. Go to your Plesk control panel
2. Navigate to **Domains** → **home.sproutify.app**

### Step 2: Configure Nginx (Most Likely Solution)

1. Click **Apache & nginx Settings**
2. Scroll down to **"Additional directives for nginx"** (or **"Additional nginx directives"**)
3. **Paste this exact configuration:**

```nginx
location ~* \.(js|mjs)$ {
    default_type application/javascript;
    add_header Content-Type application/javascript always;
}

location ~* \.css$ {
    default_type text/css;
    add_header Content-Type text/css always;
}

location ~* \.svg$ {
    default_type image/svg+xml;
    add_header Content-Type image/svg+xml always;
}
```

4. Click **OK** or **Apply** to save
5. Wait 1-2 minutes for the changes to propagate

### Step 3: If Using Apache Instead

1. In **Apache & nginx Settings**
2. Make sure **"Enable .htaccess files"** is checked
3. If it's not, check it and save
4. The `.htaccess` file is already deployed and should work

### Step 4: Test

1. Clear your browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
3. Check the browser's Network tab (F12 → Network)
4. Look at any `.js` file request
5. Check the Response Headers - you should see `Content-Type: application/javascript`

### Step 5: Verify via Command Line (Optional)

If you have SSH access, you can test:

```bash
curl -I https://home.sproutify.app/assets/index-*.js | grep -i content-type
```

You should see: `Content-Type: application/javascript`

## Still Not Working?

1. **Check which web server is active:**
   - In Plesk, look at **Apache & nginx Settings**
   - See if Apache or Nginx is listed as the primary server

2. **Contact IONOS Support:**
   - Tell them: "I need to configure MIME types for JavaScript modules. The server is returning an empty MIME type for .js files."
   - Ask them to add: `.js` → `application/javascript` to the server's MIME type configuration

3. **Alternative: Check if there's a MIME Types section:**
   - Some Plesk versions have a dedicated **MIME Types** section
   - Add: `.js` → `application/javascript`
   - Add: `.mjs` → `application/javascript`

## Why This Happens

Modern browsers require JavaScript modules to be served with the correct MIME type (`application/javascript`). If the server doesn't specify this, browsers reject the file for security reasons.


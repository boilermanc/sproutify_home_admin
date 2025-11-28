# Plesk MIME Type Configuration Guide

This guide explains how to configure MIME types for JavaScript modules in Plesk, which is required for your Vite-built React app to work correctly.

## Determine Your Web Server

First, check which web server Plesk is using for your domain:

1. Log into Plesk
2. Go to **Domains** → Select your domain (`home.sproutify.app`)
3. Look for **Apache & nginx Settings** or check the **Web Server** section

## Option 1: Apache (using .htaccess)

If you're using Apache, the `.htaccess` file should work automatically. However, you may need to enable it in Plesk:

1. Go to **Apache & nginx Settings**
2. Ensure **"Enable .htaccess files"** is checked
3. If it's not enabled, enable it and save

The `.htaccess` file is already included in your deployment and should work once enabled.

## Option 2: Nginx Configuration

If you're using Nginx, you need to add custom directives:

### Method A: Via Plesk Interface (Recommended)

1. Log into Plesk
2. Go to **Domains** → Select your domain
3. Click **Apache & nginx Settings**
4. Scroll to **"Additional directives for nginx"** section
5. Add the following configuration:

```nginx
# Set correct MIME types for JavaScript modules (force override)
location ~* \.(js|mjs)$ {
    default_type application/javascript;
    add_header Content-Type application/javascript always;
}

# Set correct MIME types for CSS
location ~* \.css$ {
    default_type text/css;
    add_header Content-Type text/css always;
}

# Set correct MIME types for SVG
location ~* \.svg$ {
    default_type image/svg+xml;
    add_header Content-Type image/svg+xml always;
}
```

6. Click **OK** to save
7. The changes will apply automatically

### Method B: Using the nginx.conf file

A `nginx.conf` file is included in your deployment. You can reference it, but Plesk typically requires adding the directives through the interface.

## Option 3: Configure MIME Types in Plesk

Alternatively, you can configure MIME types directly in Plesk:

1. Go to **Apache & nginx Settings**
2. Look for **MIME Types** or **Additional directives**
3. Add the following MIME type mappings:
   - `.js` → `application/javascript`
   - `.mjs` → `application/javascript`
   - `.css` → `text/css`
   - `.svg` → `image/svg+xml`

## Verify Configuration

After making changes:

1. Clear your browser cache
2. Try loading the site again
3. Check the browser's Network tab (F12) to verify the JavaScript files are being served with `Content-Type: application/javascript`

## Troubleshooting

If the issue persists:

1. **Check if .htaccess is working (Apache):**
   - SSH into your server
   - Navigate to `~/httpdocs/`
   - Verify `.htaccess` file exists: `ls -la .htaccess`
   - Check Apache error logs: `tail -f /var/log/apache2/error.log`

2. **Check Nginx configuration (Nginx):**
   - Verify your custom directives are in the nginx config
   - Test nginx configuration: `nginx -t`
   - Check nginx error logs: `tail -f /var/log/nginx/error.log`

3. **Contact IONOS Support:**
   - If neither method works, contact IONOS support
   - Ask them to configure MIME types for JavaScript modules
   - Provide them with this file for reference

## Quick Test

To quickly test if MIME types are configured correctly, you can check the HTTP headers:

```bash
curl -I https://home.sproutify.app/assets/index-*.js
```

You should see `Content-Type: application/javascript` in the response headers.


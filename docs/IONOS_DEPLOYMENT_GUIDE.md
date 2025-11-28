# Complete IONOS Deployment Guide for Sproutify Admin Apps

This guide covers everything needed to deploy a Vite React app to IONOS using Plesk, based on the successful deployment of `home.sproutify.app`.

## Prerequisites

1. IONOS hosting account with Plesk access
2. GitHub repository with your app
3. Domain/subdomain configured in Plesk (e.g., `micro.sproutify.app`)
4. SSH/SFTP access credentials

## Step 1: GitHub Actions Workflow Setup

### Create `.github/workflows/deploy-ionos.yml`

```yaml
name: Deploy to IONOS

on:
  workflow_dispatch:  # manual deployment
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '21'
          cache: 'npm'
          cache-dependency-path: 'package-lock.json'

      - name: Install dependencies
        run: npm install

      - name: Build Home Admin App
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
        run: npm run build

      - name: Copy .htaccess to dist
        run: cp public/.htaccess dist/.htaccess || echo ".htaccess not found in public, skipping"

      - name: Verify build output
        run: |
          echo "=== Build verification ==="
          echo "Checking dist/index.html:"
          head -15 dist/index.html
          echo ""
          echo "Checking dist/assets:"
          ls -la dist/assets/ || echo "No assets directory!"
          echo ""
          echo "Verifying index.html references compiled JS:"
          if grep -q "/assets/index-" dist/index.html; then
            echo "✓ index.html correctly references compiled assets"
          else
            echo "✗ ERROR: index.html does not reference compiled assets!"
            exit 1
          fi

      - name: Find httpdocs path
        id: find_path
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.IONOS_HOST }}
          username: ${{ secrets.IONOS_USERNAME }}
          password: ${{ secrets.IONOS_PASSWORD }}
          port: 2222
          script: |
            echo "=== Looking for micro.sproutify.app httpdocs directory ==="
            HTTPDOCS_PATH=""
            # Check for micro.sproutify.app specific paths
            if [ -d /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs ]; then
              HTTPDOCS_PATH=/var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs
              echo "✓ Found: $HTTPDOCS_PATH"
            elif [ -d /var/www/vhosts/micro.sproutify.app/httpdocs ]; then
              HTTPDOCS_PATH=/var/www/vhosts/micro.sproutify.app/httpdocs
              echo "✓ Found: $HTTPDOCS_PATH"
            elif [ -d ~/micro.sproutify.app/httpdocs ]; then
              HTTPDOCS_PATH=$(cd ~/micro.sproutify.app/httpdocs && pwd)
              echo "✓ Found: $HTTPDOCS_PATH"
            else
              echo "⚠ micro.sproutify.app specific path not found"
              echo ""
              echo "Checking available vhost directories:"
              ls -la /var/www/vhosts/ 2>/dev/null | head -20 || echo "Cannot list /var/www/vhosts/"
              echo ""
              echo "Checking sweetwaterurbanfarms.com subdirectories:"
              ls -la /var/www/vhosts/sweetwaterurbanfarms.com/ 2>/dev/null | head -20 || echo "Cannot list subdirectories"
              echo ""
              echo "ERROR: Could not find micro.sproutify.app httpdocs directory!"
              echo "Please verify the correct path in Plesk and update the workflow."
              exit 1
            fi
            echo "HTTPDOCS_PATH=$HTTPDOCS_PATH" >> $GITHUB_OUTPUT
            echo ""
            echo "=== Using path: $HTTPDOCS_PATH ==="
            echo "Verifying this is the correct directory:"
            ls -la "$HTTPDOCS_PATH" | head -10

      - name: Clean IONOS directory (micro.sproutify.app only)
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.IONOS_HOST }}
          username: ${{ secrets.IONOS_USERNAME }}
          password: ${{ secrets.IONOS_PASSWORD }}
          port: 2222
          script: |
            # Use the correct path for micro.sproutify.app subdomain
            if [ -d /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs ]; then
              cd /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs
            elif [ -d /var/www/vhosts/micro.sproutify.app/httpdocs ]; then
              cd /var/www/vhosts/micro.sproutify.app/httpdocs
            elif [ -d ~/micro.sproutify.app/httpdocs ]; then
              cd ~/micro.sproutify.app/httpdocs
            else
              echo "ERROR: micro.sproutify.app httpdocs directory not found!"
              echo "This prevents accidentally overwriting the wrong site."
              exit 1
            fi
            echo "Cleaning directory: $(pwd)"
            echo "⚠ WARNING: This will delete all files in this directory"
            rm -rf ./*
            rm -rf ./.* 2>/dev/null || true
            echo "Directory cleaned"

      - name: Deploy to IONOS via SFTP (micro.sproutify.app)
        uses: Dylan700/sftp-upload-action@v1.2.3
        with:
          server: ${{ secrets.IONOS_HOST }}
          username: ${{ secrets.IONOS_USERNAME }}
          password: ${{ secrets.IONOS_PASSWORD }}
          port: 2222
          uploads: |
            ./dist/ => /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs/

      - name: Set file permissions
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.IONOS_HOST }}
          username: ${{ secrets.IONOS_USERNAME }}
          password: ${{ secrets.IONOS_PASSWORD }}
          port: 2222
          script: |
            # Use the correct path for micro.sproutify.app subdomain
            if [ -d /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs ]; then
              cd /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs
            elif [ -d /var/www/vhosts/micro.sproutify.app/httpdocs ]; then
              cd /var/www/vhosts/micro.sproutify.app/httpdocs
            elif [ -d ~/micro.sproutify.app/httpdocs ]; then
              cd ~/micro.sproutify.app/httpdocs
            else
              echo "ERROR: micro.sproutify.app httpdocs directory not found!"
              exit 1
            fi
            echo "Setting permissions in: $(pwd)"
            chmod -R 755 .
            find . -type f -exec chmod 644 {} \;
            find . -type d -exec chmod 755 {} \;
            echo "Permissions set"

      - name: Verify deployment
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.IONOS_HOST }}
          username: ${{ secrets.IONOS_USERNAME }}
          password: ${{ secrets.IONOS_PASSWORD }}
          port: 2222
          script: |
            echo "Home directory: $(cd ~ && pwd)"
            echo ""
            echo "=== Looking for micro.sproutify.app directory ==="
            if [ -d /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs ]; then
              cd /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs
              echo "Using: /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs ($(pwd))"
            elif [ -d /var/www/vhosts/micro.sproutify.app/httpdocs ]; then
              cd /var/www/vhosts/micro.sproutify.app/httpdocs
              echo "Using: /var/www/vhosts/micro.sproutify.app/httpdocs ($(pwd))"
            elif [ -d ~/micro.sproutify.app/httpdocs ]; then
              cd ~/micro.sproutify.app/httpdocs
              echo "Using: ~/micro.sproutify.app/httpdocs ($(pwd))"
            else
              echo "ERROR: micro.sproutify.app httpdocs not found"
              echo "Checking available paths:"
              echo "Listing /var/www/vhosts/:"
              ls -la /var/www/vhosts/ 2>/dev/null | head -20 || true
              exit 1
            fi
            echo ""
            echo "=== Deployed files ==="
            ls -la
            echo ""
            echo "=== Checking for index.html ==="
            if [ -f index.html ]; then
              echo "✓ index.html exists"
              echo "First 20 lines of index.html:"
              head -20 index.html
            else
              echo "ERROR: index.html not found!"
              exit 1
            fi
            echo ""
            echo "=== Checking assets directory ==="
            if [ -d assets ]; then
              echo "✓ assets directory exists"
              echo "Files in assets directory:"
              ls -la assets/
              echo ""
              echo "Checking for expected JS file:"
              ls -la assets/index-*.js || echo "WARNING: No index-*.js files found!"
              echo ""
              echo "Checking for expected CSS file:"
              ls -la assets/index-*.css || echo "WARNING: No index-*.css files found!"
            else
              echo "ERROR: assets directory not found!"
              echo "Current directory contents:"
              ls -la
              exit 1
            fi
            echo ""
            echo "=== Checking for .htaccess ==="
            ls -la .htaccess || echo ".htaccess not found (optional)"
            echo ""
            echo "=== Verifying index.html references ==="
            if grep -q "/assets/index-" index.html; then
              echo "✓ index.html correctly references assets"
            else
              echo "✗ WARNING: index.html does not reference assets correctly"
              echo "Content:"
              cat index.html
            fi
```

**Important:** Replace all instances of `micro.sproutify.app` with your actual domain/subdomain name.

## Step 2: GitHub Secrets Configuration

In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add:

1. **`VITE_SUPABASE_URL`** - Your Supabase project URL
2. **`VITE_SUPABASE_PUBLISHABLE_KEY`** - Your Supabase anon/publishable key
3. **`IONOS_HOST`** - Your IONOS server hostname/IP
4. **`IONOS_USERNAME`** - Your IONOS SSH/SFTP username
5. **`IONOS_PASSWORD`** - Your IONOS SSH/SFTP password

## Step 3: Create .htaccess File

Create `public/.htaccess` in your project:

```apache
# Set correct MIME types for JavaScript modules
# Force MIME types even if mod_mime is not available
AddType application/javascript .js
AddType application/javascript .mjs
AddType text/javascript .js
AddType text/css .css
AddType image/svg+xml .svg

# Alternative method using FilesMatch
<FilesMatch "\.(js|mjs)$">
    ForceType application/javascript
</FilesMatch>

<FilesMatch "\.css$">
    ForceType text/css
</FilesMatch>

<FilesMatch "\.svg$">
    ForceType image/svg+xml
</FilesMatch>

# Enable CORS for module scripts (if needed)
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

## Step 4: Plesk Nginx Configuration

### Find Your Document Root Path

1. Log into Plesk
2. Go to **Domains** → **micro.sproutify.app**
3. Check **Hosting Settings** to find the Document Root path
4. Common paths:
   - `/var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs`
   - `/var/www/vhosts/micro.sproutify.app/httpdocs`
   - `~/micro.sproutify.app/httpdocs`

### Configure Nginx in Plesk

1. Go to **Domains** → **micro.sproutify.app**
2. Click **Apache & nginx Settings**
3. Scroll to **"Additional directives for nginx"**
4. **Paste this configuration** (update the root path to match your actual path):

```nginx
# CRITICAL: Serve assets directory first (before SPA routing)
location /assets/ {
	root /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs;
	add_header Content-Type "application/javascript" always;
	try_files $uri =404;
}

# Force correct MIME types for JS and CSS files
location ~* \.(js|mjs)$ {
	root /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs;
	add_header Content-Type "application/javascript" always;
	try_files $uri =404;
}

location ~* \.css$ {
	root /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs;
	add_header Content-Type "text/css" always;
	try_files $uri =404;
}

location ~* \.svg$ {
	root /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs;
	add_header Content-Type "image/svg+xml" always;
	try_files $uri =404;
}

# Optional: Cache control for index.html
location = /index.html {
	root /var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs;
	add_header Cache-Control "no-cache, no-store, must-revalidate" always;
	add_header Pragma "no-cache" always;
	add_header Expires 0 always;
}
```

**⚠️ IMPORTANT:** 
- Replace `/var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs` with your actual document root path
- Do NOT include a `location /` block - Plesk already generates one automatically
- If you add a `location /` block, you'll get a "duplicate location" error

5. Click **OK** to save
6. Wait 1-2 minutes for changes to apply

## Step 5: Verify Supabase Client Configuration

Ensure your `src/supabaseClient.ts` supports both environment variable names:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-default-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'your-default-key'
```

## Step 6: First Deployment

1. Push your code to the `main` branch
2. The GitHub Actions workflow will automatically trigger
3. Monitor the deployment in **Actions** tab
4. Check the "Verify deployment" step to ensure all files are uploaded correctly

## Step 7: Troubleshooting

### Issue: 403 Forbidden Error
**Solution:** Check that the Nginx root path matches your actual document root. Verify in Plesk under Hosting Settings.

### Issue: 404 for Assets
**Solution:** 
- Verify the `/assets/` location block is in your Nginx config
- Check that the root path is correct
- Ensure files are actually deployed (check verification step)

### Issue: 404 for Routes (e.g., /community-signups)
**Solution:**
- This is a Single Page Application (SPA) routing issue
- The `.htaccess` file includes rewrite rules to handle client-side routing
- Ensure `.htaccess` is deployed to your `httpdocs` directory
- If using nginx primarily, you may need to contact IONOS support to add `try_files $uri $uri/ /index.html;` to the default `location /` block in nginx
- Alternatively, ensure Apache is processing requests (IONOS typically uses Apache behind nginx, so `.htaccess` should work)

### Issue: MIME Type Error (Empty MIME type)
**Solution:**
- Ensure Nginx configuration is saved in Plesk
- Check that the `/assets/` location block comes before any SPA routing
- Verify `.htaccess` file is deployed (for Apache fallback)

### Issue: Files Not Uploading
**Solution:**
- Check the SFTP upload path matches your actual directory structure
- Verify SSH credentials are correct
- Check the "Find httpdocs path" step to see what path was discovered

### Issue: Wrong Site Being Overwritten
**Solution:**
- The workflow only looks for domain-specific paths (e.g., `micro.sproutify.app/httpdocs`)
- It will fail if it can't find the specific path, preventing accidental overwrites
- Always verify the path in the "Find httpdocs path" step

## Step 8: Verify Deployment

After deployment, check:

1. **Files are deployed:**
   - `index.html` exists
   - `assets/` directory exists with JS and CSS files
   - `.htaccess` exists (optional)

2. **Site loads:**
   - Visit `https://micro.sproutify.app`
   - Check browser console for errors
   - Verify JavaScript files load with correct MIME type

3. **Authentication works:**
   - Test login functionality
   - Verify Supabase connection

## Key Points to Remember

1. **Always use domain-specific paths** - Never deploy to generic paths like `~/httpdocs` to avoid overwriting other sites
2. **Nginx configuration is critical** - Without proper MIME types, JavaScript modules won't load
3. **Verify the path** - Use the "Find httpdocs path" step to discover the correct deployment path
4. **Test after deployment** - Always verify the site works after deployment
5. **Keep secrets secure** - Never commit secrets to the repository

## Quick Reference: Path Structure

For subdomains under `sweetwaterurbanfarms.com`:
- Path: `/var/www/vhosts/sweetwaterurbanfarms.com/[subdomain]/httpdocs`
- Example: `/var/www/vhosts/sweetwaterurbanfarms.com/micro.sproutify.app/httpdocs`

For standalone domains:
- Path: `/var/www/vhosts/[domain]/httpdocs`
- Example: `/var/www/vhosts/micro.sproutify.app/httpdocs`

## Support

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Verify all paths match your actual Plesk configuration
3. Ensure Nginx configuration is saved and active
4. Test with a simple file first to verify the path is correct


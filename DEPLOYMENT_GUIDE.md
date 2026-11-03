# Miles vs Cash Advisor — Online Deployment & PWA Mobile Guide

Transform your **Miles vs Cash Advisor** into a globally accessible, 100% free web app accessible anywhere in the world from any smartphone, tablet, or laptop, with complete **offline capability** and **native app installation**.

---

## 🌟 Why This Setup is Best

- **100% Free Forever**: Hosted on GitHub Pages global edge CDN with zero hosting bills.
- **Automatic SSL / HTTPS**: Secure padlock certificate managed automatically.
- **Installable PWA**: Tap **"Add to Home Screen"** on iOS or Android for a fullscreen app with no browser address bars.
- **Works Offline**: The built-in Service Worker caches routes, cards, and calculator logic so you can calculate miles valuation mid-flight in airplane mode or with spotty airport Wi-Fi.
- **Your Data Stays Private**: Your custom card wallet and credit limits stay strictly in your personal browser (`localStorage`), never sent to any remote server.

---

## 🚀 Step 1: Create a Free GitHub Repository (30 seconds)

1. Open your browser and log in to [GitHub](https://github.com).
2. Go to [https://github.com/new](https://github.com/new) to create a new repository.
3. Set:
   - **Repository name**: `flight-miles-calculator` (or any name you like)
   - **Visibility**: **Public** (required for free GitHub Pages)
   - **Initialize with**: Leave *README*, *.gitignore*, and *license* **unchecked** (our folder already contains them).
4. Click **Create repository**.
5. Copy the HTTPS URL provided (e.g., `https://github.com/YOUR_USERNAME/flight-miles-calculator.git`).

---

## 💻 Step 2: Push Your App to GitHub

### Option A — 1-Click Windows Launcher (Easiest)
1. Double-click the file:
   ```text
   push_to_github.bat
   ```
2. When prompted, paste your GitHub HTTPS repository URL from Step 1.
3. Press **Enter**. The script will automatically initialize Git, stage all files, commit them, and push to branch `main`.

### Option B — Using Git Terminal
If you prefer running commands manually in your terminal or PowerShell:
```powershell
cd "c:\Users\regen\Desktop\Devitto\AG Projects\flight-miles-calculator"
git init -b main
git add -A
git commit -m "Deploy Miles vs Cash Advisor PWA"
git remote add origin https://github.com/YOUR_USERNAME/flight-miles-calculator.git
git push -u origin main
```

---

## ⚙️ Step 3: Enable GitHub Pages Deployment (15 seconds)

Once your code is pushed to GitHub:

1. In your GitHub repository, click on **Settings** (top tab with gear icon).
2. In the left navigation menu, click **Pages**.
3. Under **Build and deployment**:
   - Change **Source** from *"Deploy from a branch"* to **"GitHub Actions"**.
4. That's it! GitHub will automatically trigger the included workflow (`.github/workflows/deploy.yml`).
5. Wait ~60 seconds. GitHub Pages will display your live public URL:
   ```text
   https://YOUR_USERNAME.github.io/flight-miles-calculator/
   ```

---

## 📱 Step 4: Install to Your Smartphone (PWA)

### On Apple iPhone / iPad (Safari):
1. Open your live GitHub Pages URL in **Safari**.
2. Tap the **Share** button (the square with an upward arrow at the bottom of the screen).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add** in the top right corner.
5. The **Miles Advisor** icon with its AMOLED jet badge is now installed on your iPhone home screen!
6. Tap it to launch: it opens in fullscreen (no Safari URL bar) with pure black AMOLED theme and full offline support.

### On Android (Chrome / Samsung Internet / Edge):
1. Open your live GitHub Pages URL in **Google Chrome**.
2. A banner prompt will appear: **"Add Miles Advisor to Home screen"**.
   - *(If not, tap the three dots `⋮` in the top right corner and select **"Install app"** or **"Add to Home screen"**)*.
3. Tap **Install**.
4. The app will be placed into your app drawer and home screen just like an app installed from the Google Play Store!

---

## 🌐 (Optional) Using Your Own Custom Domain

If you own a custom domain (e.g., `miles.yourdomain.com`):
1. In your GitHub repository, go to **Settings** -> **Pages**.
2. Under **Custom domain**, type your domain name (e.g., `miles.yourdomain.com`) and click **Save**.
3. In your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.), add a `CNAME` record:
   - **Type**: `CNAME`
   - **Name**: `miles` (or `@` if root domain)
   - **Target**: `YOUR_USERNAME.github.io`
4. Check **"Enforce HTTPS"** in GitHub repository settings. GitHub will generate a free SSL certificate automatically!

---

## 🔄 Updating Your Live App in the Future

Whenever you make changes to cards, routes, or code:
1. Simply double-click `push_to_github.bat`.
2. It will stage your latest modifications and push them to GitHub.
3. GitHub Actions will rebuild and update your live website and mobile apps in under 60 seconds!

# Deployment Guide - Step by Step

This guide will walk you through deploying your blog from scratch.

## Step 1: Install Hugo

### On Your Kali/Linux Machine:

```bash
cd ~/Downloads
wget https://github.com/gohugoio/hugo/releases/download/v0.139.3/hugo_extended_0.139.3_Linux-64bit.tar.gz
tar -xzf hugo_extended_0.139.3_Linux-64bit.tar.gz
sudo mv hugo /usr/local/bin/
hugo version
```

### On Windows:

Using Chocolatey:
```powershell
choco install hugo-extended
```

Or download from: https://github.com/gohugoio/hugo/releases/tag/v0.139.3

## Step 2: Setup Your Blog

```bash
# Navigate to where you want your blog
cd ~/Documents  # or wherever you prefer

# Copy the harry-blog folder I created to your machine
# Then navigate into it
cd harry-blog

# Initialize git
git init

# Add the theme as a submodule
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
git submodule update --init --recursive
```

## Step 3: Customize Your Site

Edit `hugo.toml`:

```bash
nano hugo.toml  # or use your preferred editor
```

**Things to change**:
1. Line 1: `baseURL = 'https://YOUR-GITHUB-USERNAME.github.io/'`
2. Line 3: Change the title if you want
3. Line 10: Update the description
4. Line 11: Your name
5. Lines 23-35: Update the social media links (LinkedIn, GitHub, email)
6. Line 18-21: Update your bio in the welcome message

Save and exit.

## Step 4: Test Locally

```bash
hugo server -D
```

Open your browser and go to: `http://localhost:1313`

You should see your blog! Press `Ctrl+C` to stop the server when done.

## Step 5: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `YOUR-USERNAME.github.io` (example: `harry123.github.io`)
3. Make it **Public**
4. Don't add README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 6: Push to GitHub

```bash
# Make sure you're in the harry-blog directory
git add .
git commit -m "Initial commit - blog setup"
git branch -M main

# Replace YOUR-USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR-USERNAME/YOUR-USERNAME.github.io.git
git push -u origin main
```

## Step 7: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under "Source", select **GitHub Actions**
5. Wait 2-3 minutes for the action to complete

## Step 8: Verify Deployment

1. Go to the **Actions** tab in your repository
2. You should see a workflow running/completed
3. Once it shows a green checkmark, visit: `https://YOUR-USERNAME.github.io`

🎉 Your blog is live!

## Step 9: Add Cloudflare (Optional but Recommended)

### Option A: Use GitHub Pages URL directly

If you don't have a custom domain, you can still use Cloudflare:

1. Go to https://cloudflare.com and sign up
2. You can use Cloudflare's free services even with GitHub's URL
3. Set up firewall rules, caching, and analytics

### Option B: Use a Custom Domain

1. Buy a domain (Namecheap, Google Domains, etc.) - usually $10-15/year
2. Add site to Cloudflare:
   - Click "Add Site"
   - Enter your domain
   - Choose the Free plan
   - Copy the nameservers Cloudflare gives you
3. Go to your domain registrar and update nameservers to Cloudflare's
4. In Cloudflare DNS settings, add:
   ```
   Type: CNAME
   Name: @
   Target: YOUR-USERNAME.github.io
   Proxy: ON (orange cloud)
   
   Type: CNAME
   Name: www
   Target: YOUR-USERNAME.github.io
   Proxy: ON (orange cloud)
   ```
5. In GitHub repo → Settings → Pages → Custom domain, enter your domain
6. Enable "Enforce HTTPS"

### Cloudflare Recommended Settings:

- **SSL/TLS** → Full (strict)
- **Speed** → Optimization → Enable Auto Minify (HTML, CSS, JS)
- **Speed** → Optimization → Enable Brotli
- **Caching** → Configuration → Browser Cache TTL → 4 hours
- **SSL/TLS** → Edge Certificates → Always Use HTTPS → ON

## Step 10: Writing Your First Writeup

```bash
# Create a new writeup
hugo new content/writeups/tryhackme/pickle-rick.md

# This creates the file with frontmatter already set up
# Edit it with your favorite editor
nano content/writeups/tryhackme/pickle-rick.md
```

Use the `WRITEUP_TEMPLATE.md` as a guide for structure.

## Step 11: Publishing New Writeups

Every time you write a new writeup:

```bash
# Test locally first
hugo server -D

# When happy with it, commit and push
git add .
git commit -m "Add Pickle Rick writeup"
git push
```

GitHub Actions will automatically rebuild and deploy your site in ~2 minutes!

## Common Issues & Solutions

### Issue: Theme not loading

```bash
git submodule update --init --recursive
```

### Issue: Site not updating after push

- Check the Actions tab for errors
- Wait 2-3 minutes (deployment takes time)
- Hard refresh your browser (Ctrl+Shift+R)

### Issue: Images not showing

Images should go in `static/images/` folder:
```
static/
  images/
    tryhackme/
      rootme-screenshot.png
```

Reference in markdown: `![Description](/images/tryhackme/rootme-screenshot.png)`

### Issue: Want to add screenshots to writeups

```bash
mkdir -p static/images/tryhackme
# Copy your screenshots there
# Reference in markdown as shown above
```

## Quick Reference Commands

```bash
# Start dev server
hugo server -D

# Create new writeup
hugo new content/writeups/tryhackme/ROOMNAME.md

# Build site (not needed - GitHub does this)
hugo

# Commit and push changes
git add .
git commit -m "Your message here"
git push

# Update theme
git submodule update --remote --merge
```

## Next Steps

1. Write more CTF writeups
2. Customize the theme colors/style
3. Add tags to organize content
4. Set up Google Analytics (optional)
5. Share your blog on LinkedIn!

---

Need help? The README.md has more detailed info on customization and features.

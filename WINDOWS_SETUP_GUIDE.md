# Windows Setup Guide - Step by Step

Everything you need to get your blog running on Windows.

---

## Step 1: Install Git

If you don't already have Git:

1. Download from: https://git-scm.com/download/win
2. Run the installer - default options are fine **except**:
   - "Adjusting your PATH" → Select **"Git from the command line and also from 3rd-party software"**
   - Default editor → Change to **VS Code** if you have it, otherwise leave as Vim
3. Finish install

Verify in PowerShell:
```powershell
git --version
```

---

## Step 2: Install Hugo

The easiest way is with **winget** (built into Windows 10/11):

```powershell
winget install Hugo.Hugo.Extended
```

Verify:
```powershell
hugo version
```

You should see something like: `hugo v0.139.3+extended windows/amd64`

**Alternative - Manual Install:**
1. Download `hugo_extended_0.139.3_windows-amd64.zip` from:
   https://github.com/gohugoio/hugo/releases/tag/v0.139.3
2. Extract the zip
3. Move `hugo.exe` to `C:\Hugo\bin\`
4. Add to PATH:
   - Search "Environment Variables" in Start Menu
   - Click "Environment Variables"
   - Under System Variables, find `Path` → Edit → New
   - Add `C:\Hugo\bin`
   - Click OK all the way through
5. Restart PowerShell and verify with `hugo version`

---

## Step 3: Install VS Code (Recommended)

Best editor for this workflow on Windows:

```powershell
winget install Microsoft.VisualStudioCode
```

Or download from: https://code.visualstudio.com

**Useful VS Code Extensions to install:**
- **Markdown All in One** - Markdown preview and shortcuts
- **Hugo Language and Syntax Support** - Hugo-specific highlighting
- **GitLens** - Better Git integration

---

## Step 4: Extract and Setup Your Blog

Open PowerShell and run:

```powershell
# Navigate to Documents (or wherever you want your blog)
cd ~\Documents

# Extract the downloaded archive
# (right-click the .tar.gz and extract, or use 7-Zip/WinRAR)
# Then navigate into it
cd harry-blog

# Initialize git
git init

# Add the PaperMod theme as a submodule
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
git submodule update --init --recursive
```

**Note on extracting .tar.gz on Windows:**
- Windows 11 natively supports it: right-click → Extract All
- Windows 10: Use 7-Zip (https://www.7-zip.org/) - right-click → 7-Zip → Extract Here

---

## Step 5: Customize Your Site

Open the project in VS Code:

```powershell
code .
```

Open `hugo.toml` and change:

```toml
# Line 1 - your GitHub Pages URL
baseURL = 'https://YOUR-GITHUB-USERNAME.github.io/'

# Line 3 - your site title
title = 'Harry - Cybersecurity Blog'

# Lines 18-21 - your intro text
[params.homeInfoParams]
Title = "Welcome to my blog"
Content = "Your bio here..."

# Lines 23-35 - your social links
[[params.socialIcons]]
name = "linkedin"
url = "https://linkedin.com/in/YOUR-PROFILE"

[[params.socialIcons]]
name = "github"
url = "https://github.com/YOUR-USERNAME"
```

Save with `Ctrl+S`.

---

## Step 6: Test Locally

```powershell
hugo server -D
```

Open your browser and go to: `http://localhost:1313`

You should see your blog! Press `Ctrl+C` in PowerShell to stop.

---

## Step 7: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `YOUR-USERNAME.github.io`
   - Example: if your GitHub username is `harrycyber` → `harrycyber.github.io`
3. Set to **Public**
4. **Don't** tick README, .gitignore, or license
5. Click **Create repository**

---

## Step 8: Connect to GitHub

### Configure Git (first time only):

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@github.com"
```

### Push your blog:

```powershell
git add .
git commit -m "Initial commit - blog setup"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-USERNAME.github.io.git
git push -u origin main
```

**If it asks for credentials:**

GitHub no longer accepts passwords - you need a Personal Access Token:

1. GitHub.com → click your profile picture → **Settings**
2. Scroll down → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)**
4. Give it a name like "blog-deploy"
5. Set expiration (90 days or No expiration)
6. Tick the **repo** checkbox
7. Click **Generate token**
8. **Copy the token immediately** (you won't see it again)
9. When Git asks for password → paste the token

**To avoid entering it every time:**

```powershell
git config --global credential.helper manager
```

Windows Credential Manager will store it after first use.

---

## Step 9: Enable GitHub Pages

1. Go to your repo on GitHub
2. **Settings** → **Pages** (left sidebar)
3. Source → select **GitHub Actions**
4. Wait 2-3 minutes

---

## Step 10: Verify Deployment

1. Click the **Actions** tab in your repo
2. Watch the workflow run (green checkmark = success)
3. Visit: `https://YOUR-USERNAME.github.io`

🎉 Your blog is live!

---

## Step 11: Your Daily Writeup Workflow

### Create a new writeup:

```powershell
cd ~\Documents\harry-blog
hugo new content/writeups/tryhackme/roomname.md
code content/writeups/tryhackme/roomname.md
```

### Add screenshots:

```powershell
# Create image folder for the room
mkdir static\images\tryhackme\roomname

# Copy screenshots from Desktop
copy ~\Desktop\screenshot1.png static\images\tryhackme\roomname\nmap-scan.png
copy ~\Desktop\screenshot2.png static\images\tryhackme\roomname\reverse-shell.png
```

### Preview locally:

```powershell
hugo server -D
# Open http://localhost:1313
```

### Publish:

```powershell
git add .
git commit -m "Add roomname writeup"
git push
```

Site updates in ~2 minutes. Done!

---

## Multi-Device Sync (Kali/Mac/Windows)

Since it's all Git-based, here's how to sync across your machines:

### First time on a new machine:
```bash
# Clone the repo (works on any OS)
git clone https://github.com/YOUR-USERNAME/YOUR-USERNAME.github.io.git
cd YOUR-USERNAME.github.io
git submodule update --init --recursive
```

### Every time you sit down to work:
```powershell
# Always pull first to get latest changes
git pull

# Do your work, then push
git add .
git commit -m "Your message"
git push
```

This keeps all three machines in sync automatically.

---

## Useful PowerShell Shortcuts

Add these to your PowerShell profile for quick access:

```powershell
# Open your profile
code $PROFILE

# Add these lines:
function blog { cd ~\Documents\harry-blog; hugo server -D }
function newroom { hugo new content/writeups/tryhackme/$args[0].md }
function publish {
    git add .
    git commit -m $args[0]
    git push
}
```

Save and reload:
```powershell
. $PROFILE
```

Now you can use:
```powershell
blog                          # Start dev server
newroom pickle-rick           # Create new writeup
publish "Add pickle rick writeup"  # Commit and push
```

---

## Screenshot Workflow on Windows

Windows has great built-in screenshot tools:

- `Win + Shift + S` → Snipping tool (select area, auto-copies to clipboard)
- `Win + PrtScn` → Full screen saved to `~\Pictures\Screenshots`
- `Alt + PrtScn` → Active window to clipboard

**Recommended:** Use `Win + Shift + S` then paste into a folder.

**Or use Greenshot** (free):
```powershell
winget install Greenshot.Greenshot
```
Lets you annotate screenshots before saving - great for highlighting things in writeups.

---

## Cloudflare Setup (Optional)

### If using GitHub Pages URL only:
No extra setup needed - GitHub provides HTTPS automatically.

### If using a custom domain:
1. Buy domain (Namecheap, Cloudflare Registrar, etc.)
2. Sign up at https://cloudflare.com
3. Add site → enter domain → Free plan
4. Update nameservers at your registrar to Cloudflare's
5. In Cloudflare DNS, add:
   ```
   Type: CNAME  |  Name: @    |  Target: YOUR-USERNAME.github.io  |  Proxy: ON
   Type: CNAME  |  Name: www  |  Target: YOUR-USERNAME.github.io  |  Proxy: ON
   ```
6. GitHub repo → Settings → Pages → Custom domain → enter your domain
7. Tick **Enforce HTTPS**

**Cloudflare Settings:**
- SSL/TLS → Full (strict)
- Speed → Optimization → Auto Minify all
- SSL/TLS → Edge Certificates → Always Use HTTPS → ON

---

## Troubleshooting

### "hugo is not recognized"
```powershell
# Re-check PATH - open a new PowerShell window after installing
hugo version

# If still broken, verify the PATH entry exists:
$env:PATH -split ";"
```

### "git is not recognized"
Restart PowerShell after installing Git. If still broken, reinstall and ensure PATH option was selected.

### Theme not loading (blank/unstyled page)
```powershell
git submodule update --init --recursive
```

### Port 1313 already in use
```powershell
# Use a different port
hugo server -D -p 1314

# Or find and kill what's using 1313
netstat -ano | findstr :1313
taskkill /PID <PID_NUMBER> /F
```

### Git keeps asking for credentials
```powershell
git config --global credential.helper manager
```

### Line ending issues (Windows vs Linux)
```powershell
git config --global core.autocrlf true
```

---

## Quick Reference Commands

```powershell
# Start dev server
hugo server -D

# Create new writeup
hugo new content/writeups/tryhackme/ROOMNAME.md

# Open in VS Code
code .

# Pull latest changes (do this first each session)
git pull

# Commit and push
git add .
git commit -m "Your message here"
git push

# Update theme
git submodule update --remote --merge
```

---

You're all set! Start with Step 1 and work through it - you'll be live in about 15 minutes.

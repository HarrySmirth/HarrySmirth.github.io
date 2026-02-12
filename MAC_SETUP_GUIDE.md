# Mac Deployment Guide - Step by Step

This guide is specifically for setting up your blog on macOS.

## Step 1: Install Homebrew (if you don't have it)

Open Terminal and run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the prompts. After installation, follow any additional instructions it gives you.

## Step 2: Install Hugo

```bash
brew install hugo
hugo version
```

You should see something like: `hugo v0.139.3+extended darwin/amd64`

## Step 3: Extract and Setup Your Blog

```bash
# Navigate to your preferred location (e.g., Documents)
cd ~/Documents

# Extract the downloaded archive
tar -xzf ~/Downloads/harry-blog.tar.gz

# Navigate into the folder
cd harry-blog

# Initialize git
git init

# Add the theme as a submodule
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
git submodule update --init --recursive
```

## Step 4: Customize Your Site

Open `hugo.toml` in your favorite editor:

```bash
# Use TextEdit (opens in GUI)
open -a TextEdit hugo.toml

# Or use nano in terminal
nano hugo.toml

# Or use VS Code if you have it
code hugo.toml
```

**Things to change:**
1. Line 1: `baseURL = 'https://YOUR-GITHUB-USERNAME.github.io/'`
2. Line 10: Your description
3. Line 11: Your name
4. Lines 18-21: Update your bio
5. Lines 23-35: Update your social media links (LinkedIn, GitHub, email)

Save and close the file.

## Step 5: Test Locally

```bash
hugo server -D
```

Open your browser and go to: `http://localhost:1313`

You should see your blog! 🎉

Press `Cmd+C` in Terminal to stop the server when done.

## Step 6: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `YOUR-USERNAME.github.io` (replace with your actual GitHub username)
   - Example: `harrycyber.github.io`
3. Make it **Public**
4. Don't add README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 7: Connect to GitHub

If you haven't set up Git on your Mac yet:

```bash
# Set your name and email (use your GitHub email)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Option A: Using HTTPS (Easier)

```bash
# Make sure you're in the harry-blog directory
cd ~/Documents/harry-blog

git add .
git commit -m "Initial commit - blog setup"
git branch -M main

# Replace YOUR-USERNAME with your GitHub username
git remote add origin https://github.com/YOUR-USERNAME/YOUR-USERNAME.github.io.git
git push -u origin main
```

You'll be prompted for your GitHub credentials. If you have 2FA enabled, you'll need to use a Personal Access Token instead of your password:

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Copy the token and paste it as your password when pushing

### Option B: Using SSH (More Secure)

If you prefer SSH:

```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your.email@example.com"
# Press Enter to accept defaults, optionally set a passphrase

# Start SSH agent
eval "$(ssh-agent -s)"

# Add SSH key to agent
ssh-add ~/.ssh/id_ed25519

# Copy public key to clipboard
pbcopy < ~/.ssh/id_ed25519.pub
```

Then:
1. Go to GitHub.com → Settings → SSH and GPG keys → New SSH key
2. Paste the key (it's already in your clipboard from `pbcopy`)
3. Save

Now push:

```bash
git remote add origin git@github.com:YOUR-USERNAME/YOUR-USERNAME.github.io.git
git push -u origin main
```

## Step 8: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under "Source", select **GitHub Actions**
5. Wait 2-3 minutes for the action to complete

## Step 9: Verify Deployment

1. Go to the **Actions** tab in your repository
2. You should see a workflow running (or completed with a green checkmark)
3. Once complete, visit: `https://YOUR-USERNAME.github.io`

🎉 Your blog is live!

## Step 10: Writing Your First Writeup

```bash
cd ~/Documents/harry-blog

# Create a new writeup
hugo new content/writeups/tryhackme/pickle-rick.md

# Open it in your editor
open -a TextEdit content/writeups/tryhackme/pickle-rick.md
# or
code content/writeups/tryhackme/pickle-rick.md
```

Use the `WRITEUP_TEMPLATE.md` as a guide.

## Step 11: Publishing New Writeups

Every time you write a new writeup:

```bash
cd ~/Documents/harry-blog

# Test locally first
hugo server -D
# Check http://localhost:1313
# Press Cmd+C when done

# Commit and push
git add .
git commit -m "Add Pickle Rick writeup"
git push
```

Your site will automatically rebuild and deploy in ~2 minutes!

## Adding Screenshots to Writeups

```bash
# Create images directory
mkdir -p static/images/tryhackme

# Copy your screenshots there
cp ~/Desktop/screenshot.png static/images/tryhackme/rootme-shell.png
```

Reference in your writeup markdown:
```markdown
![Getting reverse shell](/images/tryhackme/rootme-shell.png)
```

## Mac-Specific Tips

### Quick Edit Workflow

Create an alias in your `~/.zshrc` for faster access:

```bash
echo 'alias blog="cd ~/Documents/harry-blog && hugo server -D"' >> ~/.zshrc
source ~/.zshrc
```

Now you can just type `blog` to start your dev server!

### Using VS Code (Recommended)

If you don't have VS Code:
```bash
brew install --cask visual-studio-code
```

Then:
```bash
cd ~/Documents/harry-blog
code .
```

Install the "Hugo Language and Syntax Support" extension for better markdown editing.

### Screenshot Tool

Mac's built-in screenshot tools work great:
- `Cmd+Shift+3` - Full screen
- `Cmd+Shift+4` - Selection
- `Cmd+Shift+5` - Advanced options

### Preview Markdown

You can preview markdown files in Finder:
- Select the .md file
- Press `Space` for Quick Look

## Cloudflare Setup (Optional)

### For Custom Domain

1. Buy a domain from Namecheap, Google Domains, etc.
2. Add to Cloudflare (free account)
3. Update nameservers at your domain registrar
4. Add DNS records in Cloudflare:
   ```
   Type: CNAME
   Name: @
   Target: YOUR-USERNAME.github.io
   Proxy: ON (orange cloud)
   ```
5. In GitHub: Settings → Pages → Custom domain → Enter your domain
6. Enable "Enforce HTTPS"

### Cloudflare Settings

- SSL/TLS → Full (strict)
- Speed → Auto Minify → Enable all
- Always Use HTTPS → ON

## Quick Reference Commands

```bash
# Start dev server
hugo server -D

# Create new writeup
hugo new content/writeups/tryhackme/ROOMNAME.md

# Commit and push changes
git add .
git commit -m "Your message"
git push

# Update theme
git submodule update --remote --merge
```

## Troubleshooting

### "hugo: command not found"

```bash
brew install hugo
```

### Theme not loading

```bash
git submodule update --init --recursive
```

### Git asks for password repeatedly

Use SSH keys (see Step 7, Option B) or set up credential helper:
```bash
git config --global credential.helper osxkeychain
```

### Port 1313 already in use

```bash
# Kill the process
lsof -ti:1313 | xargs kill -9

# Or use a different port
hugo server -D -p 1314
```

## Next Steps

1. ✅ Customize your About page
2. ✅ Update social links in `hugo.toml`
3. ✅ Write your first writeup
4. ✅ Push to GitHub
5. 🎯 Share your blog URL on LinkedIn!

---

Need help? Check the main README.md or feel free to ask!

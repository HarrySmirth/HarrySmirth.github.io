# Harry's Cybersecurity Blog

A Hugo-based static site for CTF writeups and security research.

## 🚀 Quick Start

### Prerequisites

1. **Install Hugo Extended** (v0.139.3 or later):
   ```bash
   # macOS
   brew install hugo
   
   # Windows (Chocolatey)
   choco install hugo-extended
   
   # Linux
   wget https://github.com/gohugoio/hugo/releases/download/v0.139.3/hugo_extended_0.139.3_Linux-64bit.tar.gz
   tar -xzf hugo_extended_0.139.3_Linux-64bit.tar.gz
   sudo mv hugo /usr/local/bin/
   ```

2. **Install Git**

### Initial Setup

1. **Clone and setup theme**:
   ```bash
   cd harry-blog
   git init
   git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
   git submodule update --init --recursive
   ```

2. **Update configuration**:
   Edit `hugo.toml` and replace:
   - `baseURL` with your GitHub Pages URL
   - Social links (LinkedIn, GitHub, email)
   - Your name and bio in `homeInfoParams`

3. **Test locally**:
   ```bash
   hugo server -D
   ```
   Visit `http://localhost:1313`

## 📝 Writing Writeups

### Create a new writeup:

```bash
hugo new content/writeups/tryhackme/roomname.md
```

### Writeup Template:

```markdown
---
title: "TryHackMe - Room Name"
date: 2026-02-11
draft: false
tags: ["tryhackme", "web", "privesc", "medium"]
categories: ["CTF Writeups"]
summary: "Brief description of the challenge"
---

# Room Name Writeup

## Overview
[Challenge description]

## Reconnaissance
[Your recon steps]

## Exploitation
[How you got initial access]

## Privilege Escalation
[Path to root]

## Key Takeaways
[Lessons learned]
```

### Useful Tags:
- Platforms: `tryhackme`, `hackthebox`
- Difficulty: `easy`, `medium`, `hard`
- Techniques: `web`, `privesc`, `sqli`, `file-upload`, `suid`, `steganography`, `network`, `active-directory`

## 🌐 Deployment to GitHub Pages

### 1. Create GitHub Repository

```bash
# Create new repo on GitHub named: yourusername.github.io
# Then:
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. The workflow will automatically deploy on every push

### 3. Verify Deployment

- Visit `https://yourusername.github.io`
- The GitHub Action runs automatically on each push

## 🔒 Adding Cloudflare

### 1. Add Site to Cloudflare

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Add your custom domain (if you have one) or use a Cloudflare subdomain
3. Update nameservers at your domain registrar

### 2. Configure DNS

**For Custom Domain**:
```
Type: CNAME
Name: @
Target: yourusername.github.io
Proxy: Enabled (orange cloud)
```

**For www subdomain**:
```
Type: CNAME
Name: www
Target: yourusername.github.io
Proxy: Enabled
```

### 3. GitHub Configuration

In your repo settings → Pages → Custom domain, add your domain and enable "Enforce HTTPS"

### 4. Cloudflare Settings (Recommended)

- **SSL/TLS**: Full (strict)
- **Auto Minify**: Enable HTML, CSS, JS
- **Brotli**: Enable
- **Browser Cache TTL**: 4 hours (or higher)
- **Always Use HTTPS**: On

## 📁 Project Structure

```
harry-blog/
├── .github/
│   └── workflows/
│       └── hugo.yml          # Auto-deployment
├── content/
│   ├── about/
│   │   └── index.md          # About page
│   ├── writeups/
│   │   ├── tryhackme/        # THM writeups
│   │   └── hackthebox/       # HTB writeups
│   └── search.md             # Search page
├── themes/
│   └── PaperMod/             # Theme (git submodule)
├── hugo.toml                 # Site configuration
└── README.md
```

## 🛠️ Common Commands

```bash
# Start local dev server
hugo server -D

# Create new writeup
hugo new content/writeups/tryhackme/roomname.md

# Build site
hugo

# Update theme
git submodule update --remote --merge
```

## 📊 Adding New Features

### Google Analytics (Optional)

Add to `hugo.toml`:
```toml
[params]
googleAnalyticsID = "G-XXXXXXXXXX"
```

### Comments (Optional)

The theme supports Giscus, Utterances, and other comment systems. See [PaperMod docs](https://github.com/adityatelange/hugo-PaperMod/wiki/Features).

## 🎨 Customization

Edit `hugo.toml` to customize:
- Site title and description
- Social links
- Menu items
- Theme colors (defaultTheme: "light", "dark", or "auto")
- Enable/disable features

## 📚 Resources

- [Hugo Documentation](https://gohugo.io/documentation/)
- [PaperMod Theme](https://github.com/adityatelange/hugo-PaperMod)
- [Markdown Guide](https://www.markdownguide.org/)

## 📄 License

Content is yours. Theme is MIT licensed.

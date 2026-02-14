---
title: "TryHackMe - Hidden Deep Into my Heart"
date: 2026-02-14
tags: ["tryhackme", "easy", "gobuster", "web", "enumeration", "robots.txt"]
difficulty: "easy"
platform: "TryHackMe"
time_taken: "20 minutes"
draft: false
---

## Overview

Hidden Deep Into my Heart is a Valentine's Day themed easy room centred around web enumeration. The attack chain is short but teaches an important lesson — always read `robots.txt`. A disallowed path leaks a password in a comment, and a second round of directory enumeration inside a hidden directory reveals an admin login panel that hands over the flag.

---

## Reconnaissance

Starting with an Nmap scan to identify open services:

```bash
nmap -sC -sV 10.67.143.25
```

Results:

| Port | Service | Details |
|---|---|---|
| 22/tcp | SSH | OpenSSH 8.9p1 Ubuntu |
| 5000/tcp | HTTP | Werkzeug 3.1.5 / Python 3.10.12 |

The HTTP server is running a Flask/Werkzeug app titled **"Love Letters Anonymous"**. Nmap also flagged a `robots.txt` with one disallowed entry: `/cupids_secret_vault/*`.

---

## Directory Enumeration

Running Gobuster against the root:

```bash
gobuster dir -u http://10.67.143.25:5000/ \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php,txt,html,py \
  -t 100
```

Notable results:

| Endpoint | Status | Notes |
|---|---|---|
| `/robots.txt` | 200 | Contains a disallowed path |
| `/console` | 400 | Werkzeug debugger — restricted |

---

## robots.txt — Password in a Comment

Reading `robots.txt`:

```
User-agent: *
Disallow: /cupids_secret_vault/*
# cupid_arrow_2026!!!
```

The comment at the bottom is a hardcoded password left in plain sight. Credentials to note: `cupid_arrow_2026!!!`

---

## Enumerating the Secret Vault

Visiting `/cupids_secret_vault/` returns a page saying *"You've found the secret vault, but there's more to discover..."* — a clear hint to enumerate further.

Running Gobuster again, this time targeting the vault directory:

```bash
gobuster dir -u http://10.67.143.25:5000/cupids_secret_vault/ \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php,txt,html,py \
  -t 100
```

This revealed:

```
/administrator    (Status: 200)
```

---

## Flag

Navigating to `/cupids_secret_vault/administrator` presented a login form. Using the credentials found in `robots.txt`:

- **Username:** `admin`
- **Password:** `cupid_arrow_2026!!!`

Logging in returned the flag directly.

**Flag:** `THM{REDACTED}`

---

## Key Takeaways

- **Always read `robots.txt`.** It exists to tell search engines what not to index — which means it often points directly at the most interesting parts of a site. In this case it handed over both the hidden path and the password.
- **Enumerate recursively.** The root Gobuster scan didn't find the admin panel — only targeting the subdirectory revealed it. When you find a hidden directory, scan inside it too.
- **Never leave credentials in comments.** A password in a `robots.txt` comment is publicly accessible to anyone who knows to look.

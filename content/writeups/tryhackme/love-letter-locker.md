---
title: "TryHackMe - Love Letter Locker"
date: 2026-02-15
tags: ["tryhackme", "easy", "idor", "web", "flask", "broken-access-control"]
difficulty: "easy"
platform: "TryHackMe"
time_taken: "5 minutes"
draft: false
---

## Overview

Love Letter Locker is a Valentine's Day themed easy-difficulty room featuring a Flask web application for writing and storing love letters. The vulnerability is a textbook Insecure Direct Object Reference (IDOR) — letters are accessed by a sequential integer ID in the URL with no ownership check, allowing any authenticated user to read any other user's letters.

---

## Reconnaissance

Gobuster reveals three key endpoints:

```bash
gobuster dir -u http://10.66.151.88:5000 \
  -w /usr/share/wordlists/dirb/common.txt -t 100
```

| Endpoint | Status |
|---|---|
| `/register` | 200 |
| `/logout` | 302 → `/login` |
| `/letters` | 302 → `/login` |

The app has registration, login, and a letters section that requires authentication.

---

## Enumeration

After registering an account and logging in, the session cookie is a Flask signed session — no JWT manipulation needed here.

Browsing to `/letters` shows your own letters. Creating a new letter via `POST /letters/new` with `title` and `body` fields creates a letter accessible at `/letter/<id>`.

After creating a letter, the app redirects to `/letter/3` — meaning two letters already exist in the database before the test account's first entry.

---

## Exploitation

The letter URL uses a sequential integer ID with no server-side check that the requesting user owns the letter. Simply change the ID to access other users' letters:

```
GET /letter/1 HTTP/1.1
Host: 10.66.151.88:5000
Cookie: session=<YOUR_SESSION>
```

`/letter/1` returns another user's letter containing the flag directly.

**Flag:** `THM{REDACTED}`

---

## Key Takeaways

- **Always verify ownership server-side.** The application checked that the user was authenticated but not that the requested letter belonged to them. Every object access should validate that `letter.owner_id == current_user.id`.
- **Sequential IDs make IDOR trivial.** Using auto-incrementing integers as object identifiers makes enumeration effortless. UUIDs don't fix broken access control, but they do raise the bar significantly by removing the ability to guess valid IDs.
- **IDOR is one of the most common and impactful web vulnerabilities.** It consistently appears in real-world bug bounty programmes and regularly features in the OWASP Top 10 under Broken Access Control. Whenever you see a numeric ID in a URL, always test whether you can access IDs that don't belong to your account.

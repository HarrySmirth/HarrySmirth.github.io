---
title: "TryHackMe - When Hearts Collide"
date: 2026-02-15
tags: ["tryhackme", "medium", "md5", "hash-collision", "cryptography", "web"]
difficulty: "medium"
platform: "TryHackMe"
time_taken: "60 minutes"
draft: false
---

## Overview

When Hearts Collide is a Valentine's Day themed medium-difficulty room featuring "Matchmaker" — a web application that pairs users with dogs by comparing MD5 hashes. The intended vulnerability is an **MD5 collision attack**: generating two different files that share the same MD5 hash, causing the app to declare a match. The room name and brief ("magic modulus dance", "when hearts collide") are all direct hints at MD5 collision.

---

## Reconnaissance

```bash
nmap -sC -sV 10.66.153.252
```

| Port | Service | Details |
|---|---|---|
| 22/tcp | SSH | OpenSSH 9.6p1 Ubuntu |
| 80/tcp | HTTP | nginx |

Gobuster reveals minimal attack surface:

```bash
gobuster dir -u http://10.66.153.252 \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/raft-large-words.txt \
  -t 100
```

| Endpoint | Status |
|---|---|
| `/upload` | 405 (POST only) |
| `/static` | 301 |

---

## Application Analysis

The app allows uploading a photo which gets MD5 hashed and compared against a database of dog images. A successful hash match displays a "match complete" result — and the flag. Uploaded files are stored at `/static/uploads/<uuid>.jpg` regardless of original filename or extension.

Key observations from the source:
- The CSS contains a `.match-flag` class in yellow — used only on a successful match
- The match result page uses `data-match="false"` which becomes `"true"` on success
- Re-uploading an existing file triggers a duplicate detection message, confirming MD5-based deduplication

The example dog image is accessible at:
```
/static/uploads/00795a8b-fb58-47c0-91be-af068ddc71b4.jpg
```

```bash
curl -s "http://10.66.153.252/static/uploads/00795a8b-fb58-47c0-91be-af068ddc71b4.jpg" -o dog.jpg
md5sum dog.jpg
# a15ec1ecaef0eac2d8a9be79d1d51296
```

Re-uploading the same dog image returns a duplicate error — the app detects it by MD5, not filename. Uploading any arbitrary file results in no match since its MD5 doesn't exist in the dog database.

---

## Identifying the Vulnerability

The room name "When Hearts Collide" and the brief's mention of "magic modulus dance" and "completely transparent algorithm" are direct hints at an **MD5 collision attack**.

MD5 is a cryptographically broken hash function. While finding a file that matches a *specific* MD5 hash (a preimage attack) remains computationally infeasible, generating **two different files with the same MD5 hash** (a collision) is achievable in seconds with tools like `fastcoll`.

The attack logic:
1. Generate two different files — `col1.jpg` and `col2.jpg` — that share an identical MD5
2. Upload `col1.jpg` to seed the database with its hash
3. Upload `col2.jpg` — the app computes its MD5, finds a match in the database (col1's entry), and declares a match

---

## Exploitation

### Building fastcoll

`fastcoll` is not available in apt repositories and must be compiled from source:

```bash
sudo apt install libboost-all-dev -y
git clone https://github.com/brimstone/fastcoll.git
cd fastcoll
g++ -O2 -DBOOST_TIMER_ENABLE_DEPRECATED -o fastcoll \
  block0.cpp block1.cpp block1stevens00.cpp block1stevens01.cpp \
  block1stevens10.cpp block1stevens11.cpp block1wang.cpp \
  main.cpp md5.cpp \
  -lboost_filesystem -lboost_program_options
```

The `-DBOOST_TIMER_ENABLE_DEPRECATED` flag is required on modern Boost versions to suppress a breaking deprecation error.

### Generating the Collision

Using the dog image as a prefix produces two files that share the same MD5:

```bash
./fastcoll -p ~/Downloads/dog.jpg \
  -o ~/Downloads/col1.jpg ~/Downloads/col2.jpg

md5sum ~/Downloads/col1.jpg ~/Downloads/col2.jpg
```

Both files will have identical MD5 hashes despite having different content.

### Triggering the Match

Upload `col1.jpg` first to seed the database:

```bash
curl -s -F "file=@col1.jpg" http://10.66.153.252/upload
```

Then upload `col2.jpg`:

```bash
curl -s -F "file=@col2.jpg" http://10.66.153.252/upload
```

Visit the returned `/upload_success/<uuid>` page — the app computes col2's MD5, finds col1's identical hash already in the database, and `data-match` becomes `"true"`, revealing the flag.

**Flag:** `THM{REDACTED}`

---

## Key Takeaways

- **MD5 is cryptographically broken and should not be used for security purposes.** Collision attacks against MD5 have been practical since 2004. Any system that relies on MD5 uniqueness for security can be undermined by generating a collision pair with tools like `fastcoll` in seconds.
- **The room name and brief are always worth analysing carefully.** "When Hearts Collide", "magic modulus dance", and "hash-powered chemistry" were all direct hints pointing to MD5 collision — not preimage attack, not file upload RCE.
- **Duplicate detection via MD5 is not the same as security.** The app correctly identified re-uploads of the same file, but this same MD5 trust is what makes the collision attack possible — two different files with the same hash are treated as identical.
- **Use SHA-256 or better for any integrity or deduplication checks.** No practical collision attacks exist against SHA-256, making it the appropriate modern alternative to MD5.

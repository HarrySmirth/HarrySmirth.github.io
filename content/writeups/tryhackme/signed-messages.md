---
title: "TryHackMe - Signed Messages"
date: 2026-02-14
tags: ["tryhackme", "medium", "rsa", "cryptography", "flask", "web", "gobuster", "python"]
difficulty: "medium"
platform: "TryHackMe"
time_taken: "90 minutes"
draft: false
---

## Overview

Signed Messages is a Valentine's Day themed medium-difficulty room featuring a Flask web application called LoveNote, built around RSA digital signatures. The platform claims no message can be forged and no identity faked — but a publicly accessible debug endpoint leaks the entire key generation process, revealing a critically weak deterministic key derivation scheme. The attack requires reconstructing admin's private key from scratch using the leaked seed pattern, then using it to produce a valid signature to claim the flag.

---

## Reconnaissance

Starting with an Nmap scan:

```bash
nmap -sC -sV 10.67.160.174
```

| Port | Service | Details |
|---|---|---|
| 22/tcp | SSH | OpenSSH 8.9p1 Ubuntu |
| 5000/tcp | HTTP | Werkzeug 2.0.2 / Python 3.10.12 |

The app is titled **LoveNote** — a secure Valentine's Day messaging platform using RSA-2048 digital signatures.

Directory enumeration:

```bash
gobuster dir -u http://10.67.160.174:5000/ \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php,txt,html,js \
  -t 100
```

| Endpoint | Status | Notes |
|---|---|---|
| `/about` | 200 | Platform info and tech stack |
| `/debug` | 200 | **System debug logs — publicly accessible** |
| `/messages` | 200 | Public message board |
| `/verify` | 200 | Signature verification |
| `/compose` | 302 | Requires authentication |
| `/dashboard` | 302 | Requires authentication |

---

## The Debug Endpoint

Visiting `/debug` reveals the entire RSA key generation process in plain text:

```
[2026-02-06 14:23:15] Development mode: ENABLED
[2026-02-06 14:23:15] Using deterministic key generation
[2026-02-06 14:23:15] Seed pattern: {username}_lovenote_2026_valentine

[DEBUG] Seed converted to bytes for cryptographic processing
[DEBUG] Seed hashed using SHA256 to produce large numeric material

[DEBUG] Prime derivation step 1:
[DEBUG] Converting SHA256(seed) into a large integer
[DEBUG] Checking consecutive integers until a valid prime is reached
[DEBUG] Prime p selected

[DEBUG] Prime derivation step 2:
[DEBUG] Modifying seed with PKI-related constant (SHA256(seed + b"pki"))
[DEBUG] Converting hash into a large integer
[DEBUG] Checking consecutive integers until a valid prime is reached
[DEBUG] Prime q selected

[2026-02-06 14:23:16] RSA modulus generated from p x q
[2026-02-06 14:23:16] RSA-2048 key pair successfully constructed
```

This is a critical vulnerability. The key generation is entirely **deterministic** — if you know the username, you can reconstruct their private key from scratch.

---

## Understanding the Key Derivation

The algorithm in plain English:

1. `seed = f"{username}_lovenote_2026_valentine".encode()`
2. `p = nextprime(int(SHA256(seed), 16))`
3. `q = nextprime(int(SHA256(seed + b"pki"), 16))`
4. `n = p * q`
5. Build RSA keypair from p, q, n

i spent so long hashing the seed THEN appending the bytes, bit embarrassing. 
---

## Verifying the Derivation

Before generating admin's key, the derivation was verified against a known account. Registering any account gives you the private key at registration time. Extracting the actual `p` and `q` values from a known key and comparing against our derived values confirmed both derivations were correct:

- **p** — difference of only 385 from the raw SHA256 integer, consistent with `nextprime`
- **q** — exact match using `nextprime(SHA256(seed + b"pki"))` directly

A common pitfall to avoid: writing `nextprime(SHA256(SHA256(seed + b"pki")))` instead of `nextprime(SHA256(seed + b"pki"))`. The debug log mentions "hashing the modified seed" but the modification itself is the hashing step — there is no second hash.

---

## Reconstructing Admin's Private Key

With the derivation confirmed, the full reconstruction script:

```python
import hashlib
import sympy
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric.rsa import (
    RSAPrivateNumbers, RSAPublicNumbers, rsa_crt_iqmp, rsa_crt_dmp1, rsa_crt_dmq1
)
from cryptography.hazmat.backends import default_backend

def derive_prime(seed_bytes):
    hash_int = int(hashlib.sha256(seed_bytes).hexdigest(), 16)
    return int(sympy.nextprime(hash_int))

username = "admin"
seed = f"{username}_lovenote_2026_valentine".encode()

p = derive_prime(seed)
q = derive_prime(seed + b"pki")  # append pki directly, do NOT hash seed first

e = 65537
n = p * q
phi = (p - 1) * (q - 1)
d = pow(e, -1, phi)

private_key = RSAPrivateNumbers(
    p=p, q=q, d=d,
    dmp1=rsa_crt_dmp1(d, p),
    dmq1=rsa_crt_dmq1(d, q),
    iqmp=rsa_crt_iqmp(p, q),
    public_numbers=RSAPublicNumbers(e=e, n=n)
).private_key(default_backend())

# Sign admin's public welcome message
message = "Welcome to LoveNote! Send encrypted love messages this Valentine's Day. Your communications are secured with industry-standard RSA-2048 digital signatures."

sig = private_key.sign(
    message.encode(),
    padding.PSS(
        mgf=padding.MGF1(hashes.SHA256()),
        salt_length=padding.PSS.MAX_LENGTH
    ),
    hashes.SHA256()
)

print(sig.hex())
```

The padding scheme is PSS as listed explicitly in the about page tech stack.

---

## Flag

Submitting to `/verify` with:

- **Sender Username:** `admin`
- **Message Content:** the welcome message text from the public board
- **Digital Signature:** the hex output from the script

The signature verified successfully and the flag was displayed.

**Flag:** `THM{REDACTED}`

---

## Key Takeaways

- **Debug endpoints should never be public.** The `/debug` page single-handedly broke the entire security model of the platform by leaking the key generation algorithm in full detail.
- **Deterministic key generation is catastrophic.** RSA keys must be generated with a cryptographically secure random number generator. Using a predictable seed tied to a username means anyone who can read the algorithm can reconstruct any user's private key.
- **Read the source carefully.** The double-hashing mistake nearly derailed the exploit entirely. The debug log said "hashing the modified seed" which sounds like two hashes but is actually one — precise reading of the algorithm description matters.
- **Use the tech stack hints.** The about page explicitly listed PSS padding scheme, which pointed directly to the correct signing parameters needed to produce a valid signature.

---
title: "TryHackMe - TryHeartMe"
date: 2026-02-15
tags: ["tryhackme", "easy", "jwt", "web", "burpsuite", "idor", "privilege-escalation"]
difficulty: "easy"
platform: "TryHackMe"
time_taken: "30 minutes"
draft: false
---

## Overview

TryHeartMe is a Valentine's Day themed easy-difficulty room featuring a web application with a shop. The vulnerability is a classic JWT privilege escalation — the application trusts a user-controlled role claim inside the token without server-side validation, allowing any registered user to forge an admin token and access restricted items.

---

## Reconnaissance

The target runs a web application with a shop interface. After registering an account and browsing the store, intercepting requests in Burp Suite reveals that the app uses **JSON Web Tokens (JWTs)** for authentication, passed in request headers.

---

## Identifying the Vulnerability

Using the **JWT Editor** Burp Suite extension to inspect the tokens on outgoing requests, the decoded payload reveals a role claim:

```json
{
    "email": "john@doe.com",
    "role": "user",
    "credits": 0,
    "iat": 1771164892,
    "theme": "valentine"
}
```

The presence of a `role` claim controlled entirely within the token is an immediate red flag. If the server trusts this value without independent verification, simply changing `"user"` to `"admin"` should escalate privileges.

Browsing to `/product/valenflag` returns a **404** with a standard user token — the item is hidden from non-admin users entirely.

---

## Exploitation

### Step 1 — Forge an Admin Token

In Burp Suite, intercept a request to `/product/valenflag` and open it in the JWT Editor tab. Edit the payload, changing the role claim:

```json
{
    "email": "john@doe.com",
    "role": "admin",
    "credits": 0,
    "iat": 1771164892,
    "theme": "valentine"
}
```

Since the app does not validate the JWT signature server-side, the forged token is accepted. The `/product/valenflag` item is now visible instead of returning 404 — confirming the role check is performed solely on the client-supplied JWT claim.

### Step 2 — Buy the Item

With the product now visible, click **Buy**. Burp Suite intercepts the purchase request — apply the same JWT modification, changing `role` to `admin` again, and forward the request.

The flag is returned in the response.

**Flag:** `THM{REDACTED}`

---

## Key Takeaways

- **Never trust claims inside a JWT for authorisation decisions.** The role a user holds should be looked up server-side from the database on each request, not read from the token payload. JWTs should only be trusted for *identity* (who you are), not *authorisation* (what you're allowed to do).
- **JWT signature validation must be enforced.** If the server had properly validated the token signature, a forged token with a modified payload would have been rejected. Accepting unsigned or tampered tokens is a critical misconfiguration.
- **JWT Editor is an essential Burp extension.** It makes inspecting, modifying, and re-signing JWT tokens trivial — a must-have for any web application assessment.
- **Hidden endpoints aren't protected endpoints.** Returning 404 for non-admin users gives a false sense of security — the route still exists and responds to requests with sufficient privileges.

# DNS runbook — hillsidenewyork.com

Snapshot taken 2026-07-05, while DNS was still hosted on Name.com's
nameservers (registered via Replit's reseller arrangement). If the domain
is transferred to a new registrar, Name.com stops serving this zone —
**recreate every record below at the new DNS host immediately after the
transfer completes**, then make the GitHub Pages changes at the bottom.

## Current zone (must survive the move — email depends on it)

| Type  | Host            | Value |
|-------|-----------------|-------|
| MX    | @               | `1 smtp.google.com.` (Google Workspace — events@) |
| MX    | @               | `10 mx.sendgrid.net.` |
| TXT   | @               | `v=spf1 include:sendgrid.net ~all` |
| TXT   | @               | `google-site-verification=57uCfkJcmvDoGd1p4NSBsgX0RxTFtfd1hMXClElbGx0` |
| TXT   | _dmarc          | `v=DMARC1; p=none; rua=mailto:events@hillsidenewyork.com` |
| CNAME | s1._domainkey   | `s1.domainkey.u55043354.wl105.sendgrid.net.` (SendGrid DKIM) |
| CNAME | s2._domainkey   | `s2.domainkey.u55043354.wl105.sendgrid.net.` (SendGrid DKIM) |
| CNAME | 55043354        | `sendgrid.net.` |

Dropped on purpose: `A @ → 34.111.179.208` (dead Replit hosting),
`TXT replit-verify=…`, and the stray root TXT entries that just repeat
hostnames — none are needed after leaving Replit.

## New records — point the domain at GitHub Pages

| Type  | Host | Value |
|-------|------|-------|
| A     | @    | `185.199.108.153` |
| A     | @    | `185.199.109.153` |
| A     | @    | `185.199.110.153` |
| A     | @    | `185.199.111.153` |
| CNAME | www  | `ryandavis23.github.io.` |

Then: repo → Settings → Pages → custom domain `hillsidenewyork.com`
(adds the CNAME file), wait for the certificate, tick Enforce HTTPS,
and update canonical/OG URLs in the HTML.

## darkstarnews.com (same situation, Ryan's email domain)

| Type | Host | Value |
|------|------|-------|
| MX   | @    | `1 smtp.google.com.` (Google Workspace — ryan@) |
| TXT  | @    | `google-site-verification=qnAn5qlbdLVDy3TdDrwNzSC-gbjSlkExAYxpiaBM3a0` |

Its A record also points at the dead Replit IP; nothing web-facing
depends on it today.

## Transfer notes

- Both domains registered Aug 2025 → past ICANN's 60-day lock.
- Cloudflare Registrar requires switching nameservers to Cloudflare
  *before* transferring — impossible without a working DNS panel. Use a
  registrar that accepts unlock + EPP directly (Porkbun, Namecheap),
  or regain panel access first.
- Transfers add one year to the registration and take up to 5–7 days.
- DNS keeps resolving from the old nameservers during the transfer;
  the risk window is *after* completion, until the zone is recreated.

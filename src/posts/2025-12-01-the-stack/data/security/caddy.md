---
name: Caddy
status: Recommended
link: https://caddyserver.com/
why: Automatic TLS, simple Caddyfile, HTTP/3
---

Remember certbot? Remember setting up cron jobs to renew certificates? Remember that one time the renewal failed silently and your site went down on a Saturday?

Caddy remembers. Caddy made it so you never have to again.

Automatic HTTPS isn't a feature in Caddy. It's the default. Point a domain at your server, write a two-line Caddyfile, and watch TLS certificates materialize from Let's Encrypt like magic. Renewals happen automatically. OCSP stapling happens automatically. Even localhost gets TLS with a self-managed CA that installs into your local trust store.

The defaults pass PCI, HIPAA, and NIST compliance. No configuration required. HTTP/3 works out of the box. On-demand TLS handles customer domains without you lifting a finger. Caddy even invented Encrypted ClientHello support before anyone else, because apparently preventing metadata leakage wasn't challenging enough.

The Caddyfile syntax is so simple it almost feels like cheating. Reverse proxy? One line. Static files? One line. Load balancing? Still basically one line. For everyone traumatized by nginx configuration, Caddy is the therapy that actually works.

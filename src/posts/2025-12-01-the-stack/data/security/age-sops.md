---
name: age + SOPS
status: Recommended
link: https://github.com/getsops/sops
why: Encrypt in git, decrypt at deploy, auditable
---

The first rule of secrets management is: don't commit secrets to git. The second rule is: everyone eventually commits secrets to git anyway.

SOPS and age make the inevitable safe. SOPS encrypts the values in your YAML, JSON, or ENV files while leaving the keys readable. This means your git diffs still make sense. You can see that someone changed the database password without seeing what they changed it to. Auditors love this. Security teams love this. Your future self debugging at 3 AM loves this.

Age handles the actual encryption with the simplicity that PGP never achieved. Small keys, no configuration files, no web of trust ceremonies. Just public keys and private keys that do exactly what you expect.

The combination integrates beautifully with GitOps workflows. Commit encrypted secrets alongside your Terraform, decrypt them at deploy time with Flux or ArgoCD, never store plaintext credentials in your CI/CD system. It's infrastructure as code without the "wait, where are the actual passwords?" panic.

Now a CNCF Sandbox project with active maintainers, SOPS has graduated from "clever hack" to "industry standard." Use it.

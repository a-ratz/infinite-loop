---
name: Fly.io
status: Recommended
link: https://fly.io/
why: Real servers when needed, great DX
---

Sometimes you need a real computer, not a lambda function with a 30-second existential crisis. Fly.io is for those times.

Give them a Dockerfile (or don't, their CLI generates one for most frameworks). They'll pack it into a Firecracker microVM that boots in 300 milliseconds and deploy it to whichever of their global regions you fancy. Multi-region Postgres? They've got it. GPU instances for AI workloads? Those too. Object storage via Tigris? Sure, why not.

The magic trick is turning Docker's promise of "it works on my machine" into "it works on machines near your users, plural." One command: `fly deploy`. Your container image lands on edge nodes worldwide with built-in load balancing and autoscaling that doesn't require a PhD in YAML archaeology.

At roughly $16 a month for simple architectures, it sits in that sweet spot between "too cheap to worry about" and "actually capable of real work." For when serverless is too ephemeral and Kubernetes is too much ceremony, Fly.io is the Goldilocks zone of deployment.

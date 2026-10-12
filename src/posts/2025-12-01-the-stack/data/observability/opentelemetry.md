---
name: OpenTelemetry
status: Established
link: https://opentelemetry.io/
why: Vendor-neutral, auto-instrumentation, trace propagation
---

Once upon a time, every observability vendor had their own agent, their own SDK, their own data format. Switching vendors meant rewriting instrumentation. Adding a second vendor meant running two agents. It was a mess that benefited precisely nobody except vendor sales teams.

OpenTelemetry ended that nonsense.

As the second-largest CNCF project by contributors, OTel has become the de facto standard for generating telemetry data. Traces, metrics, logs, and now continuous profiling. All three pillars reached stability in 2023, meaning you can instrument once and ship to anywhere. Jaeger today, Datadog tomorrow, self-hosted next quarter. Your code doesn't care.

Auto-instrumentation means most frameworks light up with zero code changes. Trace propagation means a request that touches fifteen microservices shows up as one coherent story. The collector can transform, filter, and route data before it hits your backend, so you're not paying to store noise.

You own your telemetry data. No vendor lock-in. One set of APIs. The observability wars are over, and open standards won.

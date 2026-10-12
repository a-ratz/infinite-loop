---
name: VictoriaMetrics
status: Recommended
link: https://victoriametrics.com/
why: Lower resources, PromQL compatible, clustering
---

Prometheus is wonderful until you have a lot of data. Then it becomes a wonderful problem.

VictoriaMetrics solves the problem by being aggressively efficient. We're talking 10x less RAM than InfluxDB, 7x less storage than Prometheus, and the ability to handle millions of samples per second without breaking a sweat. It's what happens when performance engineers get annoyed at watching metrics systems consume more resources than the systems they're monitoring.

The beauty is in the compatibility. Drop it in as a Prometheus remote storage backend or replace Prometheus entirely. Your Grafana dashboards keep working. Your PromQL queries keep working (actually, MetricsQL extends PromQL with useful additions). Your alerting rules keep working. The only thing that changes is your infrastructure bill going down and your retention period going up.

Built-in anomaly detection, clustering for high availability, and years of retention without performance degradation. For teams that outgrew Prometheus but don't want to outgrow their budget, VictoriaMetrics is the upgrade that actually feels like simplification.

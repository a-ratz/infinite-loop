---
name: libSQL (Turso)
status: Recommended
link: https://turso.tech
why: Edge replication, embedded replicas, SQLite compatibility
---

SQLite looked at the edge computing revolution and said "not my problem." So Turso forked it and made libSQL, which treats replication across hundreds of global locations as a first-class feature rather than an afterthought. Your database can now live next to your users, wherever they are. Embedded replicas mean zero-latency reads by putting a copy directly in your application. Still file-based, still embeddable, still speaks SQLite. But now it syncs. The best part? They're rewriting the whole thing in Rust (because of course they are) with native vector search built in. SQLite for the agentic future, apparently.

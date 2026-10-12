---
name: pgvector
status: Recommended
link: https://github.com/pgvector/pgvector
why: Single database, ACID with vectors, familiar SQL
---

Adding a specialized vector database to your stack is like hiring a second accountant because your first one refuses to count past a billion. PostgreSQL already knows your data. It already has your trust. It already handles your transactions with the reliability of a Swiss watch made by paranoid perfectionists.

pgvector simply teaches your existing database a new trick: storing and searching high-dimensional vectors. Semantic search, embeddings, recommendation systems - all without spinning up Yet Another Database that needs its own backups, its own monitoring, and its own 3 AM wake-up calls.

The real magic? Your vectors get to participate in the same ACID transactions as everything else. Update a product description and its embedding atomically. Join vector similarity results with your regular tables. Use the same connection pool, the same ORM, the same deployment pipeline you already have.

Pinecone and friends have their place when you're searching billions of vectors at millisecond latencies. But for most applications? pgvector means one database to rule them all, and in the simplicity, bind them.

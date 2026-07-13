---
title: Elasticsearch
slug: elasticsearch
summary: Interview-focused guide to Elasticsearch architecture, inverted indexes, mappings, query execution, relevance, aggregations, sharding, lifecycle management, vector search, failure handling, and capacity planning.
tags:
  - database
  - search
  - distributed-systems
  - elasticsearch
difficulty: intermediate
---

# Elasticsearch

Elasticsearch is a distributed search and analytics engine built on Apache Lucene. It is designed for workloads that need:

- Full-text search.
- Relevance ranking.
- Structured filtering.
- Faceted navigation.
- Log and event exploration.
- Near-real-time indexing and search.
- Geospatial search.
- Aggregations over indexed documents.
- Vector and hybrid retrieval.
- Horizontal scaling through shards and replicas.

> **One-line interview definition:** Elasticsearch is a distributed document-oriented search engine that converts documents into Lucene indexes and distributes those indexes as shards across a cluster for near-real-time search, ranking and aggregation.

Elasticsearch is not a general replacement for PostgreSQL, Cassandra, Redis, Kafka or ClickHouse. It performs best when the primary requirement is:

```text
find the most relevant documents
using text, filters, scoring, facets or vectors
```

rather than:

```text
execute transactional row updates
maintain relational constraints
or scan every historical row for large OLAP aggregations
```

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch at a glance
What to use: A high-level architecture showing applications, logs, databases and Kafka feeding an Elasticsearch cluster, with search APIs, dashboards and analysts reading from it.
Preferred source: Elastic official "What is Elasticsearch?", architecture and search documentation.
Search terms: site:elastic.co/docs Elasticsearch architecture search analytics diagram
Purpose: Establish Elasticsearch as the search and retrieval layer between data producers and search consumers.
Alt text: Applications and data pipelines index documents into Elasticsearch, which serves search, dashboards and analytical queries.
Editorial note: Verify the image licence before publishing. Prefer an official Elastic image. If no clear reusable official image exists, create an original Excalidraw diagram based on the official documentation.
-->

# 1. Why Elasticsearch Exists

A relational database can search exact values efficiently using B-tree or hash indexes:

```sql
SELECT *
FROM products
WHERE product_id = 123;
```

Full-text search is different:

```text
wireless mechanical keyboard
```

The system may need to:

- Tokenize the text.
- Normalize case.
- Remove or preserve stop words.
- Stem related words.
- Handle synonyms.
- Match terms across fields.
- Rank results by relevance.
- Highlight matching text.
- Apply filters.
- Return facets.
- Correct misspellings.
- Combine lexical and vector similarity.

Scanning every document and evaluating the query at request time is too expensive. Elasticsearch indexes document content ahead of time into specialized Lucene structures.

## 2. Search vs Database Lookup

### Database lookup

```text
Input: exact key or predicate
Output: rows that satisfy the predicate
Ordering: often explicit and deterministic
```

### Search

```text
Input: words, phrases, filters or a vector
Output: the most relevant documents
Ordering: relevance score, business score or explicit sort
```

Example:

```text
Query: "cheap phone with good camera"
```

Search may match:

```text
"Affordable smartphone with excellent photography"
```

even though the exact words differ.

## 3. Near-Real-Time Search

Elasticsearch is near real time rather than immediately searchable after every write.

A successfully indexed document normally becomes visible to search after a refresh. The default refresh behavior is designed to balance:

- Indexing throughput.
- Segment creation.
- Search freshness.

A point GET by document ID can have different visibility behavior from a search request because it can use the transaction log and current shard state.

Define freshness explicitly:

```text
A newly indexed product must appear in search within 2 seconds.
```

Do not merely say:

```text
Elasticsearch is real time.
```

<!-- IMAGE PLACEHOLDER
Title: Exact lookup vs full-text search
What to use: A comparison showing a database B-tree lookup by exact key and an Elasticsearch query using analyzed terms and relevance ranking.
Preferred source: Create an original diagram based on Elastic query DSL and text-analysis documentation.
Search terms: Elasticsearch exact lookup vs full text inverted index
Purpose: Explain why search needs different indexes and execution semantics from OLTP databases.
Alt text: A database retrieves exact keys while Elasticsearch analyzes text and ranks matching documents by relevance.
Editorial note: Prefer an original diagram because this comparison spans multiple concepts.
-->

<!-- IMAGE PLACEHOLDER
Title: Near-real-time visibility timeline
What to use: A timeline showing index acknowledgement, translog/buffer state, refresh, new Lucene segment, and search visibility.
Preferred source: Elastic official near-real-time search and refresh documentation.
Search terms: site:elastic.co/docs Elasticsearch near real time refresh segment diagram
Purpose: Clarify that successful indexing and search visibility are separate moments.
Alt text: An indexed document becomes searchable after Elasticsearch refreshes the shard and opens a new Lucene segment.
Editorial note: Verify current refresh semantics for the deployed Elasticsearch version.
-->

# When to Use Elasticsearch

## 4. Good Use Cases

Elasticsearch is a good fit when most of the following are true:

- Full-text search is central.
- Relevance ranking is required.
- Users combine text with structured filters.
- Facets and aggregations are required alongside search.
- Documents are denormalized for retrieval.
- Search results must be returned in tens or hundreds of milliseconds.
- New data must become searchable quickly.
- The index can be rebuilt from a source database or event stream.
- Horizontal search scaling is required.
- Typo tolerance, synonyms, highlighting or autocomplete are useful.
- Geospatial or vector retrieval is required.

Typical use cases:

- E-commerce product search.
- Website and document search.
- Log exploration.
- Security-event investigation.
- Social-post search.
- Job search.
- Restaurant or local-business search.
- Support-ticket search.
- Application observability.
- Autocomplete and suggestions.
- Semantic search and retrieval-augmented generation.

## 5. When Not to Use Elasticsearch

Avoid Elasticsearch as the primary database when the workload mainly requires:

- Multi-row ACID transactions.
- Foreign-key constraints.
- Strict uniqueness guarantees.
- High-frequency in-place updates to many documents.
- Exact financial balances.
- Durable queue semantics.
- Distributed locks.
- Simple key-value access only.
- Long analytical scans where relevance is irrelevant.
- A dataset and query volume that PostgreSQL can handle comfortably.

Examples:

| Requirement | Better starting choice |
|---|---|
| Order and inventory transaction | PostgreSQL |
| Session cache or rate limiter | Redis |
| Durable event stream and replay | Kafka |
| Key-partition event serving | Cassandra |
| Large columnar aggregation | ClickHouse or a warehouse |
| Full-text and relevance search | Elasticsearch |
| Financial ledger | Transactional relational database |

## 6. Elasticsearch as Primary Store vs Search Projection

### Search projection

The common architecture is:

```text
PostgreSQL / MongoDB / source service
              |
              v
          CDC or events
              |
              v
        Elasticsearch index
```

Advantages:

- Source database owns correctness.
- Search index can be rebuilt.
- Elasticsearch schema can be optimized for retrieval.
- Search outages do not necessarily block writes.

Trade-offs:

- Search is eventually consistent with the source.
- Deletes and updates must propagate.
- Reindexing requires operational planning.

### Elasticsearch as the only copy

Possible for selected search-native workloads, but requires:

- Replicas.
- Snapshots.
- Restore testing.
- Strict mapping control.
- Retry and version handling.
- Acceptance of Elasticsearch's transaction model.

For HLD interviews, default to:

```text
transactional database = source of truth
Elasticsearch = denormalized search index
```

unless the problem clearly allows Elasticsearch to be authoritative.

<!-- IMAGE PLACEHOLDER
Title: Search projection architecture
What to use: PostgreSQL or MongoDB as source of truth, CDC/Kafka pipeline, Elasticsearch index, and search API.
Preferred source: Elastic official CDC, connectors and ingestion documentation.
Search terms: site:elastic.co/docs Elasticsearch CDC Kafka source of truth architecture
Purpose: Show the most common production role of Elasticsearch.
Alt text: Transactional data is copied through events into a denormalized Elasticsearch search projection.
Editorial note: Use an original diagram if no single official image covers the whole pattern.
-->

# Cluster Architecture

## 7. Cluster, Node, Index, Shard and Replica

- **Cluster:** A group of Elasticsearch nodes sharing cluster state.
- **Node:** One Elasticsearch process with selected roles.
- **Index:** A logical collection of documents with compatible mappings and settings.
- **Document:** A JSON object indexed as one search unit.
- **Primary shard:** The authoritative active copy for a shard's writes.
- **Replica shard:** A copy of a primary shard used for availability and reads.
- **Lucene index:** Each Elasticsearch shard is internally a Lucene index.
- **Segment:** Immutable Lucene search structure inside a shard.

Conceptually:

```text
Elasticsearch index
    |
    +-- Primary shard 0
    +-- Primary shard 1
    +-- Primary shard 2
```

With one replica:

```text
Shard 0: primary + replica
Shard 1: primary + replica
Shard 2: primary + replica
```

## 8. Why an Index Is Split into Shards

One Lucene index on one machine has finite:

- Disk capacity.
- CPU.
- Memory.
- Search throughput.
- Indexing throughput.

Elasticsearch partitions an index into primary shards so work and data can be distributed.

Shards provide:

- Horizontal storage scaling.
- Parallel search.
- Parallel indexing.
- Replica-level availability.

A shard is not free. Every shard consumes:

- Heap metadata.
- File handles.
- cluster-state entries.
- Segment metadata.
- Background merge work.
- Search coordination.

## 9. Coordinating Node

Every node can coordinate requests unless configured otherwise.

For search, the coordinating node:

1. Resolves indices and shards.
2. Selects one active copy of each shard.
3. Sends shard-level search requests.
4. Receives top candidates or aggregation states.
5. Merges results.
6. Fetches final documents where required.
7. Returns the response.

For indexing, the coordinating node:

1. Calculates routing.
2. Finds the primary shard.
3. Forwards the operation.
4. Returns the primary/replica outcome.

Coordinating-only nodes can isolate heavy scatter-gather work, but they must be sized for CPU, heap and network.

## 10. Cluster State

Cluster state contains metadata such as:

- Node membership.
- Index definitions.
- Mappings.
- Settings.
- Shard routing and allocation.
- Templates.
- Aliases.

The elected master node publishes cluster-state updates.

Large or rapidly changing cluster state can cause:

- Slow publications.
- Mapping update delays.
- Master instability.
- Allocation delays.

## 11. Master-Eligible Nodes

Master-eligible nodes participate in elections and cluster-state decisions.

The elected master handles:

- Cluster membership changes.
- Index creation and deletion.
- Mapping changes.
- Shard allocation decisions.
- Cluster-state publication.

It does not centrally execute every search or index operation.

For a production cluster, use multiple master-eligible nodes across independent failure domains. Three dedicated master-eligible nodes are a common starting topology for larger clusters.

## 12. Node Roles

Depending on deployment and version, roles can include:

- Master eligible.
- Voting only.
- Data.
- Data content.
- Data hot.
- Data warm.
- Data cold.
- Data frozen.
- Ingest.
- Machine learning.
- Transform.
- Remote-cluster client.
- Coordinating only through an empty role set.

Do not assign roles based only on labels. Size them for their workload.

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch cluster with shards and replicas
What to use: Three nodes containing primary and replica shards distributed so no replica is on the same node as its primary.
Preferred source: Elastic official shards, replicas and cluster architecture documentation.
Search terms: site:elastic.co/docs Elasticsearch primary replica shards cluster diagram
Purpose: Introduce the basic unit of Elasticsearch distribution and high availability.
Alt text: Primary and replica shards are distributed across Elasticsearch nodes for scale and availability.
Editorial note: Prefer an official Elastic diagram or redraw it in the website's style.
-->

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch node roles
What to use: A cluster with dedicated master-eligible nodes, hot data nodes, ingest nodes and coordinating nodes, with arrows showing responsibilities.
Preferred source: Elastic official node roles documentation.
Search terms: site:elastic.co/docs Elasticsearch node roles master data ingest coordinating diagram
Purpose: Show that not every node performs the same production responsibility.
Alt text: Elasticsearch node roles separate cluster coordination, data storage, ingest processing and request coordination.
Editorial note: Role names and recommendations are version-sensitive.
-->

<!-- IMAGE PLACEHOLDER
Title: Cluster-state publication
What to use: Elected master publishes a mapping or shard-allocation change to follower nodes, which acknowledge the new cluster-state version.
Preferred source: Elastic official cluster-state and discovery documentation.
Search terms: site:elastic.co/docs Elasticsearch cluster state publication elected master
Purpose: Explain why mapping explosion and excessive index creation affect cluster control-plane stability.
Alt text: The elected master publishes each cluster-state update to all Elasticsearch nodes.
Editorial note: Create an original diagram if official visuals are too implementation-specific.
-->

# Documents and Mappings

## 13. Document Model

Elasticsearch stores JSON documents.

Example:

```json
{
  "product_id": 123,
  "name": "Wireless Mechanical Keyboard",
  "description": "Low-profile Bluetooth keyboard",
  "brand": "KeyWorks",
  "category": "keyboards",
  "price": 7999,
  "in_stock": true,
  "tags": ["wireless", "mechanical", "bluetooth"]
}
```

A document should normally contain the data required to:

- Search it.
- Rank it.
- Filter it.
- Display the result card.
- Aggregate over it.

This often means denormalizing data that would be split across relational tables.

## 14. Mapping

A mapping defines how document fields are indexed.

It controls:

- Field data type.
- Text analyzer.
- Whether a field is searchable.
- Whether a field is aggregatable or sortable.
- Multi-fields.
- Object and nested semantics.
- Vector dimensions.
- Date formats.
- Dynamic mapping behavior.

Example:

```json
PUT products
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "product_id": { "type": "long" },
      "name": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "brand": { "type": "keyword" },
      "price": { "type": "scaled_float", "scaling_factor": 100 },
      "in_stock": { "type": "boolean" },
      "created_at": { "type": "date" }
    }
  }
}
```

Mapping choices are hard to change in place. Many changes require creating a new index and reindexing.

## 15. `text` vs `keyword`

### `text`

Use for full-text search.

The value is analyzed into tokens.

```text
"Wireless Mechanical Keyboard"
```

may become:

```text
wireless
mechanical
keyboard
```

Use for:

- Product name.
- Description.
- Article body.
- Log message.

### `keyword`

Use for exact values.

The complete value is indexed as one term.

Use for:

- Status.
- Country code.
- Brand.
- User ID.
- Category.
- Sorting.
- Aggregation.
- Exact filtering.

Do not use analyzed `text` fields for normal terms aggregation or sorting.

## 16. Multi-Fields

One source value can have multiple indexed representations.

```json
"name": {
  "type": "text",
  "fields": {
    "keyword": { "type": "keyword" },
    "autocomplete": {
      "type": "text",
      "analyzer": "autocomplete_analyzer"
    }
  }
}
```

Queries can use:

```text
name              -> full-text relevance
name.keyword      -> exact filter/sort/aggregation
name.autocomplete -> prefix-oriented analysis
```

Multi-fields increase index size and indexing work. Add them for real query patterns.

## 17. Numeric, Date and Boolean Fields

Use native types instead of strings:

```text
integer / long
float / double
scaled_float
date
boolean
ip
geo_point
```

Benefits:

- Correct range behavior.
- Compact indexes.
- Numeric sorting.
- Aggregations.
- Type validation.

For exact currency values, use an integer minor unit or `scaled_float` with a deliberate scaling factor.

## 18. `_source`

`_source` stores the original or reconstructed JSON document representation used for:

- Returning search hits.
- Reindexing.
- Updates.
- Debugging.
- Recovery workflows.

Search structures such as the inverted index and doc values do not replace `_source` as the normal returned document.

Large `_source` values increase:

- Disk usage.
- Fetch latency.
- Network response size.
- Reindex cost.

Use source filtering to return only required fields:

```json
"_source": ["product_id", "name", "price"]
```

Disabling or heavily pruning `_source` can limit update, reindex and debugging capabilities. Verify current synthetic-source and source-mode options for the deployed product and version.

## 19. Stored Fields

Selected fields can be explicitly stored in Lucene and retrieved without returning full `_source`.

This is less common than source filtering. Use only when benchmarks justify the additional storage and mapping complexity.

## 20. Doc Values

Doc values are column-oriented on-disk structures used for:

- Sorting.
- Aggregations.
- Scripting.
- Selected field retrieval.

They are normally enabled for keyword, numeric, date, boolean and related field types.

Conceptually:

```text
Inverted index:
term -> matching documents

Doc values:
document -> field value
```

A terms query uses the inverted index. A terms aggregation commonly reads doc values.

## 21. Fielddata

Analyzed text fields do not normally have doc values.

Enabling fielddata loads analyzed terms into heap-oriented structures for sorting or aggregation and can consume large memory.

Prefer:

```text
text field for search
keyword multi-field for sorting/aggregation
```

rather than enabling fielddata on text.

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch document and mapping
What to use: A JSON product document connected to mapping definitions for text, keyword, numeric, date and boolean fields.
Preferred source: Elastic official mapping and field-data-type documentation.
Search terms: site:elastic.co/docs Elasticsearch mapping document field types diagram
Purpose: Show that the same JSON source is transformed into different search structures based on mapping.
Alt text: An Elasticsearch mapping assigns search and aggregation behavior to each field in a JSON document.
Editorial note: Create an original diagram to match the guide's schema example.
-->

<!-- IMAGE PLACEHOLDER
Title: Text vs keyword
What to use: One string analyzed into multiple lowercase tokens for a text field and preserved as one exact term for a keyword field.
Preferred source: Elastic official text, keyword and analysis documentation.
Search terms: site:elastic.co/docs Elasticsearch text keyword analyzer diagram
Purpose: Explain the most important mapping distinction.
Alt text: A text field is tokenized for full-text search while a keyword field preserves the complete value for exact operations.
Editorial note: Prefer an original side-by-side diagram.
-->

<!-- IMAGE PLACEHOLDER
Title: Inverted index vs doc values
What to use: Side-by-side structures showing term-to-document postings and document-to-value column storage.
Preferred source: Elastic official doc-values and inverted-index documentation.
Search terms: site:elastic.co/docs Elasticsearch inverted index doc values diagram
Purpose: Explain why search and aggregation use different physical structures.
Alt text: The inverted index maps terms to documents, while doc values store field values by document for sorting and aggregation.
Editorial note: Redraw if the official documentation uses separate visuals.
-->

# Object, Nested and Relational Modelling

## 22. Object Fields

A normal JSON object is flattened internally.

Example:

```json
{
  "authors": [
    { "name": "A", "country": "IN" },
    { "name": "B", "country": "US" }
  ]
}
```

As a normal object array, field values are conceptually indexed as:

```text
authors.name    = [A, B]
authors.country = [IN, US]
```

The relationship between each name and country is not preserved.

A query for:

```text
name = A AND country = US
```

can match even though no one author has both values.

## 23. Nested Fields

The `nested` type indexes each nested object as a hidden Lucene document while preserving its relationship to the root document.

Use when:

- Arrays contain independent objects.
- Predicates must match within the same object.
- Nested aggregations are required.

Trade-offs:

- More Lucene documents.
- More complex queries.
- Higher indexing and search cost.
- Limits on nested fields and objects.
- Updating one nested item reindexes the root document and nested documents.

Do not use nested automatically for every object.

## 24. Flattened Fields

The `flattened` type indexes an entire flexible object as one field with keyword-like values.

Useful for:

- Arbitrary labels.
- Metadata bags.
- Unknown keys.
- Preventing mapping explosion.

Limitations:

- Values are treated with keyword-style semantics.
- Less rich typed querying.
- No normal numeric range semantics for arbitrary values.
- Not a replacement for explicitly mapped important fields.

Pattern:

```text
important dimensions -> dedicated typed fields
rare dynamic metadata -> flattened field
```

## 25. Parent-Child Join

The `join` field supports parent-child relationships within one index and shard-routing domain.

Use only when:

- Child cardinality is much larger than parent cardinality.
- Duplicating parent data is prohibitively expensive.
- Updates to parent data are frequent enough to justify the join cost.

Costs:

- `has_child` and `has_parent` queries are expensive.
- Global ordinals may be built.
- Parent and child must route to the same shard.
- Operations and mapping become more complex.

Elastic's general guidance is to denormalize rather than model relational joins.

## 26. Denormalization

Product search may duplicate:

```text
brand name
category name
seller rating
availability summary
```

inside the product document.

Advantages:

- One document contains the complete search result.
- No query-time joins.
- Faster ranking and filtering.

Trade-offs:

- Source updates require reindexing affected documents.
- Duplicated data consumes disk.
- Propagation is eventually consistent.

## 27. Arrays

Elasticsearch fields are naturally multi-valued.

```json
"tags": ["wireless", "mechanical"]
```

No separate array type is normally required.

All values must be compatible with the field mapping.

<!-- IMAGE PLACEHOLDER
Title: Object flattening problem
What to use: Two author objects flattened into separate name and country arrays, causing a false cross-object match.
Preferred source: Elastic official nested-field documentation.
Search terms: site:elastic.co/docs Elasticsearch nested object flatten array diagram
Purpose: Explain why arrays of objects sometimes require nested mapping.
Alt text: Normal object arrays lose per-object relationships when Elasticsearch flattens their subfields.
Editorial note: The official nested documentation often contains a suitable example; redraw in the site's visual style if necessary.
-->

<!-- IMAGE PLACEHOLDER
Title: Nested document representation
What to use: One root product document plus several hidden nested reseller documents stored in the same Lucene block.
Preferred source: Elastic official nested type and nested query documentation.
Search terms: site:elastic.co/docs Elasticsearch nested hidden Lucene documents diagram
Purpose: Show the storage cost and preserved object boundaries of nested fields.
Alt text: Elasticsearch stores nested objects as hidden Lucene documents associated with one root document.
Editorial note: Include both query correctness and document multiplication.
-->

<!-- IMAGE PLACEHOLDER
Title: Object vs nested vs flattened vs join
What to use: A decision table or flowchart comparing normal objects, nested objects, flattened metadata and parent-child relationships.
Preferred source: Elastic official mapping field-type documentation.
Search terms: site:elastic.co/docs Elasticsearch object nested flattened join comparison
Purpose: Provide a reusable schema-modelling decision framework.
Alt text: Different Elasticsearch field models trade query correctness, flexibility, storage and performance.
Editorial note: Create an original comparison diagram.
-->

# Dynamic Mapping and Templates

## 28. Dynamic Mapping

Dynamic mapping can infer fields when documents arrive.

Convenient for exploration, but risky in production.

Problems:

- Wrong inferred type.
- Accidental new fields.
- Mapping explosion.
- Inconsistent schemas across time-based indices.
- Unsearchable historic data after mapping correction.

Examples:

```text
"123" inferred as text instead of long
first date value not recognized as date
user-provided JSON keys become thousands of fields
```

## 29. Mapping Explosion

Mapping explosion occurs when an index accumulates too many fields.

Causes:

- Arbitrary user keys.
- Dynamic JSON attributes.
- One field per metric label.
- Flattening external payloads without control.

Effects:

- Larger cluster state.
- Higher heap usage.
- Slower mapping updates.
- More expensive queries and field capabilities.
- Master-node pressure.

Mitigations:

- `dynamic: strict`.
- `dynamic: false`.
- Dynamic templates.
- `flattened` fields.
- Application schema validation.
- Mapping limits.
- Separate indices for fundamentally different schemas.

## 30. Dynamic Templates

Dynamic templates map fields by:

- Name.
- Path.
- Detected type.

Example concept:

```text
fields ending in _id -> keyword
fields under labels.* -> keyword or flattened
strings under message.* -> text
```

Templates must be tested with representative documents.

## 31. Index Templates

Index templates provide mappings, settings and aliases for matching new indices or data streams.

Use for:

- Time-series backing indices.
- Logs.
- Tenant index families.
- Consistent analyzers.
- Shard and replica settings.
- Lifecycle configuration.

Composable templates can combine reusable component templates.

## 32. Runtime Fields

Runtime fields compute values at query time rather than fully indexing them.

Useful for:

- Rapid experimentation.
- Derived values.
- Querying data before reindexing.
- Infrequently used fields.

Trade-off:

```text
less indexing/storage work
but more query CPU
```

Promote frequently queried runtime fields to indexed fields.

<!-- IMAGE PLACEHOLDER
Title: Mapping explosion
What to use: User-defined JSON keys creating thousands of mapped fields, expanding cluster state and heap, contrasted with a flattened metadata field.
Preferred source: Elastic official mapping-limit and flattened-field documentation.
Search terms: site:elastic.co/docs Elasticsearch mapping explosion flattened diagram
Purpose: Show why uncontrolled dynamic mapping is a cluster-level risk.
Alt text: Arbitrary dynamic fields expand Elasticsearch mappings, while flattened metadata contains the field count.
Editorial note: Create an original causal diagram.
-->

<!-- IMAGE PLACEHOLDER
Title: Composable index templates
What to use: Several component templates for mappings, settings and aliases combined into one index template that creates new backing indices.
Preferred source: Elastic official index-template documentation.
Search terms: site:elastic.co/docs Elasticsearch composable index templates component diagram
Purpose: Explain repeatable schema creation for rolling indices and data streams.
Alt text: Elasticsearch combines reusable component templates into an index template for newly created indices.
Editorial note: Verify current template precedence rules before publishing implementation-specific labels.
-->

# Text Analysis and the Inverted Index

## 33. Analysis Pipeline

A text analyzer contains:

```text
character filters
    -> tokenizer
    -> token filters
```

Example input:

```text
"Wireless-Keyboards & Accessories"
```

Possible output:

```text
wireless
keyboard
accessory
```

The analyzer used at index time and search time must be compatible.

## 34. Character Filters

Character filters transform the raw text before tokenization.

Use for:

- Removing HTML.
- Mapping special characters.
- Normalizing known patterns.

Character filters can affect token offsets used for highlighting.

## 35. Tokenizer

A tokenizer splits the character stream into tokens.

Examples:

- Standard tokenizer.
- Keyword tokenizer.
- Whitespace tokenizer.
- Pattern tokenizer.
- Edge n-gram tokenizer.

Tokenizer selection shapes the searchable vocabulary.

## 36. Token Filters

Token filters transform or add tokens.

Examples:

- Lowercase.
- Stop words.
- Stemmer.
- Synonyms.
- ASCII folding.
- Edge n-grams.
- Shingles.

Order matters.

Example:

```text
lowercase before case-sensitive synonym matching
```

may behave differently from another order.

## 37. Index Analyzer vs Search Analyzer

Autocomplete often uses:

```text
index analyzer  -> edge n-grams
search analyzer -> normal full token
```

Indexing:

```text
keyboard -> k, ke, key, keyb, keybo, ...
```

Searching:

```text
keyb -> keyb
```

Using n-grams on both sides may create excessive query tokens and irrelevant matches.

## 38. Inverted Index

The inverted index maps terms to documents.

Documents:

```text
D1: wireless keyboard
D2: mechanical keyboard
D3: wireless mouse
```

Inverted index:

```text
wireless   -> D1, D3
keyboard   -> D1, D2
mechanical -> D2
mouse      -> D3
```

Postings can include:

- Document ID.
- Term frequency.
- Position.
- Character offsets.
- Payload information.

These support relevance scoring, phrase queries and highlighting.

## 39. Term Dictionary

Lucene maintains an efficient term dictionary so it can locate the postings list for a term without scanning every term.

Prefix, wildcard and fuzzy queries may enumerate multiple terms from this dictionary. Broad patterns can become expensive.

## 40. Positions and Phrase Search

Phrase query:

```text
"mechanical keyboard"
```

requires term positions to determine whether tokens occur in the required order and distance.

If positions are disabled in field index options, phrase behavior is limited.

## 41. Norms

Norms store per-document field information used by scoring, including field-length normalization.

They consume storage.

Disable norms on fields used only for filtering and not relevance, when appropriate.

## 42. BKD Trees

Numeric, date, IP and geospatial fields use point-oriented index structures such as BKD trees for efficient range and spatial queries.

This is different from token postings used by text fields.

## 43. Term Vectors

Term vectors can store per-document term details such as:

- Terms.
- Frequencies.
- Positions.
- Offsets.

They can support advanced highlighting or analysis but increase index size.

Enable only for a clear requirement.

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch analysis pipeline
What to use: Raw text passing through character filters, a tokenizer and token filters, ending as normalized tokens.
Preferred source: Elastic official text-analysis documentation.
Search terms: site:elastic.co/docs Elasticsearch analyzer character filter tokenizer token filter diagram
Purpose: Explain how source strings become index terms.
Alt text: Elasticsearch transforms text through character filters, tokenization and token filters before indexing terms.
Editorial note: Include one concrete product-name example.
-->

<!-- IMAGE PLACEHOLDER
Title: Inverted index construction
What to use: Three documents tokenized into terms and a resulting term-to-document postings table.
Preferred source: Elastic official inverted-index or text-search documentation.
Search terms: site:elastic.co/docs Elasticsearch inverted index postings diagram
Purpose: Provide the central mental model for lexical search.
Alt text: Elasticsearch stores each analyzed term with a postings list of documents containing it.
Editorial note: An original diagram using the guide's three-document example is preferred.
-->

<!-- IMAGE PLACEHOLDER
Title: Postings with positions and frequencies
What to use: A postings list showing document IDs, term frequencies and token positions, with a phrase query using positions.
Preferred source: Elastic/Lucene official scoring and index-option documentation.
Search terms: Lucene postings positions term frequency Elasticsearch phrase query
Purpose: Explain how one inverted index supports ranking and phrase matching.
Alt text: Lucene postings record term occurrence details used for scoring and phrase queries.
Editorial note: Use official Lucene concepts without copying implementation-specific binary layouts.
-->

<!-- IMAGE PLACEHOLDER
Title: Text index vs BKD numeric index
What to use: Text terms stored in postings compared with numeric values arranged in a multidimensional point tree for range pruning.
Preferred source: Elastic official numeric-field and Lucene BKD documentation.
Search terms: Elasticsearch BKD tree numeric range inverted index diagram
Purpose: Show that not every field type uses the same underlying index.
Alt text: Text search uses an inverted index while numeric and geospatial ranges use point-tree structures.
Editorial note: Create an original conceptual diagram.
-->

# Synonyms, Stemming and Languages

## 44. Stemming

Stemming reduces related words to a common form.

Example:

```text
connect
connected
connecting
```

may share a stem.

Benefits:

- Higher recall.

Risks:

- Over-stemming.
- Incorrect domain matches.
- Language-specific errors.

Use language analyzers or domain-tested stemmers.

## 45. Synonyms

Synonyms can expand or normalize query terms.

Example:

```text
laptop, notebook computer
```

Approaches:

### Index-time synonyms

Advantages:

- Faster query execution.

Trade-offs:

- Larger index.
- Synonym changes require reindexing.
- Document-frequency effects can be surprising.

### Search-time synonyms

Advantages:

- Rules can evolve without full reindexing in supported configurations.
- Original indexed terms remain stable.

Trade-offs:

- More query clauses.
- Analysis and phrase behavior require care.

Search-time synonyms are often the better starting point.

## 46. Stop Words

Removing common words can reduce index/query noise, but modern relevance scoring often handles them adequately.

Removing stop words can damage:

- Phrase queries.
- Product names.
- Titles.
- Natural-language questions.

Do not remove them automatically without evaluation.

## 47. Diacritics and ASCII Folding

ASCII folding can make:

```text
café
```

match:

```text
cafe
```

Preserving both original and folded tokens can support exact and normalized matching.

## 48. Language-Specific Fields

For multilingual search, options include:

- One field per language.
- Language-specific indices.
- Detected-language routing.
- A general multilingual analyzer.
- Language-aware semantic vectors.

One analyzer rarely handles every language well.

<!-- IMAGE PLACEHOLDER
Title: Index-time vs search-time synonyms
What to use: Side-by-side pipelines showing synonym expansion while indexing versus expanding the user query at search time.
Preferred source: Elastic official synonym and analysis documentation.
Search terms: site:elastic.co/docs Elasticsearch index time search time synonyms diagram
Purpose: Explain operational and index-size trade-offs.
Alt text: Synonyms can be expanded into every indexed document or applied dynamically to search queries.
Editorial note: Verify current synonyms-set APIs and reload behavior for the target version.
-->

# Indexing and Write Path

## 49. Document Routing

A document is assigned to one primary shard using a routing value.

Default routing is based on `_id`.

Conceptually:

```text
shard = hash(routing) mod number_of_primary_shards
```

Custom routing can use a business key such as:

```text
tenant_id
user_id
account_id
```

Benefits:

- Related documents live on one shard.
- Queries with the same routing value can target fewer shards.

Risks:

- Uneven tenants create hot or oversized shards.
- Every read/update/delete must provide compatible routing.
- Routing design is difficult to change.

## 50. Single-Document Indexing Flow

High-level write path:

1. Client sends an index request to any node.
2. The coordinating node calculates the target primary shard.
3. It forwards the operation to the node holding the primary.
4. The primary validates and applies the operation.
5. The primary forwards the operation to active replica copies.
6. Replica operations complete according to acknowledgement semantics.
7. The coordinating node returns the response.

## 51. Primary Shard

The primary orders operations for its replication group and assigns sequence information.

It performs:

- Mapping validation.
- Version or optimistic-concurrency checks.
- Lucene indexing-buffer update.
- Translog append.
- Replica forwarding.

## 52. Transaction Log

The translog records operations that have not necessarily been included in a durable Lucene commit.

It supports:

- Crash recovery.
- Replica recovery.
- Real-time GET behavior.

Translog durability settings trade:

- Fsync cost.
- Indexing latency.
- Potential acknowledged-write loss during severe failure.

Use default durable behavior unless the business explicitly accepts a larger loss window.

## 53. Indexing Buffer

New documents are first represented in in-memory indexing structures.

They are not immediately part of a searchable segment.

A refresh writes buffered changes into a new segment and opens it for search.

## 54. Refresh

Refresh:

- Creates new searchable segments from buffered changes.
- Makes operations visible to search.
- Does not necessarily perform a full durable Lucene commit.

Frequent refreshes:

- Improve freshness.
- Create more small segments.
- Reduce indexing throughput.
- Increase merge work.

For bulk loading, temporarily using a longer refresh interval can improve throughput.

## 55. Flush

Flush creates a Lucene commit and starts a new translog generation.

It is heavier and less frequent than refresh.

Do not confuse:

```text
refresh -> searchable
flush   -> durable Lucene commit boundary and translog generation management
```

## 56. Segments

Lucene segments are immutable.

An update is implemented conceptually as:

```text
mark old document deleted
index new document version
```

A delete marks a document as deleted. Physical bytes are reclaimed during segment merge.

## 57. Segment Merge

Background merges combine smaller segments into larger segments.

Merges:

- Remove deleted documents physically.
- Improve search efficiency.
- Consume CPU and disk I/O.
- Temporarily require additional disk space.

Excessive small segments increase:

- Search fan-out inside each shard.
- File handles.
- Heap metadata.
- Merge pressure.

## 58. Update API

The update API performs a read-modify-index workflow on the primary shard.

It does not modify part of a Lucene document in place.

Updating one field still creates a new document version internally.

Frequent updates to large documents are expensive.

## 59. Optimistic Concurrency

Sequence number and primary term can prevent lost updates.

Pattern:

```text
read _seq_no and _primary_term
send update with if_seq_no and if_primary_term
reject if document changed
```

Use for compare-and-set behavior.

## 60. External Versioning

External systems can supply versions in selected workflows, but version semantics must be chosen carefully.

For CDC, sequence numbers or source versions should ensure older events cannot overwrite newer state.

## 61. Write Acknowledgement and Active Shards

`wait_for_active_shards` controls how many shard copies must be active before the operation proceeds.

It does not by itself mean every active replica has durably fsynced the operation under every possible failure model.

Understand separately:

- Precondition for active shard copies.
- Primary execution.
- Replica acknowledgement.
- Translog durability.
- Search refresh visibility.

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch document routing
What to use: Document ID or custom tenant routing hashed to one primary shard among several shards.
Preferred source: Elastic official routing and shard documentation.
Search terms: site:elastic.co/docs Elasticsearch document routing shard hash diagram
Purpose: Explain why every document belongs to exactly one primary shard.
Alt text: Elasticsearch hashes a routing value to choose the document's primary shard.
Editorial note: Include a warning about skewed custom routing.
-->

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch write path
What to use: Client → coordinating node → primary shard → replica shards, with validation, translog and indexing buffer inside each shard copy.
Preferred source: Elastic official indexing, replication and sequence-number documentation.
Search terms: site:elastic.co/docs Elasticsearch write path primary replica translog diagram
Purpose: Show the complete distributed write lifecycle.
Alt text: An Elasticsearch primary shard applies an indexed document and forwards it to replica shards before acknowledgement.
Editorial note: Create an original diagram if official pages explain the steps separately.
-->

<!-- IMAGE PLACEHOLDER
Title: Refresh vs flush vs merge
What to use: Three separate timelines showing refresh opening a segment, flush creating a Lucene commit and resetting translog generation, and merge combining immutable segments.
Preferred source: Elastic official near-real-time, translog and merge documentation.
Search terms: site:elastic.co/docs Elasticsearch refresh flush merge difference diagram
Purpose: Prevent the three storage operations from being confused.
Alt text: Refresh makes data searchable, flush creates a durable commit boundary, and merge consolidates immutable segments.
Editorial note: This should be an original comparison graphic.
-->

<!-- IMAGE PLACEHOLDER
Title: Update and delete lifecycle
What to use: Old Lucene document marked deleted, new version indexed in another segment, and later merge reclaiming old bytes.
Preferred source: Elastic official update, delete and segment-merge documentation.
Search terms: Elasticsearch update delete immutable segment merge diagram
Purpose: Explain why high update rates create merge and disk overhead.
Alt text: Elasticsearch updates create a new document version and reclaim the old version during a later segment merge.
Editorial note: Keep logical document version separate from physical segment entries.
-->

# Bulk Indexing

## 62. Bulk API

The Bulk API groups many index, create, update or delete operations into fewer network requests.

Benefits:

- Fewer round trips.
- Better indexing throughput.
- Larger efficient indexing batches.
- Less per-request coordination overhead.

A bulk request is not one atomic transaction.

Each item has its own result.

The client must inspect every item for:

- Success.
- Mapping failure.
- Version conflict.
- Rejection.
- Routing error.
- Transient failure.

## 63. Bulk Size

There is no universal best row or byte count.

Benchmark increasing batch sizes until throughput stops improving or latency/memory becomes unsafe.

Common concerns:

- Request byte size.
- Client memory.
- Coordinating-node heap.
- Shards touched.
- Concurrent bulk requests.
- Retry granularity.

Prefer moderate batches and bounded concurrency over one enormous request.

## 64. Backpressure

When Elasticsearch is overloaded, thread pools can reject operations.

Clients should:

- Use bounded in-flight requests.
- Retry only rejected/transient items.
- Apply exponential backoff with jitter.
- Preserve idempotency.
- Avoid immediate whole-batch retry storms.

## 65. Indexing Throughput Tuning

Potential levers:

- Bulk requests.
- Concurrent workers.
- Longer refresh interval.
- Fewer replicas during a controlled initial load.
- Faster disks.
- Simpler analyzers.
- Fewer indexed fields.
- Disable indexing/doc values for unused fields.
- Avoid expensive ingest processors.
- Avoid update-heavy workflows.

After bulk load:

- Restore replicas.
- Restore refresh behavior.
- Wait for recovery.
- Validate document count.

## 66. Auto-Generated IDs

When clients allow Elasticsearch to generate document IDs, Elasticsearch may avoid some existence-check work compared with arbitrary client IDs in append-only ingestion.

Use business IDs when update, overwrite or idempotency semantics require them.

## 67. Indexing Hotspots

Hotspots occur when:

- Custom routing sends most writes to one shard.
- One time-series write index has too few primaries.
- Update requests target one popular document.
- Parent-child routing concentrates data.
- One node holds more active primaries.

Monitor indexing rate and CPU by shard and node.

<!-- IMAGE PLACEHOLDER
Title: Bulk indexing with per-item results
What to use: One bulk request containing multiple operations routed to several primary shards, with a response containing mixed success and failure items.
Preferred source: Elastic official Bulk API documentation.
Search terms: site:elastic.co/docs Elasticsearch bulk API per item response diagram
Purpose: Explain throughput and partial failure semantics.
Alt text: Elasticsearch processes each bulk item independently and returns an individual status for every operation.
Editorial note: Create an original diagram with successful, rejected and mapping-error items.
-->

<!-- IMAGE PLACEHOLDER
Title: Indexing backpressure
What to use: Producers → bounded bulk queue → Elasticsearch write thread pools, with rejection and exponential-backoff loop.
Preferred source: Elastic official indexing-speed and thread-pool documentation.
Search terms: site:elastic.co/docs Elasticsearch bulk rejection backpressure exponential backoff
Purpose: Show safe overload handling.
Alt text: Clients limit concurrent bulk requests and back off when Elasticsearch rejects overloaded indexing operations.
Editorial note: Create an original operational diagram.
-->

# Search and Read Path

## 68. Scatter-Gather Search

A search request may target one or many shards.

High-level flow:

1. Client sends a request to a coordinating node.
2. The coordinator resolves indices, aliases and routing.
3. It selects one active copy of each relevant shard.
4. It sends the query to those shard copies.
5. Each shard searches its local Lucene segments.
6. Each shard returns top candidate document IDs, scores, sort values or aggregation states.
7. The coordinator merges shard results.
8. It fetches source fields for the final hits.
9. It returns the response.

Search latency is affected by the slowest participating shard.

## 69. Query Phase

During the query phase, each shard:

- Rewrites the query where needed.
- Applies term, range, vector and filter structures.
- Computes local scores.
- Collects top `from + size` candidates or search-after candidates.
- Builds partial aggregation states.

The coordinator merges local top results into a global top result.

## 70. Fetch Phase

After global candidates are selected, the coordinator asks owning shards for:

- `_source`.
- Stored fields.
- Highlights.
- Script fields.
- Inner hits.

Large source documents or highlights can make fetch more expensive than query matching.

## 71. One Shard Copy per Search

For each shard ID, a search normally uses either:

- The primary.
- One replica.

Replicas can increase search throughput because different requests can be distributed among copies.

They do not make one query use both copies of the same shard for the same search phase by default.

## 72. Adaptive Replica Selection

Elasticsearch can prefer shard copies based on factors such as:

- Prior response time.
- Search queue size.
- Node load.

This reduces the probability of selecting a slow replica.

## 73. Query Then Fetch

The normal distributed search type computes term statistics locally per shard.

If shards have skewed term distributions or very small test datasets, relevance scores can differ from globally calculated statistics.

## 74. DFS Query Then Fetch

`dfs_query_then_fetch` performs an additional distributed term-statistics phase before the normal query.

Benefits:

- More globally consistent relevance statistics.

Costs:

- Extra round trip.
- Higher latency.
- More cluster work.

Rarely needed for large well-distributed production indices.

## 75. Search Routing

If documents use custom routing, providing the same routing value on search can target only relevant shards.

Example:

```text
all documents for tenant 123 route by tenant_id
search with routing=123
```

This reduces scatter-gather cost.

## 76. Preference

The `preference` parameter can provide stable shard-copy selection for a user/session or select local/particular shard behavior.

Stable preference can improve cache reuse and pagination consistency, but can create uneven load if poorly distributed.

## 77. Real-Time GET

A GET by `_id` is real time by default and can retrieve a recent operation from the translog/current shard state even before refresh.

A search depends on refreshed segments.

This explains:

```text
GET finds document
SEARCH does not find it yet
```

## 78. Multi-Get

`_mget` retrieves multiple known document IDs in one request.

This reduces round trips but still routes each ID to its shard.

For massive key-value workloads, determine whether Elasticsearch is the appropriate store.

<!-- IMAGE PLACEHOLDER
Title: Distributed search query-then-fetch
What to use: Coordinating node sends query to multiple shard copies, receives local top hits, merges them, and fetches final source documents.
Preferred source: Elastic official search-shard-routing and distributed-search documentation.
Search terms: site:elastic.co/docs Elasticsearch query then fetch search path diagram
Purpose: Explain the two-phase distributed search algorithm.
Alt text: Elasticsearch shards return local top candidates before the coordinator fetches the globally selected documents.
Editorial note: This is a core diagram and should include query and fetch as clearly separated phases.
-->

<!-- IMAGE PLACEHOLDER
Title: Search tail latency from the slowest shard
What to use: Several shards responding quickly and one slow shard delaying the coordinating node's final response.
Preferred source: Create an original diagram based on Elastic distributed-search behavior.
Search terms: Elasticsearch slowest shard search latency scatter gather
Purpose: Explain why oversharding and one unhealthy node affect p99 latency.
Alt text: A distributed Elasticsearch search completes only after the slowest required shard response arrives.
Editorial note: Include an optional timeout or partial-result path only if clearly labelled.
-->

<!-- IMAGE PLACEHOLDER
Title: Real-time GET vs near-real-time search
What to use: A recent document available through translog-aware GET before refresh, while search sees it only after the new segment opens.
Preferred source: Elastic official GET and refresh documentation.
Search terms: site:elastic.co/docs Elasticsearch real time GET search refresh
Purpose: Explain a commonly surprising visibility difference.
Alt text: Elasticsearch GET can retrieve a new document before it is visible to search after refresh.
Editorial note: Create an original timeline diagram.
-->

# Pagination

## 79. `from` and `size`

Basic pagination:

```json
{
  "from": 0,
  "size": 20
}
```

For distributed deep pages, every shard may need to collect:

```text
from + size
```

candidates.

Example:

```text
from = 100,000
size = 20
20 shards
```

Each shard may collect a very large candidate set before the coordinator discards nearly all of it.

This consumes:

- Heap.
- CPU.
- Network.
- Coordinator work.

## 80. `search_after`

`search_after` uses the sort values from the last hit as the cursor for the next page.

Example sort:

```json
"sort": [
  { "created_at": "desc" },
  { "_id": "asc" }
]
```

Next request includes the prior final hit's sort tuple.

Requirements:

- Stable deterministic sort.
- Unique tie-breaker.
- Client retains cursor.
- No random page jump.

## 81. Point in Time

A point-in-time handle preserves a consistent logical view across paginated searches while the underlying index continues to change.

Use with `search_after` for user-facing deep traversal or export.

PIT consumes resources by keeping underlying search contexts/segments available.

Close or expire it promptly.

## 82. Scroll

Scroll is intended for processing large result sets, reindexing or batch export rather than interactive user pagination.

It holds a search context and returns batches.

For modern deep pagination, PIT plus `search_after` is generally preferred for many use cases.

## 83. `track_total_hits`

Computing an exact total hit count can be expensive.

Options:

- Track exact total.
- Track up to a threshold.
- Disable total tracking.

Search UIs often need:

```text
10,000+
```

rather than the exact count of millions of results.

<!-- IMAGE PLACEHOLDER
Title: Deep pagination cost
What to use: Multiple shards each collecting `from + size` candidates for a deep page, with the coordinator discarding most candidates.
Preferred source: Elastic official pagination documentation.
Search terms: site:elastic.co/docs Elasticsearch deep pagination from size diagram
Purpose: Explain why offset pagination does not scale in distributed search.
Alt text: Deep offset pagination forces every Elasticsearch shard to retain many candidates that are later discarded.
Editorial note: Include a numeric example.
-->

<!-- IMAGE PLACEHOLDER
Title: PIT plus search_after
What to use: A stable point-in-time snapshot and a sequence of pages using the previous page's sort tuple as a cursor.
Preferred source: Elastic official paginate-search-results documentation.
Search terms: site:elastic.co/docs Elasticsearch PIT search_after diagram
Purpose: Show the recommended deep-pagination model.
Alt text: Elasticsearch uses a point in time and sort-value cursors to paginate consistently without deep offsets.
Editorial note: Create an original step-by-step diagram.
-->

# Query DSL

## 84. Query Context vs Filter Context

### Query context

Answers:

```text
How well does this document match?
```

It computes `_score`.

Examples:

- `match`.
- `multi_match`.
- `query_string`.
- `function_score`.

### Filter context

Answers:

```text
Does this document match?
```

It does not contribute normal relevance score.

Examples:

- Exact status.
- Price range.
- Tenant ID.
- Availability.
- Date range.

Filters can be more cache-friendly and should be used for binary conditions.

## 85. Boolean Query

The `bool` query combines:

- `must`: match and contribute score.
- `should`: optional or required relevance clauses.
- `filter`: binary conditions without score.
- `must_not`: exclusion.

Example:

```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "wireless keyboard" } }
      ],
      "filter": [
        { "term": { "in_stock": true } },
        { "range": { "price": { "lte": 10000 } } }
      ],
      "must_not": [
        { "term": { "status": "DISCONTINUED" } }
      ]
    }
  }
}
```

## 86. `term` vs `match`

### `term`

Uses the supplied exact term without normal full-text analysis.

Use on:

- Keyword.
- Numeric.
- Boolean.
- IDs.
- Exact normalized terms.

### `match`

Analyzes the query text with the field's search analyzer.

Use on:

- Text fields.
- Natural-language input.

Common mistake:

```text
term query on analyzed text using original mixed-case phrase
```

## 87. `multi_match`

Searches across multiple text fields.

Example:

```json
{
  "multi_match": {
    "query": "wireless keyboard",
    "fields": ["name^4", "brand^2", "description"]
  }
}
```

Field boosts express importance.

Modes such as best-fields, most-fields and cross-fields behave differently. Choose based on how content is distributed across fields.

## 88. Phrase Queries

`match_phrase` requires analyzed terms to occur in order, within optional slop.

Use for:

- Names.
- Titles.
- Quoted user queries.

Phrase queries rely on positions and are more selective than simple conjunction.

## 89. Range Query

Use on date, numeric and selected keyword fields.

```json
{
  "range": {
    "created_at": {
      "gte": "now-7d/d",
      "lt": "now"
    }
  }
}
```

## 90. Exists Query

Checks whether an indexed value exists.

A field can be absent from indexed structures because of:

- Missing source value.
- Null.
- Mapping options.
- Ignored malformed/oversized values.

Understand field semantics before equating exists with source JSON presence.

## 91. Prefix Query

Matches terms starting with a prefix.

Broad prefix queries can enumerate many terms.

For search-as-you-type, prefer purpose-built analyzers or field types rather than arbitrary prefix queries over huge vocabularies.

## 92. Wildcard Query

Wildcard patterns can be expensive, especially leading wildcards:

```text
*board
```

because many terms may need enumeration.

Options:

- Use normalized keyword fields.
- Use n-grams for required substring search.
- Use the wildcard field type for applicable machine-generated strings.
- Restrict query length and complexity.

## 93. Fuzzy Query

Fuzzy matching uses edit distance to match misspellings.

Example:

```text
keybord -> keyboard
```

Costs grow with:

- Large edit distance.
- Short terms.
- Large vocabulary.
- Many expansions.

Use conservative fuzziness and prefix length.

## 94. Nested Query

A nested query executes against nested hidden documents and returns matching root documents.

It must specify the nested path.

Nested aggregations are also required to aggregate nested fields correctly.

## 95. Function Score

`function_score` combines text relevance with business signals such as:

- Popularity.
- Freshness.
- Seller quality.
- Geographic distance.
- Inventory.

Avoid allowing one unbounded business feature to overwhelm textual relevance.

Normalize and evaluate scoring functions offline.

## 96. Rescoring

Rescore applies a more expensive ranking query to a small top window rather than every matching document.

Use for:

- Phrase reranking.
- Learning-to-rank models.
- Expensive semantic reranking.

Pattern:

```text
cheap first-stage retrieval
-> expensive top-N reranking
```

## 97. `minimum_should_match`

Controls how many optional clauses must match.

Useful for longer queries where matching one common word is insufficient.

<!-- IMAGE PLACEHOLDER
Title: Query context vs filter context
What to use: Relevance clauses producing scores and structured filters producing true/false decisions, combined in a bool query.
Preferred source: Elastic official query/filter context and bool-query documentation.
Search terms: site:elastic.co/docs Elasticsearch query context filter context diagram
Purpose: Teach correct query DSL composition.
Alt text: Elasticsearch query clauses calculate relevance while filter clauses restrict results without scoring.
Editorial note: Use a product search example.
-->

<!-- IMAGE PLACEHOLDER
Title: Term vs match query
What to use: A term query sent directly to the index and a match query passing through the search analyzer before term lookup.
Preferred source: Elastic official term and match query documentation.
Search terms: site:elastic.co/docs Elasticsearch term vs match query analyzer diagram
Purpose: Prevent one of the most common query mistakes.
Alt text: A term query searches an exact indexed term while a match query analyzes natural-language input first.
Editorial note: Include keyword and text field examples.
-->

<!-- IMAGE PLACEHOLDER
Title: Two-stage retrieval and rescore
What to use: Broad BM25 retrieval selecting top 1,000 candidates, followed by phrase/model reranking of the top 100.
Preferred source: Elastic official rescore and ranking documentation.
Search terms: site:elastic.co/docs Elasticsearch rescore two stage ranking diagram
Purpose: Explain how expensive relevance logic can be bounded.
Alt text: Elasticsearch first retrieves candidates cheaply and applies expensive reranking only to a small top window.
Editorial note: Create an original diagram.
-->

# Relevance Scoring

## 98. BM25

BM25 is the default lexical relevance model for many text fields.

It broadly considers:

- Term frequency in the document.
- Inverse document frequency across the shard/index statistics used by the query.
- Field length normalization.
- Tunable saturation and length parameters.

Intuition:

```text
rare query term > common query term
more occurrences help, but with diminishing returns
short focused field can score higher than a long noisy field
```

Do not optimize relevance by guessing from one result. Build an evaluation set.

## 99. Term Frequency

A term appearing more often in a document can increase relevance, but BM25 saturates the benefit.

Ten occurrences are not treated as ten times more useful than one occurrence.

## 100. Inverse Document Frequency

A rare term is usually more informative than a common term.

Example:

```text
"keyboard" appears in 1,000,000 documents
"ortholinear" appears in 2,000 documents
```

A match on `ortholinear` contributes more discrimination.

## 101. Field-Length Normalization

A term in a short title may be more important than the same term buried in a long description.

This is one reason title fields are often boosted.

## 102. Field Boosting

Example:

```text
name^5
brand^2
description
```

Boost based on measured user intent.

Excessive boosts can produce brittle relevance.

## 103. Business Ranking

Search products may combine:

```text
lexical relevance
× availability
× seller quality
× popularity
× freshness
× personalization
```

Do not replace relevance completely with popularity; otherwise popular but irrelevant items dominate.

Use:

- Saturation.
- Logarithms.
- Rank features.
- Decay functions.
- Rescoring.
- Learning-to-rank or model-based reranking where justified.

## 104. Relevance Evaluation

Create judged queries:

```text
query
expected relevant products
importance grade
```

Measure:

- Precision@K.
- Recall@K.
- MRR.
- NDCG.
- Click-through rate.
- Conversion.
- Reformulation rate.
- Zero-result rate.

Online behavioral metrics can be biased. Combine offline judgments and controlled experiments.

## 105. Explain API

The Explain API shows how one document's score was calculated.

Useful for debugging, not for production use on every result.

## 106. Profile API

The Profile API breaks down query and aggregation execution.

It adds overhead and should be used for diagnosis, not normal user traffic.

<!-- IMAGE PLACEHOLDER
Title: BM25 relevance intuition
What to use: Three factors—term rarity, term frequency saturation and field length—feeding a final relevance score.
Preferred source: Elastic official similarity/BM25 documentation.
Search terms: site:elastic.co/docs Elasticsearch BM25 term frequency IDF field length diagram
Purpose: Explain default lexical ranking without requiring the full formula.
Alt text: BM25 ranks documents using term rarity, diminishing term-frequency gains and field-length normalization.
Editorial note: An original conceptual diagram is preferred.
-->

<!-- IMAGE PLACEHOLDER
Title: Search ranking stack
What to use: Lexical/vector relevance followed by business features, personalization and top-N reranking.
Preferred source: Elastic official function-score, rank-feature, rescore and hybrid-search documentation.
Search terms: site:elastic.co/docs Elasticsearch relevance business ranking rescore diagram
Purpose: Show that retrieval and business ranking are separate layers.
Alt text: Elasticsearch combines retrieval relevance with bounded business signals and optional reranking.
Editorial note: Create an original architecture diagram.
-->

<!-- IMAGE PLACEHOLDER
Title: Relevance evaluation loop
What to use: Judged query set → offline metrics → ranking change → A/B test → click/conversion feedback → updated judgments.
Preferred source: Elastic relevance-tuning and search-quality documentation.
Search terms: site:elastic.co/docs Elasticsearch relevance evaluation rank eval
Purpose: Encourage measurement-driven relevance tuning.
Alt text: Search teams evaluate ranking changes offline and online before deploying them broadly.
Editorial note: Include Rank Evaluation API only if appropriate to the current version.
-->

# Aggregations

## 107. Aggregation Model

Aggregations summarize matching documents.

Main categories:

- **Metric:** sum, average, min, max, cardinality, percentiles.
- **Bucket:** terms, date histogram, range, filters, geospatial.
- **Pipeline:** calculations over other aggregation results.
- **Matrix:** multi-field statistical operations in selected cases.

Example:

```text
Search wireless keyboard
Filter in-stock products
Bucket by brand
Calculate average price per brand
```

## 108. Distributed Aggregation

Each shard computes a partial result.

The coordinating node merges shard-level states.

Some aggregations are exact and easy to combine:

```text
sum
min
max
```

Others need approximation or over-fetching:

```text
terms top buckets
cardinality
percentiles
```

## 109. Terms Aggregation

A terms aggregation returns top unique values.

```json
{
  "aggs": {
    "brands": {
      "terms": {
        "field": "brand",
        "size": 20
      }
    }
  }
}
```

Each shard returns local candidate buckets. A globally important term may not be high enough on each shard unless shard-level candidate size is sufficient.

The response can expose count-error information.

## 110. High-Cardinality Terms

Fields such as:

```text
user_id
request_id
URL
trace_id
```

can create large aggregation structures.

Costs:

- Heap.
- Global ordinals.
- Network.
- Coordinator merge.
- Slow queries.

Use:

- Composite aggregation for exhaustive pagination.
- Filtering.
- Pre-aggregation.
- Transform jobs.
- ClickHouse for broad OLAP patterns.

## 111. Cardinality Aggregation

Cardinality estimates unique values using a probabilistic algorithm.

Advantages:

- Bounded memory relative to exact set storage.

Trade-off:

- Approximation.
- Precision threshold affects memory and accuracy.

For exact billing counts, use an exact source or precomputed model.

## 112. Date Histogram

Groups dates into calendar or fixed intervals.

Examples:

```text
1 minute
1 hour
1 day
calendar month
```

Time zone and daylight-saving behavior matter for calendar intervals.

## 113. Range and Filters Aggregations

Use predefined ranges or named filters for predictable facets.

Example price buckets:

```text
0–5,000
5,000–10,000
10,000+
```

## 114. Nested Aggregation

Nested fields require a nested aggregation to enter the nested document context.

A reverse-nested aggregation can return to root documents.

## 115. Pipeline Aggregations

Operate on previous bucket/metric results.

Examples:

- Moving average.
- Derivative.
- Bucket script.
- Cumulative sum.
- Bucket selector.

Pipeline aggregations do not necessarily reduce the cost of producing the original buckets.

## 116. Composite Aggregation

Composite aggregation paginates deterministic combinations of bucket keys.

Use for:

- Exporting every unique combination.
- Backfill jobs.
- Large aggregation pagination.

It is not a direct replacement for terms aggregation when only the highest-frequency buckets are needed.

## 117. Global Ordinals

Keyword terms can be assigned shard-level ordinal IDs to make aggregations and joins faster.

Global ordinals may be:

- Built lazily on the first aggregation after refresh.
- Built eagerly when configured.

High-cardinality fields can make construction expensive.

Eager global ordinals shift cost from first query to refresh/indexing.

## 118. Aggregation Memory

Estimate:

```text
number of buckets
× per-bucket state
× shards
× concurrent queries
```

Circuit breakers protect the node from unsafe memory use, but a tripped breaker still fails the request.

<!-- IMAGE PLACEHOLDER
Title: Distributed aggregation
What to use: Each shard creates partial brand buckets and metrics; coordinating node merges them into final global buckets.
Preferred source: Elastic official aggregation documentation.
Search terms: site:elastic.co/docs Elasticsearch distributed aggregation shard reduce diagram
Purpose: Explain why shard count and candidate over-fetch affect aggregation accuracy and cost.
Alt text: Elasticsearch shards compute partial aggregation states that the coordinator reduces into final results.
Editorial note: Include both exact sum and top-terms candidate behavior.
-->

<!-- IMAGE PLACEHOLDER
Title: Terms aggregation candidate error
What to use: A globally frequent term ranked below the local top-N on several shards and therefore missing unless shard_size is increased.
Preferred source: Elastic official terms-aggregation documentation.
Search terms: site:elastic.co/docs Elasticsearch terms aggregation shard_size error diagram
Purpose: Explain distributed top-bucket approximation.
Alt text: A globally important term can be missed when it is not returned among local shard candidates.
Editorial note: Use a small numeric example.
-->

<!-- IMAGE PLACEHOLDER
Title: Composite aggregation pagination
What to use: Ordered composite bucket keys returned page by page using an `after_key` cursor.
Preferred source: Elastic official composite-aggregation documentation.
Search terms: site:elastic.co/docs Elasticsearch composite aggregation after_key diagram
Purpose: Show how to enumerate a large bucket space safely.
Alt text: Composite aggregation paginates deterministic bucket combinations using an after-key cursor.
Editorial note: Create an original diagram.
-->

<!-- IMAGE PLACEHOLDER
Title: Global ordinals lifecycle
What to use: Segment-local keyword terms mapped to shard-level global ordinal IDs after refresh, then used by a terms aggregation.
Preferred source: Elastic official eager-global-ordinals and terms-aggregation documentation.
Search terms: site:elastic.co/docs Elasticsearch global ordinals diagram
Purpose: Explain first-query latency after refresh on high-cardinality fields.
Alt text: Elasticsearch maps segment-local terms to global ordinals to speed repeated keyword aggregations.
Editorial note: Keep it conceptual rather than showing Lucene internal byte formats.
-->

# Shard Design

## 119. Primary Shard Count

The number of primary shards is set when an index is created.

It cannot be changed directly later, although data can be moved through:

- Reindexing.
- Split index.
- Shrink index.
- Rollover into a new index.

Choose based on:

- Expected index size.
- Indexing throughput.
- Search concurrency.
- Node count.
- Growth.
- Recovery time.
- Tenant skew.

## 120. Replica Count

Replicas provide:

- Availability if a primary copy is lost.
- More active shard copies for search throughput.

Replicas increase:

- Disk usage.
- Indexing work.
- Recovery traffic.
- Segment merges.

One replica is a common starting point for production search, but the correct count depends on SLA and read demand.

## 121. Shard Size

There is no universal ideal shard size.

Operationally, shards should be:

- Large enough to avoid oversharding.
- Small enough to recover and relocate within the SLA.
- Balanced across nodes.
- Compatible with search latency.

For many time-series workloads, teams often begin load testing in the approximate range of tens of gigabytes per primary shard, such as `10–50 GB`. This is a heuristic, not a product limit.

Search-heavy document workloads may prefer different sizes.

## 122. Oversharding

Too many small shards cause:

- Larger cluster state.
- More heap metadata.
- More threads and search tasks.
- More segment overhead.
- More open files.
- Slower recovery.
- Higher coordination cost.

Example anti-pattern:

```text
one index per user
one shard per tiny daily index
```

## 123. Undersharding

Too few large shards cause:

- One shard limited to one node's resources for each shard-level task.
- Hot indexing shards.
- Slow recovery.
- Limited relocation granularity.
- Large merge operations.

## 124. Shard Parallelism

A search across eight shards can use parallel work across nodes.

But one request that touches hundreds of shards creates coordination and queue overhead.

More shards are not always faster.

## 125. Shard Allocation

Elasticsearch assigns primary and replica shards to eligible nodes.

It avoids placing a replica on the same node as its primary.

Allocation considers:

- Node roles/tier.
- Disk watermarks.
- Awareness attributes.
- Allocation filters.
- Shard balancing.
- Recovery throttles.

## 126. Allocation Awareness

Awareness attributes describe failure domains such as:

```text
zone = a, b, c
rack = r1, r2
```

Elasticsearch distributes shard copies across these values where possible.

## 127. Forced Awareness

Forced awareness can prevent both copies from being allocated into the only surviving zone after another zone fails.

Trade-off:

- Avoids overloading one zone and preserves failure-domain assumptions.
- Leaves replicas unassigned and reduces redundancy.

## 128. Custom Routing and Partitioned Routing

Custom routing can reduce query fan-out, but one routing value normally maps to a small routing domain.

Routing partition size can spread one routing value across multiple shards in supported configurations.

This balances locality against hotspot risk.

## 129. Hot Shards

A hot shard can be caused by:

- One large tenant.
- One popular routing key.
- Skewed time-series writes.
- Uneven shard sizes.
- One query pattern targeting one shard.

Adding nodes does not automatically split an existing hot primary shard.

<!-- IMAGE PLACEHOLDER
Title: Oversharding vs healthy shard sizing
What to use: Many tiny shards consuming metadata and coordination compared with fewer balanced shards of moderate size.
Preferred source: Elastic official shard-sizing documentation.
Search terms: site:elastic.co/docs Elasticsearch oversharding shard sizing diagram
Purpose: Show why a shard is not a zero-cost partition.
Alt text: Too many tiny Elasticsearch shards waste heap and coordination compared with a balanced shard layout.
Editorial note: Do not present one exact ideal shard size as universal.
-->

<!-- IMAGE PLACEHOLDER
Title: Shard size trade-off
What to use: A continuum from tiny shards with overhead to huge shards with slow recovery, highlighting a benchmarked operating range in the middle.
Preferred source: Elastic official size-your-shards documentation.
Search terms: site:elastic.co/docs size your shards Elasticsearch recovery
Purpose: Explain the competing constraints that determine shard size.
Alt text: Elasticsearch shard size balances metadata overhead against recovery and relocation time.
Editorial note: Label numerical ranges as workload-specific heuristics.
-->

<!-- IMAGE PLACEHOLDER
Title: Allocation awareness across zones
What to use: Primary and replica copies spread across three availability zones, with no same-shard copies sharing a zone where capacity permits.
Preferred source: Elastic official shard-allocation-awareness documentation.
Search terms: site:elastic.co/docs Elasticsearch allocation awareness zones diagram
Purpose: Explain failure-domain-aware placement.
Alt text: Elasticsearch places primary and replica shard copies in different availability zones.
Editorial note: Include the behavior after one zone fails.
-->

<!-- IMAGE PLACEHOLDER
Title: Hot shard from custom routing
What to use: Most tenants evenly distributed but one giant tenant sends all traffic to one shard, saturating one node.
Preferred source: Create an original diagram based on Elastic routing documentation.
Search terms: Elasticsearch custom routing hot shard tenant
Purpose: Show the downside of locality-aware routing.
Alt text: A high-volume routing key can overload one Elasticsearch shard even when the rest of the cluster is idle.
Editorial note: Include hybrid/partitioned routing as a mitigation.
-->

# High Availability and Cluster Coordination

## 130. Master Election

Master-eligible nodes elect one node to manage cluster state.

A majority-based voting configuration prevents two disconnected sides from independently making conflicting cluster-state decisions.

Use an odd number of master-eligible voting nodes, commonly three, across independent failure domains.

## 131. Dedicated Master Nodes

For larger clusters, dedicated master-eligible nodes should not handle heavy search, indexing or ingest workloads.

Their critical resources are:

- Stable heap.
- Low GC pauses.
- Reliable network.
- Fast cluster-state processing.
- Persistent storage for cluster metadata.

They do not require the same large data disks as data nodes.

## 132. Voting-Only Nodes

A voting-only master-eligible node participates in elections and cluster-state publication but cannot become the elected master.

Useful for quorum topology, but it is still on the cluster-state publication path and must be reliable.

## 133. Primary Promotion

If a primary shard fails and an in-sync replica exists:

1. The master detects the failure.
2. An eligible replica is promoted.
3. Routing state is published.
4. Requests use the new primary.
5. A new replica can be allocated later.

In-flight requests may fail or time out during the transition.

Retries must be idempotent because the original write may have succeeded before the client observed failure.

## 134. In-Sync Allocation IDs

Elasticsearch tracks shard copies considered in sync.

This prevents promoting an arbitrary stale copy that could silently lose acknowledged operations.

A copy that falls too far behind may require peer recovery before it becomes eligible.

## 135. Peer Recovery

Recovery can copy:

- Segment files.
- Recent operations from translog/history.
- Metadata.

The exact mix depends on available history and shard state.

Recovery consumes:

- Network.
- Disk I/O.
- CPU.
- Source-node resources.

## 136. Delayed Allocation

After a node leaves, delayed allocation can wait before creating replacement replicas.

Useful when:

- Node restarts are brief.
- Reallocating large shards would waste bandwidth.
- The returning node still has local shard data.

Trade-off:

- Reduced redundancy during the delay.

## 137. Cluster Health

### Green

All primary and replica shards are allocated.

### Yellow

All primary shards are allocated, but one or more replicas are unassigned.

Data remains searchable and writable, but redundancy is reduced.

### Red

One or more primary shards are unassigned.

Some data is unavailable.

Cluster color is only a starting signal. Inspect which indices and shards are affected.

## 138. No Majority of Master-Eligible Nodes

Without the required voting majority, the cluster cannot safely elect/preserve a master for cluster-state-changing operations.

Effects can include:

- Cluster becomes unable to process writes requiring cluster coordination.
- Index creation and allocation stop.
- Existing local shard reads may behave differently depending on state and request path.

Do not design a two-master-node production cluster.

## 139. Split Brain

Modern Elasticsearch coordination is designed to avoid the historical split-brain misconfiguration pattern through majority elections and voting configurations.

The architecture still requires:

- Correct discovery configuration.
- Stable master nodes.
- Independent failure domains.
- No unsupported manual cluster-state manipulation.

<!-- IMAGE PLACEHOLDER
Title: Master election quorum
What to use: Three master-eligible nodes electing one master, followed by a network partition where only the two-node majority side can maintain leadership.
Preferred source: Elastic official discovery and cluster-coordination documentation.
Search terms: site:elastic.co/docs Elasticsearch master election quorum diagram
Purpose: Explain control-plane safety during partitions.
Alt text: A majority of Elasticsearch master-eligible nodes is required to elect and maintain the cluster master.
Editorial note: Create an original majority-partition diagram if official visuals are limited.
-->

<!-- IMAGE PLACEHOLDER
Title: Replica promotion
What to use: Primary shard failure, in-sync replica promotion, routing update, and later allocation of a replacement replica.
Preferred source: Elastic official shard recovery and replication documentation.
Search terms: site:elastic.co/docs Elasticsearch replica promotion primary failure diagram
Purpose: Show the normal data-plane failover path.
Alt text: Elasticsearch promotes an in-sync replica when a primary shard fails and later restores redundancy.
Editorial note: Include a short client error/retry window.
-->

<!-- IMAGE PLACEHOLDER
Title: Peer recovery
What to use: Source shard copy sending segment files and recent operation history to a recovering shard copy.
Preferred source: Elastic official peer-recovery documentation.
Search terms: site:elastic.co/docs Elasticsearch peer recovery segments translog diagram
Purpose: Explain network and disk load during recovery.
Alt text: Elasticsearch recovers a shard by copying Lucene files and replaying recent operations from a healthy copy.
Editorial note: Keep the diagram version-neutral.
-->

<!-- IMAGE PLACEHOLDER
Title: Green, yellow and red cluster health
What to use: Three mini-clusters showing all copies allocated, missing replica, and missing primary.
Preferred source: Elastic official cluster-health documentation.
Search terms: site:elastic.co/docs Elasticsearch green yellow red health diagram
Purpose: Make health-state meaning instantly understandable.
Alt text: Green has all shard copies, yellow lacks replicas, and red lacks at least one primary shard.
Editorial note: State that health is evaluated for the selected index scope.
-->

# Index Lifecycle Management and Data Streams

## 140. Why Time-Series Indices Roll Over

Logs and metrics continuously grow.

One permanent index creates problems:

- Shards become too large.
- Mapping and lifecycle operations become difficult.
- Old data cannot be dropped as a unit.
- Tier movement is coarse.

Rolling indices create manageable backing indices.

## 141. Data Stream

A data stream is a logical name over a sequence of hidden backing indices.

It has:

- One current write index.
- Older read-only backing indices.
- A timestamp field.
- Template-driven mappings/settings.

Applications write to the data stream name rather than selecting a concrete backing index.

## 142. Rollover

Rollover creates a new write index when a condition is reached.

Conditions can involve:

- Primary shard size.
- Document count.
- Age.

Size-based rollover often produces more consistent shard sizes than arbitrary daily rollover.

Bad default:

```text
one index every day regardless of volume
```

This creates tiny indices on low-volume days and oversized shards on high-volume days.

## 143. ILM Phases

Index Lifecycle Management can move indices through:

- Hot.
- Warm.
- Cold.
- Frozen.
- Delete.

Not every deployment needs every phase.

## 144. Hot Phase

Hot data is:

- Actively written.
- Frequently searched.
- Placed on high-performance nodes.

Actions can include:

- Rollover.
- Priority.
- Selected lifecycle operations.

## 145. Warm Phase

Warm data is read-only or less frequently written/searched.

Actions can include:

- Move to warm-tier nodes.
- Reduce replicas.
- Shrink shards.
- Force merge.
- Set read-only.

## 146. Cold Phase

Cold data is queried infrequently.

It can use cheaper storage and searchable snapshots in supported configurations.

Latency may increase.

## 147. Frozen Phase

Frozen data is rarely queried and can use partially mounted searchable snapshots with a smaller local cache footprint.

Trade-off:

- Lowest local storage cost.
- Higher query latency and object-storage dependence.

## 148. Delete Phase

The index or backing index is removed after retention expires.

Deleting a complete index is much cheaper than deleting individual old documents.

## 149. Searchable Snapshots

Searchable snapshots allow Elasticsearch to query snapshot-backed indices.

They can reduce local storage requirements in cold/frozen tiers.

Costs:

- Object-storage latency.
- Cache misses.
- Repository availability.
- Restore/mount behavior.

## 150. Force Merge

Force merge can reduce segment count after an index becomes read-only.

Benefits:

- Fewer segments.
- Potentially lower search overhead.
- Reclaim deleted space.

Costs:

- Heavy I/O.
- Temporary disk space.
- Long execution.

Do not force merge actively written indices routinely.

## 151. Shrink

Shrink creates a new index with fewer primary shards.

Useful when:

- Hot-phase indexing needed many shards.
- Old read-only data needs fewer shards.

It has allocation and shard-count divisibility requirements. Plan the original primary count accordingly.

## 152. Data Stream Lifecycle vs ILM

Elastic deployments may support different lifecycle mechanisms depending on product mode and version.

Use the mechanism recommended for the deployed environment and feature set.

Do not mix policies without understanding ownership and precedence.

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch data stream
What to use: One data stream name pointing to several backing indices, with the newest backing index marked as the write index.
Preferred source: Elastic official data-stream documentation.
Search terms: site:elastic.co/docs Elasticsearch data stream backing indices write index diagram
Purpose: Explain the abstraction used for logs, metrics and other append-only time series.
Alt text: An Elasticsearch data stream routes writes to its newest backing index and searches across all backing indices.
Editorial note: Prefer the current official data-stream visual.
-->

<!-- IMAGE PLACEHOLDER
Title: Rollover by shard size
What to use: A write index growing until a maximum primary-shard size, then rolling to a new write index while the old one becomes read-only.
Preferred source: Elastic official rollover and ILM documentation.
Search terms: site:elastic.co/docs Elasticsearch rollover max_primary_shard_size diagram
Purpose: Explain why rollover should target operational shard size rather than arbitrary dates alone.
Alt text: Elasticsearch creates a new write index when the current primary shard reaches a configured rollover condition.
Editorial note: Include age/document conditions as secondary options.
-->

<!-- IMAGE PLACEHOLDER
Title: Hot-warm-cold-frozen-delete lifecycle
What to use: A horizontal lifecycle showing data moving from high-performance hot nodes to progressively cheaper tiers, searchable snapshots and final deletion.
Preferred source: Elastic official data-tiers and ILM documentation.
Search terms: site:elastic.co/docs Elasticsearch hot warm cold frozen delete diagram
Purpose: Show performance-cost trade-offs over data age.
Alt text: Elasticsearch moves aging data through hot, warm, cold and frozen tiers before deleting it.
Editorial note: Use the current official data-tier diagram where licensing permits.
-->

<!-- IMAGE PLACEHOLDER
Title: Searchable snapshot read path
What to use: Frozen/cold node cache fetching missing Lucene blocks from an object-storage snapshot repository.
Preferred source: Elastic official searchable-snapshot documentation.
Search terms: site:elastic.co/docs Elasticsearch searchable snapshot frozen cache diagram
Purpose: Explain lower storage cost and higher cache-miss latency.
Alt text: Elasticsearch serves a searchable snapshot using a local cache and fetches uncached data from object storage.
Editorial note: Keep fully mounted and partially mounted variants clearly labelled if both are shown.
-->

# Ingest Pipelines

## 153. Ingest Node

An ingest node runs preprocessing pipelines before indexing.

Processors can:

- Rename fields.
- Convert types.
- Parse dates.
- Split strings.
- Extract with grok or dissect.
- Add/remove fields.
- Enrich from lookup data.
- Geo-locate IP addresses.
- Run scripts.

## 154. Pipeline Flow

```text
client or agent
    -> ingest pipeline
    -> transformed document
    -> primary shard
```

Pipeline failures can:

- Reject documents.
- Route to an on-failure path.
- Add error metadata.
- Send records to a dead-letter workflow outside Elasticsearch.

## 155. Grok vs Dissect

### Grok

- Flexible pattern matching.
- Useful for variable log formats.
- Regex-like and more CPU-intensive.

### Dissect

- Delimiter-based extraction.
- Faster for consistent formats.
- Less flexible.

Use Dissect when the log structure is stable.

## 156. Enrich Processor

Enrich can add fields from an enrichment index.

Use for:

- IP-to-asset metadata.
- User-to-segment mapping.
- Product category enrichment.

Enrichment state must be refreshed when source data changes.

## 157. Client-Side vs Ingest-Node Transformation

### Client/stream processor

Advantages:

- Independent scaling.
- Rich libraries.
- Easier testing and dead-letter handling.

### Ingest node

Advantages:

- Centralized pipeline.
- Fewer moving services.
- Tight integration with indexing.

Heavy transforms may deserve a separate stream-processing layer.

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch ingest pipeline
What to use: Raw event passing through parse, rename, type conversion, geo-IP and enrich processors before shard routing.
Preferred source: Elastic official ingest-pipeline documentation.
Search terms: site:elastic.co/docs Elasticsearch ingest pipeline processors diagram
Purpose: Show transformation before indexing.
Alt text: Elasticsearch ingest processors parse and enrich a document before it is routed to its primary shard.
Editorial note: Use a log event example.
-->

<!-- IMAGE PLACEHOLDER
Title: Grok vs Dissect
What to use: Variable log text parsed with pattern matching and fixed delimiter log text parsed positionally.
Preferred source: Elastic official grok and dissect processor documentation.
Search terms: site:elastic.co/docs Elasticsearch grok dissect comparison
Purpose: Show CPU/flexibility trade-offs.
Alt text: Grok handles flexible patterns while Dissect efficiently parses stable delimiter-based logs.
Editorial note: Create an original comparison.
-->

# Search and Indexing Performance

## 158. Filesystem Cache

Elasticsearch relies heavily on the operating-system filesystem cache for Lucene segment files.

General heap guidance for self-managed data nodes has historically been to leave substantial RAM outside the JVM so the OS can cache index data.

Do not allocate nearly all machine RAM to the Java heap.

The correct heap and memory model depends on:

- Elasticsearch version.
- Node role.
- Workload.
- Container limits.
- Managed-service configuration.

## 159. JVM Heap

Heap stores:

- Cluster metadata.
- Shard/segment metadata.
- Query aggregation state.
- Caches.
- Indexing buffers.
- Request state.
- Global ordinals.

Too little heap:

- Frequent circuit-breaker failures.
- High GC.
- Query failures.

Too much heap:

- Less filesystem cache.
- Longer GC risks.
- Compressed-object-pointer considerations on older JVM sizing assumptions.

Follow current Elastic automatic heap sizing or official deployment guidance.

## 160. Request Cache

The shard request cache stores complete shard-level search results for eligible requests.

It is especially useful for:

- Repeated dashboard aggregations.
- Read-only historical indices.
- Requests whose result is stable between refreshes.

A refresh invalidates relevant cached entries.

Requests using `now` or non-deterministic scripts may not cache effectively.

## 161. Query Cache

The node query cache stores reusable filter results at the segment level.

Useful for repeated filters on stable segments.

It is managed automatically. Do not build a design that assumes every filter result will remain cached.

## 162. Fielddata Cache

Fielddata and selected global-ordinal structures can use heap.

High-cardinality text/keyword aggregations can create pressure.

Prefer correct mappings and doc values rather than expanding fielddata limits blindly.

## 163. Page Cache vs Application Cache

The filesystem cache avoids repeated disk reads of Lucene files.

A result cache avoids recomputing the entire query.

An external cache such as Redis can store:

- Fully rendered responses.
- Search suggestions.
- Popular query results.

External caching must define invalidation and personalization semantics.

## 164. Segment Count

Every shard search checks relevant segments.

Many tiny segments increase:

- Query overhead.
- File handles.
- Memory metadata.
- Merge demand.

Causes:

- Very frequent refresh.
- Tiny indexing batches.
- Many small shards.
- Continuous update churn.

## 165. Refresh Interval Tuning

Short refresh interval:

- Better freshness.
- Lower indexing throughput.
- More segments and merges.

Long refresh interval:

- Better indexing throughput.
- Higher search staleness.

Separate requirements by index:

```text
product search -> low-seconds freshness
historic logs  -> can tolerate longer interval during backfill
```

## 166. Index Sorting

Index sorting sorts documents inside Lucene segments by configured fields at index time.

Potential benefits:

- Early termination for compatible sorts.
- Faster conjunctions in selected patterns.
- Better compression/locality.

Costs:

- Higher indexing work.
- Immutable configuration.
- Not the same as Elasticsearch shard routing.

Use only for stable high-value query patterns.

## 167. Search Slow Log

Search slow logs record slow shard-level query or fetch phases above thresholds.

They help identify:

- Expensive queries.
- Slow shards.
- Fetch-heavy responses.
- Specific indices.

They do not automatically reveal end-to-end coordinating-node latency.

## 168. Indexing Slow Log

Indexing slow logs identify slow document processing at shard level.

Potential causes:

- Expensive analyzers.
- Ingest pipelines.
- Large documents.
- Disk pressure.
- Mapping updates.

## 169. Circuit Breakers

Circuit breakers estimate and restrict memory use for operations such as:

- Requests.
- Fielddata.
- In-flight requests.
- Parent aggregate memory.

A breaker prevents a worse node failure, but the query still fails.

Fix the query or capacity problem instead of simply raising limits.

## 170. Thread Pools

Elasticsearch uses bounded thread pools and queues for categories such as:

- Search.
- Write.
- Get.
- Management.
- Snapshot.

Queue rejection indicates the node cannot keep up with incoming work.

Adding a huge queue usually delays failure and increases latency rather than adding capacity.

## 171. Search Workload Isolation

Separate or govern:

- User-facing search.
- Dashboard aggregations.
- Analyst queries.
- Bulk exports.
- Vector search.
- Ingestion.

Options:

- Separate clusters or tiers.
- Separate indices.
- Coordinating-node pools.
- User/role limits.
- Query timeouts.
- Search task cancellation.
- Application-level concurrency limits.

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch memory model
What to use: Host RAM divided among JVM heap, filesystem cache and operating-system/native overhead, with examples of what each area stores.
Preferred source: Elastic official JVM and memory guidance.
Search terms: site:elastic.co/docs Elasticsearch heap filesystem cache diagram
Purpose: Explain why giving all RAM to the heap hurts Lucene search performance.
Alt text: Elasticsearch uses JVM heap for metadata and query state while the operating system caches Lucene segment files outside the heap.
Editorial note: Avoid hard-coding a universal heap percentage without current-version caveats.
-->

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch cache layers
What to use: Query cache at segment level, shard request cache for complete shard responses, filesystem cache for Lucene files, and optional Redis/application cache above the cluster.
Preferred source: Elastic official cache documentation.
Search terms: site:elastic.co/docs Elasticsearch query cache request cache filesystem cache
Purpose: Distinguish caches that solve different bottlenecks.
Alt text: Elasticsearch uses filter, request and filesystem caches at different layers of the search path.
Editorial note: Create an original layered diagram.
-->

<!-- IMAGE PLACEHOLDER
Title: Refresh interval trade-off
What to use: A graph with search freshness improving as refresh frequency increases, while indexing throughput falls and segment/merge count rises.
Preferred source: Elastic official indexing-speed and refresh documentation.
Search terms: site:elastic.co/docs Elasticsearch refresh interval indexing performance
Purpose: Visualize a central indexing trade-off.
Alt text: More frequent Elasticsearch refreshes improve visibility but reduce indexing throughput and create more segments.
Editorial note: Mark the curves as conceptual rather than benchmark data.
-->

<!-- IMAGE PLACEHOLDER
Title: Circuit-breaker protection
What to use: A high-cardinality aggregation estimating unsafe heap usage, stopped by a circuit breaker before node-level out-of-memory failure.
Preferred source: Elastic official circuit-breaker documentation.
Search terms: site:elastic.co/docs Elasticsearch circuit breaker aggregation memory diagram
Purpose: Explain that breaker errors are protective symptoms.
Alt text: Elasticsearch rejects a memory-heavy request before it can exhaust node heap.
Editorial note: Create an original diagram.
-->

# Vector and Hybrid Search

## 172. Dense Vectors

The `dense_vector` field stores numeric embeddings.

Embeddings represent semantic meaning in a high-dimensional space.

Use for:

- Semantic document retrieval.
- Image similarity.
- Recommendation candidates.
- Retrieval-augmented generation.
- Multimodal search.

Dense vectors do not support normal terms aggregations or sorting like keyword fields.

## 173. Exact Vector Search

Exact similarity can use a script-score style query over filtered documents.

Advantages:

- Exact scoring for the evaluated set.
- Flexible similarity logic.

Trade-off:

- Cost proportional to candidate documents.
- Poor for scanning millions of vectors per request.

Use when a strong filter reduces candidates sufficiently.

## 174. Approximate kNN

Approximate nearest-neighbor search uses a vector index, commonly graph-based structures such as HNSW in current Elasticsearch capabilities.

Advantages:

- Much faster retrieval over large vector sets.

Trade-offs:

- Approximate recall.
- Additional index memory and disk.
- Higher indexing CPU.
- Segment merge implications.
- Tuning parameters.

## 175. HNSW Intuition

HNSW builds a multi-layer proximity graph.

Search:

1. Starts at sparse upper layers.
2. Navigates toward the query vector.
3. Descends to denser layers.
4. Explores a candidate neighborhood.
5. Returns nearest candidates.

Parameters trade:

- Build time.
- Index size.
- Search latency.
- Recall.

## 176. Vector Quantization

Current Elasticsearch versions can support quantized vector representations to reduce memory and improve search efficiency.

Quantization trades exact vector precision for:

- Lower memory.
- Smaller index structures.
- Faster approximate search.

Original vectors may still be retained or used for reranking depending on configuration.

Verify available quantization modes and defaults for the deployed version.

## 177. Vector Filtering

Filters such as:

```text
tenant_id
language
product availability
security ACL
```

must be applied correctly with vector retrieval.

The behavior and efficiency depend on whether filtering is integrated into approximate search or applied after candidate generation.

## 178. Hybrid Search

Hybrid search combines:

- Lexical BM25 retrieval.
- Semantic vector retrieval.
- Optional sparse semantic retrieval.
- Business filters.
- Reranking.

Benefits:

- Lexical search handles exact names, IDs and rare terms.
- Vector search handles paraphrases and semantic similarity.

## 179. Reciprocal Rank Fusion

Reciprocal Rank Fusion combines ranked lists based on their positions rather than requiring lexical and vector scores to be directly comparable.

Conceptually:

```text
BM25 ranked list
+
vector ranked list
-> fused ranking
```

Useful when score scales differ.

Verify current RRF availability and licensing/product mode.

## 180. Semantic Reranking

A common architecture:

```text
lexical/vector candidate retrieval
    -> top 100 or 1,000
    -> cross-encoder or semantic reranker
    -> final top 20
```

Reranking every indexed document is too expensive.

## 181. Vector Capacity Planning

Estimate:

```text
vectors
× dimensions
× bytes per dimension
+
HNSW graph/index overhead
+
_source or stored vectors
+
replicas
```

Example raw vectors:

```text
100 million documents
× 768 dimensions
× 4 bytes
≈ 307 GB
```

before graph, metadata, source and replica overhead.

Quantization can reduce vector index memory, but benchmark recall and latency.

## 182. Embedding Versioning

Store fields such as:

```text
embedding_model
embedding_version
```

When the model changes:

- New embeddings may not be comparable with old embeddings.
- Reindexing may be required.
- Blue/green vector indices can support migration.

<!-- IMAGE PLACEHOLDER
Title: Exact vs approximate vector search
What to use: Exact search comparing the query to every filtered vector, contrasted with HNSW graph traversal visiting a small candidate neighborhood.
Preferred source: Elastic official dense-vector and kNN documentation.
Search terms: site:elastic.co/docs Elasticsearch exact vector approximate kNN HNSW diagram
Purpose: Explain the latency/recall trade-off.
Alt text: Exact vector search scores every candidate while approximate kNN navigates an HNSW graph to find likely nearest neighbors.
Editorial note: Prefer current official vector-search visuals.
-->

<!-- IMAGE PLACEHOLDER
Title: HNSW multi-layer graph
What to use: Sparse upper graph layers leading to a dense bottom layer, with a search path approaching the query's nearest neighbors.
Preferred source: Elastic official kNN documentation or the HNSW research paper.
Search terms: site:elastic.co/docs Elasticsearch HNSW graph layers diagram
Purpose: Provide intuition for approximate vector indexing.
Alt text: HNSW searches from sparse upper layers down to a dense graph around the nearest vectors.
Editorial note: Redraw the concept instead of copying a paper figure unless licence permits.
-->

<!-- IMAGE PLACEHOLDER
Title: Hybrid lexical and vector search
What to use: BM25 and kNN retrieval running in parallel, structured filters applied, and RRF or reranking producing one result list.
Preferred source: Elastic official hybrid-search and RRF documentation.
Search terms: site:elastic.co/docs Elasticsearch hybrid search RRF diagram
Purpose: Show why lexical and semantic retrieval are complementary.
Alt text: Elasticsearch combines lexical and vector candidate lists into one hybrid ranking.
Editorial note: Clearly separate retrieval, fusion and reranking.
-->

<!-- IMAGE PLACEHOLDER
Title: Vector index storage estimate
What to use: Raw vector bytes plus HNSW graph, metadata, source and replicas building up total provisioned storage/memory.
Preferred source: Create an original diagram based on Elastic vector documentation and this guide's formula.
Search terms: Elasticsearch dense vector HNSW memory sizing
Purpose: Prevent underestimating vector-search infrastructure.
Alt text: Elasticsearch vector capacity includes raw dimensions, graph overhead, document storage and replicas.
Editorial note: Label all numeric multipliers as workload- and version-specific.
-->

# Cross-Cluster Search and Replication

## 183. Remote Clusters

A local Elasticsearch cluster can connect to remote clusters.

Use for:

- Cross-cluster search.
- Cross-cluster replication.
- Regional search federation.
- Central observability.
- Disaster recovery.

Connection models and security options are version- and deployment-specific.

## 184. Cross-Cluster Search

Cross-cluster search queries indices on multiple clusters.

Conceptually:

```text
local coordinator
  -> local shards
  -> remote cluster A
  -> remote cluster B
  -> merge results
```

Benefits:

- Data remains regionally owned.
- One query can search global data.
- Clusters can scale independently.

Trade-offs:

- WAN latency.
- Remote-cluster failure.
- Version compatibility.
- Larger scatter-gather fan-out.
- Security and trust configuration.

## 185. Minimize Round Trips

Cross-cluster search can reduce WAN round trips by letting remote clusters perform more local coordination before returning results.

The best strategy depends on query type and network latency.

## 186. Cross-Cluster Replication

CCR replicates leader indices to follower indices in another cluster.

Use for:

- Disaster recovery.
- Read locality.
- Centralized reporting.
- Geographic data copies.

CCR is generally active-passive per followed index:

```text
leader index -> follower index
```

The follower is not an independent multi-primary conflict-resolution system.

## 187. Follower Lag

Follower freshness depends on:

- WAN latency.
- Leader indexing rate.
- Read-poll settings.
- Follower capacity.
- Shard recovery.
- Retention leases/history availability.

Monitor sequence-number lag and time lag.

## 188. Failover

A DR procedure may:

1. Stop or isolate writes to the old leader.
2. Ensure follower caught up as far as possible.
3. Unfollow/promote target index according to supported procedure.
4. Redirect applications.
5. Re-establish replication after recovery.

The exact process must be tested for the deployed version and managed service.

## 189. Bi-Directional Replication

Replicating different index namespaces in opposite directions can support active-active regional ownership.

Example:

```text
Region A writes A-owned indices, follows B-owned indices.
Region B writes B-owned indices, follows A-owned indices.
```

Do not write concurrently to the same logical index on both sides without an explicit conflict model.

<!-- IMAGE PLACEHOLDER
Title: Cross-cluster search
What to use: One coordinating cluster sending subqueries to two remote regional clusters and merging top hits and aggregations.
Preferred source: Elastic official cross-cluster-search documentation.
Search terms: site:elastic.co/docs Elasticsearch cross cluster search diagram
Purpose: Show federated search without centralizing all indexed data.
Alt text: Elasticsearch queries local and remote clusters and merges their search results at a coordinating cluster.
Editorial note: Include WAN latency as part of the critical path.
-->

<!-- IMAGE PLACEHOLDER
Title: Cross-cluster replication
What to use: Leader index shards in region A streaming operations to follower index shards in region B, with measured lag.
Preferred source: Elastic official CCR documentation.
Search terms: site:elastic.co/docs Elasticsearch cross cluster replication leader follower diagram
Purpose: Explain active-passive replication and DR.
Alt text: Elasticsearch CCR continuously copies leader-index operations into follower indices in another cluster.
Editorial note: Clearly show follower as read-only while following.
-->

<!-- IMAGE PLACEHOLDER
Title: Region-owned active-active pattern
What to use: Region A owns A indices and follows B indices, while region B owns B indices and follows A indices.
Preferred source: Create an original diagram based on Elastic CCR patterns.
Search terms: Elasticsearch CCR bi directional regional indices architecture
Purpose: Show a safe alternative to concurrent writes to the same index.
Alt text: Each region writes its own Elasticsearch indices and follows the other region's indices for global reads.
Editorial note: Label it as namespace ownership, not true multi-primary conflict resolution.
-->

# Snapshots and Recovery

## 190. Snapshot Repository

Snapshots store index and cluster metadata in a repository such as:

- Object storage.
- Shared filesystem.
- Supported cloud repository.

Snapshots are incremental at the segment-file level across snapshots in the same repository.

## 191. Snapshot Lifecycle Management

SLM automates:

- Snapshot schedule.
- Snapshot naming.
- Repository selection.
- Retention.

Monitor failures and repository capacity.

## 192. Snapshot Consistency

A snapshot records shard data over a time window rather than freezing the entire cluster at one universal instant.

It contains a consistent copy of each included shard as captured during the operation.

Applications requiring a cross-system transactional point in time need additional coordination.

## 193. Restore

Restore can recover:

- Complete indices.
- Selected indices.
- Data streams.
- Feature state and selected cluster metadata.

Restoring into an existing cluster requires naming, mapping, alias and conflict planning.

## 194. Snapshot Is Not Immediate HA

Replicas provide rapid shard failover.

Snapshots provide recovery from:

- Accidental deletion.
- Logical corruption.
- Cluster loss.
- Region loss.
- Historical rollback.

Use both when Elasticsearch contains important data.

## 195. Reindex from Source

If Elasticsearch is a derived search index, another recovery path is:

```text
source database/object store/Kafka
    -> rebuild new index
```

Rebuild time depends on:

- Source read capacity.
- Transformation throughput.
- Elasticsearch bulk capacity.
- Index size.
- Analyzer cost.
- Replica and refresh settings.

## 196. Blue-Green Reindex

Schema migration pattern:

```text
products_v1 alias: products_read
create products_v2
backfill v2
consume ongoing changes
validate
switch alias to v2 atomically
retire v1 later
```

Use aliases so clients do not hard-code physical index versions.

## 197. Reindex Caveats

Reindexing:

- Reads `_source` or remote data.
- Consumes source and target cluster resources.
- Does not automatically preserve every setting/template.
- Can duplicate changing documents without version handling.
- Needs deletion propagation.
- Needs a cutover strategy.

<!-- IMAGE PLACEHOLDER
Title: Snapshot repository and incremental segments
What to use: Multiple Elasticsearch snapshots reusing immutable Lucene segment files in an object-storage repository.
Preferred source: Elastic official snapshot and restore documentation.
Search terms: site:elastic.co/docs Elasticsearch incremental snapshot segments diagram
Purpose: Explain why snapshots reuse segment data and why repository files must not be modified manually.
Alt text: Elasticsearch snapshots reference immutable segment files and upload only segment data not already present in the repository.
Editorial note: Prefer the current official snapshot architecture visual.
-->

<!-- IMAGE PLACEHOLDER
Title: Replica vs snapshot vs source rebuild
What to use: Three recovery layers: replica for node failure, snapshot for cluster/logical loss, and source database/event replay for full index reconstruction.
Preferred source: Create an original diagram from Elastic replication and snapshot documentation.
Search terms: Elasticsearch replica snapshot reindex recovery comparison
Purpose: Distinguish high availability from backup and rebuildability.
Alt text: Elasticsearch replicas, snapshots and source replay protect against different failure classes.
Editorial note: Use a layered protection diagram.
-->

<!-- IMAGE PLACEHOLDER
Title: Blue-green index migration
What to use: Read alias pointing to v1, v2 backfill and dual change capture, validation, atomic alias switch, and v1 retirement.
Preferred source: Elastic official aliases and reindex documentation.
Search terms: site:elastic.co/docs Elasticsearch reindex alias zero downtime migration diagram
Purpose: Show how mappings and analyzers are changed safely.
Alt text: Elasticsearch builds and validates a new index version before atomically switching the read alias.
Editorial note: Include write-alias behavior only if the architecture needs it.
-->

# Security

## 198. Transport and HTTP TLS

Elasticsearch uses:

- HTTP interface for client requests.
- Transport interface for node-to-node communication.

Protect both with TLS according to deployment guidance.

Do not expose Elasticsearch directly to the public internet.

## 199. Authentication

Supported mechanisms can include:

- Native users.
- LDAP/Active Directory.
- SAML.
- OpenID Connect.
- API keys.
- Service tokens.
- Cloud identity integrations.

Availability depends on product and license.

## 200. Role-Based Access Control

Roles can restrict:

- Cluster privileges.
- Index privileges.
- Index patterns.
- Application privileges.

Separate identities for:

- Search API.
- Indexing pipeline.
- Analysts.
- Administrators.
- Snapshot jobs.
- Monitoring.

## 201. Document and Field-Level Security

Selected Elastic subscriptions support:

- Document-level security.
- Field-level security.

Use for controlled multi-tenant access, while considering:

- Query overhead.
- Cache behavior.
- Aggregation leakage.
- Operational complexity.
- Licensing.

For strong isolation, separate indices or clusters may be clearer.

## 202. API Keys

API keys support scoped machine authentication.

Use:

- Least privilege.
- Expiration.
- Rotation.
- Separate key per service/environment.
- Secure storage.

## 203. Audit Logging

Audit logs can record security events such as authentication and authorization decisions.

Route them to protected storage and monitor for tampering or excessive volume.

## 204. Application-Layer Authorization

Search queries must not trust user-supplied tenant filters alone.

Enforce tenant scope through:

- Dedicated credentials.
- Filtered aliases where appropriate.
- Document-level security.
- Query gateway.
- Separate indices/clusters.

## 205. Sensitive Data

Avoid indexing secrets or unnecessary personal data.

Consider:

- Field exclusion.
- Tokenization or hashing.
- Encryption at rest.
- Retention.
- Right-to-delete workflows.
- Snapshot copies.
- Highlight/source leakage.

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch security boundaries
What to use: Clients through TLS and authentication to role-scoped indices, plus encrypted node-to-node transport and restricted snapshot repository.
Preferred source: Elastic official security and TLS documentation.
Search terms: site:elastic.co/docs Elasticsearch security TLS RBAC architecture diagram
Purpose: Show defense in depth around the cluster.
Alt text: Elasticsearch protects client and node traffic with TLS and grants access through scoped identities and roles.
Editorial note: Use only features available in the intended product tier.
-->

<!-- IMAGE PLACEHOLDER
Title: Multi-tenant isolation options
What to use: A continuum comparing tenant filter in application, filtered alias/DLS, separate index and separate cluster.
Preferred source: Create an original diagram based on Elastic security and index design documentation.
Search terms: Elasticsearch multi tenant index per tenant DLS architecture
Purpose: Explain isolation versus operational-cost trade-offs.
Alt text: Elasticsearch tenant isolation can range from shared filtered indices to completely separate clusters.
Editorial note: Do not imply application filters alone are a security boundary.
-->

# Failure Scenarios

## 206. One Data Node Fails

Expected behavior:

- Primary or replica shards on the node become unavailable.
- In-sync replicas can be promoted.
- Searches route to surviving copies.
- Cluster may become yellow during recovery.
- Replacement replicas are allocated if capacity allows.

Risks:

- Reduced redundancy.
- Recovery network and disk load.
- Higher load on remaining nodes.
- Temporary request failures.

## 207. All Copies of One Shard Fail

The shard becomes unavailable.

Consequences:

- Cluster health can become red.
- Searches across the index can fail or return partial results depending on settings.
- Writes for that routing range fail.
- Restore or source rebuild may be required.

Never silently use partial search results for compliance, billing or security decisions.

## 208. One Availability Zone Fails

With shard copies spread correctly:

- Surviving copies can serve.
- Replicas may be promoted.
- Cluster can remain available.
- Capacity is reduced.

Plan surviving zones to handle failover traffic and recovery.

## 209. Two-Zone Topology Risk

A two-zone deployment complicates majority and placement design.

A safer common pattern is:

- Three master-eligible voters across three zones or a third voting location.
- Data copies distributed with explicit availability assumptions.

Do not assume two copies across two zones survive every partition safely and with full capacity.

## 210. Master Node Fails

Remaining master-eligible nodes elect a new master if a majority is available.

Data-node search and indexing paths may see a short disruption during election and cluster-state stabilization.

## 211. Master Majority Lost

The cluster cannot safely perform cluster-state-changing operations.

Restore quorum rather than trying to force two independent sides to operate.

## 212. Disk High Watermark

As disk fills, Elasticsearch can stop allocating shards to a node.

At higher thresholds, it relocates shards where possible.

At flood-stage watermark, indices with shards on the affected node can receive a read-only block to prevent disk exhaustion.

Recovery requires:

- Freeing space.
- Adding capacity.
- Fixing lifecycle/retention.
- Clearing the write block according to current behavior if not removed automatically.

## 213. JVM Memory Pressure

Symptoms:

- Long GC.
- Circuit-breaker errors.
- Search/index rejection.
- Node disconnect.
- Master instability.

Causes:

- Too many shards.
- High-cardinality aggregations.
- Large bulk requests.
- Mapping explosion.
- Fielddata.
- Excessive concurrent queries.

## 214. Merge Backlog

If merge I/O cannot keep up:

- Segment count grows.
- Disk usage grows because deletes remain.
- Search slows.
- Indexing is throttled.
- Recovery competes for disk.

## 215. Snapshot Repository Failure

Effects:

- Snapshot jobs fail.
- Searchable snapshots can lose access to uncached data.
- Restore is unavailable.

Repository availability and permissions are part of the Elasticsearch SLA.

## 216. Mapping Error During Bulk

Some items fail while others succeed.

The pipeline must:

- Inspect item results.
- Preserve failed payloads.
- Fix mapping/data.
- Retry only appropriate items.
- Avoid dropping events silently.

## 217. Source Database and Index Diverge

Causes:

- Missed CDC event.
- Consumer bug.
- Failed delete propagation.
- Out-of-order updates.
- Mapping rejection.

Mitigations:

- Versioned events.
- Dead-letter queue.
- Reconciliation jobs.
- Periodic count/checksum sampling.
- Full rebuild procedure.

## 218. Search Cluster Unavailable

Application behavior should be explicit:

- Fail search request.
- Serve cached popular results.
- Fall back to limited database lookup.
- Show degraded navigation.
- Queue indexing events for replay.

Do not direct unrestricted search load to the source database during outage.

<!-- IMAGE PLACEHOLDER
Title: Data-node failure recovery
What to use: One failed node, replica promotion, surviving-node traffic, and later replacement replica recovery.
Preferred source: Elastic official shard recovery documentation.
Search terms: site:elastic.co/docs Elasticsearch node failure shard recovery diagram
Purpose: Show availability and temporary capacity reduction.
Alt text: Elasticsearch promotes replicas after a node failure and restores missing shard copies on healthy nodes.
Editorial note: Highlight recovery I/O and yellow health.
-->

<!-- IMAGE PLACEHOLDER
Title: Disk watermark escalation
What to use: Low, high and flood-stage thresholds leading to allocation avoidance, relocation and read-only index protection.
Preferred source: Elastic official disk-based shard-allocation documentation.
Search terms: site:elastic.co/docs Elasticsearch disk watermarks flood stage diagram
Purpose: Explain a common production incident sequence.
Alt text: Elasticsearch progressively restricts shard allocation and writes as node disks approach full capacity.
Editorial note: Threshold values are configurable; do not hard-code defaults without version verification.
-->

<!-- IMAGE PLACEHOLDER
Title: JVM pressure failure cycle
What to use: Oversharding/high-cardinality queries → heap pressure → GC/circuit breakers → slow responses → retries → more pressure.
Preferred source: Create an original diagram based on Elastic JVM and breaker documentation.
Search terms: Elasticsearch JVM memory pressure retry storm circuit breaker
Purpose: Show how application retries can amplify node stress.
Alt text: Memory-heavy Elasticsearch workloads trigger GC and failures that can be worsened by retry storms.
Editorial note: Create an original causal loop.
-->

<!-- IMAGE PLACEHOLDER
Title: Search projection divergence
What to use: Source database version stream with one dropped/out-of-order event causing Elasticsearch to hold stale state, followed by reconciliation and repair.
Preferred source: Create an original diagram based on CDC architecture.
Search terms: Elasticsearch CDC missed event reconciliation
Purpose: Explain why derived search indices need correctness monitoring.
Alt text: A missed CDC event causes Elasticsearch to diverge from its source until a reconciliation process repairs the document.
Editorial note: Include version numbers to demonstrate out-of-order protection.
-->

# Capacity Planning

## 219. Inputs

Estimate:

```text
documents per second
peak multiplier
average source document size
indexed expansion or compression factor
retention
primary shard count
replica count
update/delete rate
search QPS
queries per request
shards touched per query
aggregation cardinality
vector dimensions
recovery SLA
target disk utilization
failure headroom
```

## 220. Raw Ingest Volume

```text
raw source bytes per day
= documents per second
× 86,400
× average source bytes
```

Example:

```text
50,000 log events/s
× 86,400
× 800 bytes
= 3.456 TB/day raw source
```

## 221. Indexed Storage Factor

Elasticsearch storage includes:

- `_source`.
- Inverted index.
- Positions and frequencies.
- Doc values.
- BKD points.
- Stored fields.
- Vectors and graphs.
- Segment metadata.
- Deleted-document overhead until merge.

Some datasets compress below raw JSON size. Others expand because many fields are indexed in multiple structures.

Measure with representative data.

Assume for interview calculation:

```text
primary indexed size = raw bytes × 1.2
```

Then:

```text
3.456 TB/day × 1.2
≈ 4.15 TB/day primary indexed data
```

The `1.2×` factor is an explicit benchmark assumption, not a guarantee.

## 222. Retention

For 30 days:

```text
4.15 TB/day × 30
≈ 124.5 TB primary data
```

With one replica:

```text
124.5 TB × 2
≈ 249 TB stored shard data
```

## 223. Operational Headroom

Add capacity for:

- Segment merges.
- Relocation.
- Recovery.
- Watermarks.
- Snapshots if local staging is used.
- Growth.
- Skew.

Example:

```text
249 TB × 1.25 operational factor
= 311.25 TB
```

At 70% target disk utilization:

```text
311.25 / 0.70
≈ 444.6 TB provisioned disk
```

Target utilization should leave enough space for the largest realistic relocation and merge workload.

## 224. Data Nodes for Storage

If each data node has:

```text
8 TB usable provisioned storage
```

then:

```text
444.6 / 8
≈ 55.6
```

Round to at least `56 data nodes`, then verify zone balance and shard topology.

## 225. Primary Shard Count from Target Size

If a backing index is rolled over near:

```text
400 GB primary data
```

and target primary shard size is:

```text
40 GB
```

then:

```text
400 / 40 = 10 primary shards
```

Validate indexing and search throughput per shard.

Do not create ten primaries merely because the cluster has ten nodes; shard count is an index-level long-term choice.

## 226. Recovery Time

Approximate lower bound:

```text
recovery time
= shard bytes / effective transfer rate
```

Example:

```text
50 GB shard
÷ 100 MB/s effective recovery throughput
≈ 500 seconds
≈ 8.3 minutes
```

Real recovery also depends on:

- Source disk reads.
- Target writes.
- Segment reuse.
- Concurrent recoveries.
- Network sharing.
- Throttling.
- Cluster workload.

## 227. Search CPU

Estimate by query family rather than one global QPS number.

Example:

```text
product text search: 2,000 QPS
facet aggregations: 500 QPS
autocomplete: 5,000 QPS
vector search: 300 QPS
```

Each has different:

- Shards touched.
- CPU.
- Heap.
- Result size.
- Cacheability.

## 228. Search Fan-Out

```text
shard-level search tasks per second
≈ search QPS × shards touched per request
```

Example:

```text
2,000 QPS × 20 shards
= 40,000 shard search tasks/s
```

Reducing each query to two routed shards changes demand to:

```text
4,000 shard search tasks/s
```

This demonstrates why shard and routing design dominate cluster size.

## 229. Replica Capacity

Replicas can absorb search requests, but they also duplicate indexing and disk work.

If write throughput is the bottleneck, adding replicas can reduce write capacity.

If search throughput is the bottleneck, more replicas may help—provided coordinating, CPU, filesystem cache and network capacity also scale.

## 230. Master Node Sizing

Master load depends more on:

- Index count.
- Shard count.
- Mapping size.
- Cluster-state update frequency.
- Node count.

than on indexed document bytes.

A small-data cluster with millions of fields or shards can overwhelm masters.

## 231. Heap Estimate

Do not estimate heap solely from document count.

Heap drivers include:

- Shard/segment count.
- Mappings.
- Query concurrency.
- Bucket count.
- Global ordinals.
- Bulk request size.
- Cluster state.

Use production-like load tests and monitor actual memory pressure.

## 232. Vector Sizing Example

Assume:

```text
20 million vectors
384 dimensions
4 bytes per float
```

Raw vector values:

```text
20,000,000 × 384 × 4
≈ 30.7 GB
```

With:

- HNSW graph/index.
- Metadata.
- `_source` or stored input.
- One replica.
- Operational headroom.

provisioned footprint can be several multiples of the raw vector bytes.

Benchmark with the exact vector encoding and quantization mode.

## 233. Network

Network carries:

- Client indexing payloads.
- Replica operations.
- Search requests.
- Top-hit/aggregation results.
- Recovery.
- Snapshot traffic.
- Cross-cluster search or replication.

Example search response:

```text
5,000 QPS × 20 KB response
≈ 100 MB/s application egress
```

before protocol and TLS overhead.

## 234. Capacity Is the Maximum Constraint

```text
required nodes
= max(
    nodes for storage,
    nodes for indexing CPU,
    nodes for search CPU,
    nodes for vector memory,
    nodes for recovery SLA,
    nodes for failure headroom
)
```

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch storage calculation
What to use: Raw events → indexed storage factor → retention → replicas → operational headroom → target disk utilization → node count.
Preferred source: Create an original diagram from this guide and Elastic capacity concepts.
Search terms: Elasticsearch capacity planning storage replicas shard sizing
Purpose: Provide a reusable HLD estimation sequence.
Alt text: Elasticsearch provisioned storage includes indexed expansion, retention, replicas, merge headroom and free-disk targets.
Editorial note: Label all numerical factors as measured assumptions.
-->

<!-- IMAGE PLACEHOLDER
Title: Search fan-out multiplication
What to use: Search QPS multiplied by shards per query, contrasted with custom routing that reduces shards touched.
Preferred source: Create an original diagram based on Elastic shard-routing documentation.
Search terms: Elasticsearch search QPS shard fanout capacity
Purpose: Show why query fan-out can dominate CPU demand.
Alt text: Elasticsearch cluster work grows with both user search rate and the number of shards each request touches.
Editorial note: Use the numeric example from the guide.
-->

<!-- IMAGE PLACEHOLDER
Title: Shard recovery time model
What to use: Shard size divided by effective transfer throughput, with disk, network and concurrency bottlenecks around the path.
Preferred source: Create an original diagram based on Elastic recovery documentation.
Search terms: Elasticsearch shard recovery time capacity planning
Purpose: Connect shard size to failure-recovery SLA.
Alt text: Elasticsearch recovery time depends on shard size and the effective end-to-end transfer rate.
Editorial note: Present the formula as a lower-bound estimate.
-->

# Monitoring and Operations

## 235. Cluster Metrics

Track:

- Cluster health.
- Number of nodes by role.
- Pending cluster tasks.
- Cluster-state publication time.
- Unassigned shards.
- Relocating and initializing shards.
- Shard count by node.
- Index count.
- Mapping field count.

## 236. Search Metrics

Track:

- Search QPS.
- Query and fetch latency.
- p50, p95 and p99 end-to-end latency.
- Search thread-pool queue and rejection.
- Timeouts.
- Cancelled tasks.
- Rows/hits returned.
- Slow-log events.
- Cache hit rates.

## 237. Indexing Metrics

Track:

- Documents and bytes indexed per second.
- Bulk latency.
- Bulk item failure rate.
- Write rejections.
- Refresh time/count.
- Flush time/count.
- Indexing throttle time.
- Ingest-pipeline latency and failures.
- Version conflicts.

## 238. Segment and Merge Metrics

Track:

- Segment count.
- Segment memory.
- Deleted-document percentage.
- Merge count and bytes.
- Merge time.
- Merge throttling.
- Disk write throughput.

## 239. JVM Metrics

Track:

- Heap used percentage.
- Old-generation pressure.
- GC count and duration.
- Circuit-breaker trips.
- Direct/native memory where exposed.
- Process CPU.

## 240. Disk and Filesystem Metrics

Track:

- Disk used percentage.
- Watermark state.
- Disk read/write latency.
- IOPS and throughput.
- Filesystem cache effectiveness through workload behavior.
- Snapshot repository throughput.

## 241. Shard Metrics

Track per shard:

- Store size.
- Document count.
- Search rate.
- Index rate.
- Recovery state.
- Segment count.
- Hotspot skew.

Node-level averages can hide one hot shard.

## 242. Replication and Recovery Metrics

Track:

- Unassigned replicas.
- Recovery bytes and time.
- Peer-recovery failures.
- CCR lag.
- Retention-lease/history issues.
- Snapshot status.

## 243. Useful APIs and Tools

Operational APIs include concepts such as:

- Cluster health.
- Cluster state and pending tasks.
- Cat nodes, indices and shards.
- Shard allocation explanation.
- Node stats.
- Index stats.
- Segment information.
- Task management.
- Thread-pool stats.
- Query profile.

Use structured APIs for automation; cat APIs are primarily human-oriented.

## 244. Allocation Explain

When a shard is unassigned, use allocation explanation rather than guessing.

Reasons can include:

- No eligible tier.
- Disk watermark.
- Awareness constraints.
- Allocation filter.
- Too many retries.
- Missing shard copy.
- Shard-per-node limit.

## 245. Alerting

Alert on:

- Red health immediately.
- Persistent yellow health.
- Master election or node churn.
- Pending cluster tasks.
- Disk thresholds.
- High JVM pressure.
- Search/write rejections.
- p99 latency.
- Bulk item failures.
- Snapshot failures.
- CCR lag.
- Sudden field/shard growth.
- Ingest pipeline failures.

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch operations dashboard
What to use: Dashboard panels for cluster health, search/index latency, JVM, disk watermarks, shard allocation, segment merges and snapshots.
Preferred source: Elastic Stack monitoring documentation and Kibana monitoring examples.
Search terms: site:elastic.co/docs Elasticsearch monitoring dashboard cluster health JVM shards
Purpose: Show what a production monitoring surface should cover.
Alt text: An Elasticsearch operations dashboard tracks cluster, query, indexing, memory, disk and recovery health.
Editorial note: Do not copy proprietary dashboard screenshots unless licence permits; create an original schematic dashboard.
-->

<!-- IMAGE PLACEHOLDER
Title: Shard allocation troubleshooting
What to use: Unassigned shard passing through checks for node role, tier, disk watermark, awareness, filters and available copies.
Preferred source: Elastic official diagnose-unassigned-shards documentation.
Search terms: site:elastic.co/docs Elasticsearch allocation explain unassigned shard flowchart
Purpose: Provide a practical incident-response decision tree.
Alt text: Elasticsearch shard allocation failures are diagnosed by checking eligibility, disk, awareness and shard-copy availability.
Editorial note: Create an original flowchart based on official decider categories.
-->

# Example Designs

## 246. E-Commerce Product Search

### Functional queries

```text
Search by product name and description.
Filter by brand, category, price and availability.
Sort by relevance, price, rating or popularity.
Return brand/category facets.
Support typo tolerance and autocomplete.
```

### Mapping

```json
PUT products_v1
{
  "settings": {
    "number_of_shards": 6,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "product_text": {
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding"]
        }
      }
    }
  },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "product_id": { "type": "keyword" },
      "name": {
        "type": "text",
        "analyzer": "product_text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "product_text"
      },
      "brand": { "type": "keyword" },
      "category_ids": { "type": "keyword" },
      "price": { "type": "scaled_float", "scaling_factor": 100 },
      "rating": { "type": "half_float" },
      "popularity": { "type": "rank_feature" },
      "in_stock": { "type": "boolean" },
      "updated_at": { "type": "date" }
    }
  }
}
```

### Search query

```json
POST products_read/_search
{
  "size": 20,
  "_source": ["product_id", "name", "brand", "price", "rating"],
  "query": {
    "bool": {
      "must": {
        "multi_match": {
          "query": "wireless mechanical keyboard",
          "fields": ["name^5", "brand^2", "description"],
          "fuzziness": "AUTO"
        }
      },
      "filter": [
        { "term": { "in_stock": true } },
        { "range": { "price": { "lte": 10000 } } }
      ]
    }
  },
  "aggs": {
    "brands": {
      "terms": { "field": "brand", "size": 20 }
    },
    "categories": {
      "terms": { "field": "category_ids", "size": 30 }
    }
  }
}
```

### Architecture

```text
Catalog DB
   -> outbox/CDC
   -> Kafka
   -> search indexer
   -> products_vN
   -> read alias
```

### Consistency

Allow:

```text
product changes visible in search within 2–5 seconds
```

Inventory used for strict checkout should be revalidated against the source system.

## 247. Autocomplete

Options:

### Edge n-gram field

Good for:

- General prefix matching.
- Multi-token input.

Costs:

- Larger index.

### Search-as-you-type field

Provides purpose-built subfields for prefix and shingle behavior.

### Completion suggester

Good for:

- Fast prefix suggestion from curated suggestions.
- Weighted suggestions.

Trade-offs:

- Specialized in-memory structure.
- Different query semantics from normal document search.

### Architecture

Use a separate suggestion index when:

- Suggestions have their own popularity score.
- Search terms are aggregated from user behavior.
- Product index update cadence differs.
- Query volume is extremely high.

## 248. Log Search

### Requirements

- Ingest high event volume.
- Filter by service, level, host and time.
- Search message text.
- Aggregate errors by service and minute.
- Retain 30 days.

### Data stream

```text
logs-app-default
```

### Fields

```text
@timestamp   -> date
service.name -> keyword
log.level    -> keyword
host.name    -> keyword
trace.id     -> keyword
message      -> text
labels       -> flattened
```

### Lifecycle

```text
hot: rollover by primary shard size
warm: optional force merge/reduced replicas
cold/frozen: searchable snapshot if needed
delete: 30 days
```

### Search pattern

```json
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "service.name": "payments" } },
        { "term": { "log.level": "ERROR" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ],
      "must": [
        { "match": { "message": "connection timeout" } }
      ]
    }
  }
}
```

## 249. Social-Post Search

### Queries

- Search posts by text.
- Filter by language, author or time.
- Apply visibility rules.
- Rank by relevance, freshness and engagement.

### Document

```json
{
  "post_id": "p1",
  "author_id": "u1",
  "text": "...",
  "language": "en",
  "created_at": "...",
  "visibility": "PUBLIC",
  "engagement_score": 42,
  "hashtags": ["systemdesign"]
}
```

### Authorization

Public posts are straightforward.

Private/follower-scoped content is difficult because access lists can be huge and frequently changing.

Options:

- Separate public search from private retrieval.
- Query-time ACL terms for small groups.
- Document-level security.
- Precomputed audience groups.
- Search candidates, then enforce authorization before display.

Never leak hidden result counts, highlights or aggregations.

## 250. Job Search

Fields:

```text
title          -> text + keyword
skills         -> keyword + text where needed
company        -> keyword/text
location       -> geo_point + keyword
salary         -> numeric
posted_at      -> date
experience     -> numeric range
embedding      -> dense_vector
```

Ranking can combine:

- Title/skill lexical relevance.
- Semantic similarity.
- Distance.
- Freshness.
- Company quality.
- User preferences.

## 251. Restaurant and Local Search

Use:

- `geo_point` for location.
- Geo-distance filter.
- Distance sort or decay.
- Cuisine keyword facets.
- Name/description text.
- Rating and popularity features.

Query:

```text
"south indian breakfast"
within 5 km
open now
rating >= 4
```

Opening-hours logic may be precomputed or handled in application/query scripting with care.

## 252. Security Event Search

Requirements:

- Very high ingest.
- Exact term filters.
- IP/date ranges.
- Text investigation.
- Long retention.
- Strict tenant and role isolation.

Design:

- Data streams.
- ECS-compatible fields where applicable.
- Hot/warm/cold/frozen tiers.
- Searchable snapshots.
- Separate detection rules from ad-hoc analyst search.
- Audit access.

## 253. Semantic Document Search for RAG

Document model:

```text
document_id
chunk_id
chunk_text
metadata
access-control fields
embedding
```

Pipeline:

```text
document
 -> parse
 -> chunk
 -> embed
 -> index chunks
```

Query:

```text
user question
 -> lexical + vector retrieval
 -> metadata/ACL filter
 -> fusion
 -> top chunks
 -> optional rerank
 -> LLM context
```

Risks:

- Bad chunking.
- Stale embeddings.
- ACL leakage.
- Duplicate chunks.
- Model-version mismatch.
- Low recall.
- Excessive context size.

## 254. Metrics and Time Series

Elasticsearch can store metrics using time-series-oriented mappings and data streams.

Use when:

- Search and observability integration matter.
- Labels are controlled.
- Retention/tiering is valuable.
- Query workload fits Elasticsearch aggregations.

For extremely broad numerical scans and high-cardinality OLAP, compare ClickHouse or a dedicated TSDB.

## 255. Search Analytics

Search-query events can be indexed separately:

```text
query text
result count
clicked result
position
latency
filters
session
```

Use for:

- Zero-result queries.
- Popular queries.
- CTR by position.
- Relevance evaluation.
- Synonym discovery.

ClickHouse may be better for large-scale behavioral aggregation, while Elasticsearch remains useful for textual exploration of query logs.

<!-- IMAGE PLACEHOLDER
Title: E-commerce search architecture
What to use: Catalog database → CDC/Kafka → search indexer → versioned product index/read alias → product search API with facets.
Preferred source: Create an original diagram based on Elastic e-commerce search patterns.
Search terms: Elasticsearch ecommerce product search architecture CDC
Purpose: Provide a complete HLD reference design.
Alt text: Product changes flow from the catalog database into a versioned Elasticsearch index served through a stable alias.
Editorial note: Include source-of-truth inventory validation at checkout.
-->

<!-- IMAGE PLACEHOLDER
Title: Autocomplete options
What to use: Comparison of edge n-grams, search-as-you-type fields and completion suggester by flexibility, index cost and query behavior.
Preferred source: Elastic official autocomplete and suggester documentation.
Search terms: site:elastic.co/docs Elasticsearch autocomplete edge ngram search_as_you_type completion
Purpose: Help select the correct autocomplete implementation.
Alt text: Elasticsearch supports general n-gram search, search-as-you-type fields and specialized completion suggestions.
Editorial note: Create an original decision matrix.
-->

<!-- IMAGE PLACEHOLDER
Title: Log analytics lifecycle architecture
What to use: Agents → ingest pipeline → log data stream → hot/warm/cold/frozen tiers → Kibana/search API.
Preferred source: Elastic official logging, data-stream and data-tier documentation.
Search terms: site:elastic.co/docs Elasticsearch log analytics architecture data stream tiers
Purpose: Show the canonical observability ingestion and retention design.
Alt text: Logs enter an Elasticsearch data stream and move through storage tiers as they age.
Editorial note: Prefer official Elastic observability architecture where reusable.
-->

<!-- IMAGE PLACEHOLDER
Title: RAG retrieval pipeline
What to use: Documents chunked and embedded into Elasticsearch, with query-time lexical/vector retrieval, ACL filtering, fusion, reranking and LLM context.
Preferred source: Elastic official semantic/hybrid search and RAG documentation.
Search terms: site:elastic.co/docs Elasticsearch RAG hybrid retrieval architecture
Purpose: Show Elasticsearch's role in retrieval rather than generation.
Alt text: Elasticsearch retrieves authorized lexical and vector document chunks before an LLM generates an answer.
Editorial note: Keep embedding generation and LLM execution outside Elasticsearch unless using a clearly labelled managed feature.
-->

<!-- IMAGE PLACEHOLDER
Title: Search authorization boundary
What to use: Candidate search with tenant/ACL filters followed by an authorization check before results, highlights and facets are returned.
Preferred source: Elastic official document-level security documentation plus an original application boundary.
Search terms: Elasticsearch search authorization ACL document level security architecture
Purpose: Prevent search metadata leakage.
Alt text: Authorization is enforced before Elasticsearch search hits and metadata are exposed to the user.
Editorial note: Create an original security-focused diagram.
-->

# Elasticsearch vs Other Systems

## 256. Comparison Table

| System | Best at | Main limitation compared with Elasticsearch |
|---|---|---|
| PostgreSQL | Transactions, constraints and relational queries | Less specialized for relevance, analyzers and distributed full-text search |
| Cassandra | High-write key-partition serving | Weak full-text relevance and faceting |
| Redis | In-memory cache, counters and short-lived state | Memory cost and limited search durability/history |
| ClickHouse | Large columnar scans and aggregation | Not primarily a relevance-ranked document search engine |
| OpenSearch | Similar distributed search/analytics family | Feature, API, licensing and release paths differ |
| Apache Solr | Lucene-based search with a different distributed/operational model | Different ecosystem and APIs |
| BigQuery | Serverless warehouse analytics | Higher-latency/cost profile for interactive relevance search |
| Dedicated vector DB | Vector-first retrieval | May lack Elasticsearch's mature lexical, filtering and aggregation stack |
| Elasticsearch | Full-text, relevance, filters, facets and hybrid retrieval | Weak fit for transactional source-of-truth workloads |

## 257. Elasticsearch vs PostgreSQL Full-Text Search

Choose PostgreSQL when:

- Dataset is moderate.
- Search is a secondary feature.
- Transactions and relational joins are central.
- Operational simplicity matters.
- Search requirements are basic.

Choose Elasticsearch when:

- Search is a primary product feature.
- Relevance tuning is complex.
- Facets, highlighting, fuzzy matching and analyzers matter.
- Search scale exceeds one relational node.
- Hybrid/vector retrieval is required.

## 258. Elasticsearch vs ClickHouse

Elasticsearch query:

```text
Find logs relevant to "connection timeout"
filtered by service and time,
return matching messages and facets.
```

ClickHouse query:

```text
Count all timeouts by service, region and five-minute bucket
across 90 days.
```

Elasticsearch excels at document retrieval and inverted-index filtering. ClickHouse excels at broad columnar aggregation.

Many observability systems use one or both depending on query priorities.

## 259. Elasticsearch vs Cassandra

Choose Elasticsearch for:

- Full-text search.
- Relevance.
- Flexible filters.
- Facets.
- Geo/vector retrieval.

Choose Cassandra for:

- Predictable partition-key reads.
- Very high durable write throughput.
- Availability-oriented multi-region serving.
- Large key-partition history.

Common architecture:

```text
Cassandra -> durable event/entity serving
Elasticsearch -> search projection
```

## 260. Elasticsearch vs Redis

Choose Redis for:

- Cache.
- Rate limiting.
- Counters.
- Sessions.
- Leaderboards.
- Sub-millisecond hot state.

Choose Elasticsearch for:

- Text retrieval.
- Facets.
- Relevance.
- Searchable document collections.

Redis can cache popular Elasticsearch query responses.

## 261. Elasticsearch vs OpenSearch

Both descend from Elasticsearch/Lucene and share many concepts.

Compare current:

- API compatibility.
- Feature availability.
- Security model.
- Vector capabilities.
- Operational tooling.
- Managed-cloud options.
- Licensing.
- Release cadence.
- Plugins.

Do not assume a feature or API from one exists identically in the other.

## 262. Elasticsearch vs Solr

Both use Lucene.

Elasticsearch is often selected for:

- JSON/REST-oriented APIs.
- Integrated distributed defaults.
- Elastic Stack ecosystem.
- Logs and observability.

Solr may be selected for:

- Existing Solr expertise.
- Specific collection/config-set workflows.
- Solr ecosystem features.

Benchmark and compare the actual search product requirements.

## 263. Elasticsearch vs Vector Database

Elasticsearch is attractive when the application needs:

```text
lexical + vector + filters + facets + security
```

A dedicated vector database may be attractive when:

- Vector scale dominates.
- Specialized vector indexes/features are central.
- Minimal lexical search is required.
- Operational ecosystem already uses it.

Evaluate:

- Recall.
- p99 latency.
- Filter performance.
- Update rate.
- Memory.
- Hybrid ranking.
- Multi-tenancy.

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch database-selection matrix
What to use: A matrix placing PostgreSQL, Cassandra, Redis, ClickHouse, Elasticsearch and vector databases by transactional, keyed, analytical, lexical and semantic query shapes.
Preferred source: Create an original diagram using official product characteristics.
Search terms: Elasticsearch vs PostgreSQL Cassandra Redis ClickHouse vector database
Purpose: Provide a quick HLD database-selection reference.
Alt text: Elasticsearch occupies the full-text and hybrid retrieval region between transactional, cache, keyed and analytical databases.
Editorial note: Avoid unsupported universal performance numbers.
-->

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch plus ClickHouse
What to use: One event pipeline feeding Elasticsearch for document search and ClickHouse for broad aggregation, with one UI choosing the appropriate backend.
Preferred source: Create an original architecture diagram.
Search terms: Elasticsearch ClickHouse logs architecture search analytics
Purpose: Show that search and OLAP stores can complement rather than replace each other.
Alt text: Elasticsearch serves relevance and document retrieval while ClickHouse serves large analytical aggregations over the same events.
Editorial note: Include Kafka/object storage as the shared source when useful.
-->

# Common Mistakes

## 264. Using Elasticsearch as the Transactional Source of Truth

Bad:

```text
Create order, reserve inventory and update payment state only in Elasticsearch.
```

Elasticsearch does not provide the relational transaction and constraint model required for this workflow.

Better:

```text
Transactional database owns the order.
Elasticsearch stores a searchable projection.
```

## 265. Treating an Index as a Relational Table

Bad:

```text
Normalize every entity and expect cheap joins.
```

Better:

```text
Model documents around retrieval and ranking needs.
Denormalize common display and filter fields.
```

## 266. Using `text` for IDs and Facets

Bad:

```json
"user_id": { "type": "text" }
```

Better:

```json
"user_id": { "type": "keyword" }
```

## 267. Using `keyword` for Natural-Language Search

Bad:

```text
Match arbitrary phrases against one exact keyword term.
```

Use a text field with an appropriate analyzer and optionally a keyword multi-field.

## 268. Uncontrolled Dynamic Mapping

Bad:

```text
Accept arbitrary JSON keys from every user.
```

This creates mapping explosion.

Use strict mappings, templates or flattened metadata.

## 269. One Index per Small Tenant

Thousands or millions of tiny tenant indices create:

- Excess shards.
- Large cluster state.
- Master pressure.
- Expensive recovery.

Use shared indices with tenant fields/routing unless isolation or scale justifies dedicated indices.

## 270. Too Many Tiny Shards

Bad:

```text
one primary shard for every tiny daily index
```

Use rollover by size and test shard targets.

## 271. One Huge Shard

A multi-terabyte shard can take too long to recover and cannot use multiple nodes for one shard copy.

Use an appropriate number of primary shards and rollover.

## 272. Deep Pagination with `from`

Bad:

```text
from = 500,000
size = 20
```

Use PIT and `search_after` for deep sequential traversal.

## 273. Aggregating on Analyzed Text

Bad:

```text
Enable fielddata on a huge description field to build brand facets.
```

Use a keyword field.

## 274. Leading Wildcard Everywhere

Bad:

```text
*foo*
```

on high-QPS large fields.

Use purpose-designed n-grams, wildcard fields or a different query experience.

## 275. Excessive Fuzziness

High edit distance and broad expansions create irrelevant results and CPU cost.

Use fuzziness selectively, especially for short terms.

## 276. Refreshing Every Write

Using `refresh=true` on every document:

- Reduces throughput.
- Creates many segments.
- Increases merge cost.

Use normal refresh intervals, `refresh=wait_for` for selected user workflows, or explicit batch refreshes.

## 277. Ignoring Bulk Item Failures

HTTP-level success does not mean every bulk item succeeded.

Inspect every item.

## 278. Retrying Non-Idempotent Updates Blindly

A timeout is ambiguous.

Use deterministic document IDs, source versions and optimistic concurrency.

## 279. No Reindex Strategy

Mappings and analyzers evolve.

Every production search system needs:

- Versioned indices.
- Aliases.
- Backfill.
- Change capture during migration.
- Validation.
- Rollback.

## 280. Returning Full `_source`

Large payloads can make fetch and network dominate search latency.

Return only the result-card fields.

## 281. Expensive Script Scoring Across All Matches

Use efficient candidate retrieval and rescore only a bounded top window.

## 282. High-Cardinality Aggregation without Limits

Grouping millions of user IDs can exhaust heap or trip breakers.

Use composite pagination, transforms, pre-aggregation or an OLAP database.

## 283. Using Nested for Every Object

Nested objects multiply Lucene documents and increase query/update cost.

Use normal objects where tuple-level matching is not required.

## 284. Parent-Child as Default Modelling

Parent-child queries have significant cost.

Denormalize unless the relationship and update economics strongly justify it.

## 285. No Disk Headroom

Segments, merges, relocation and recovery need free disk.

Operating near full disk causes allocation and write failures.

## 286. Assuming Replicas Are Backups

Deletes, bad mappings and logical corruption propagate.

Use snapshots and source replay.

## 287. Treating Yellow Health as Harmless Forever

Yellow means reduced redundancy. Another failure may cause data unavailability.

## 288. Two Master Nodes

A two-voter setup cannot safely retain majority after either side is isolated.

Use a supported majority topology.

## 289. Exposing Elasticsearch Publicly

Use private networking, TLS, authentication, least privilege and an application/query gateway.

## 290. Search without Relevance Evaluation

Manual tuning based on a few queries produces regressions.

Maintain a judged query set and measure ranking.

## 291. Mixing Analytics and Search without Isolation

One giant aggregation or export can starve latency-sensitive search.

Use workload controls or separate clusters.

## 292. Vector Search without Lexical Fallback

Embeddings can miss:

- Exact product codes.
- Names.
- Rare terms.
- Numbers.

Hybrid retrieval is usually safer.

## 293. Ignoring Search Freshness Budget

End-to-end visibility includes:

```text
source commit
+ event delivery
+ indexing
+ refresh
+ replica/cache behavior
```

Measure the entire path.

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch anti-patterns
What to use: Poster-style diagram showing dynamic mapping explosion, tiny shards, deep pagination, refresh-per-write, leading wildcard, fielddata on text and no disk headroom.
Preferred source: Create an original diagram from Elastic official best practices.
Search terms: site:elastic.co/docs Elasticsearch common mistakes best practices
Purpose: Provide a memorable interview revision visual.
Alt text: Common Elasticsearch mistakes include oversharding, uncontrolled mappings, expensive queries and unsafe indexing patterns.
Editorial note: Use concise before/after corrections.
-->

# Interview Decision Framework

## 294. Choose Elasticsearch When

```text
[ ] Full-text search is a core feature.
[ ] Relevance ranking matters.
[ ] Users combine text and structured filters.
[ ] Facets or search-time aggregations are required.
[ ] Documents can be denormalized.
[ ] Near-real-time visibility is acceptable.
[ ] Search index can be rebuilt or backed up.
[ ] Horizontal search scale is required.
[ ] Geo, typo tolerance, highlighting or vectors are useful.
[ ] The team can operate shards, mappings and lifecycle policies.
```

## 295. Avoid Elasticsearch When

```text
[ ] Multi-row ACID transactions are central.
[ ] Strong relational constraints are required.
[ ] Exact key-value lookup is the only query.
[ ] Broad columnar OLAP dominates.
[ ] Frequent partial updates dominate.
[ ] The dataset and search requirements fit PostgreSQL comfortably.
[ ] Strict immediate cross-document consistency is required.
[ ] The system needs a queue, counter or lock service.
```

## 296. Mapping Checklist

```text
[ ] List exact search, filter, sort and aggregation queries.
[ ] Choose text vs keyword deliberately.
[ ] Add multi-fields only for real access patterns.
[ ] Select numeric/date/geo types correctly.
[ ] Decide object vs nested vs flattened.
[ ] Control dynamic mapping.
[ ] Prevent mapping explosion.
[ ] Define analyzers and search analyzers.
[ ] Decide _source and returned fields.
[ ] Decide vector dimensions/model version.
[ ] Create an index template.
[ ] Test representative documents before production.
```

## 297. Index and Shard Checklist

```text
[ ] Estimate indexed bytes and retention.
[ ] Choose primary shard count from size and throughput.
[ ] Choose replica count from HA and read needs.
[ ] Define rollover conditions.
[ ] Define lifecycle tiers and deletion.
[ ] Spread copies across zones.
[ ] Avoid too many indices and shards.
[ ] Define custom routing only if justified.
[ ] Estimate recovery time.
[ ] Leave disk headroom.
```

## 298. Query Checklist

```text
[ ] Use match for analyzed text and term for exact fields.
[ ] Put binary conditions in filter context.
[ ] Limit returned _source fields.
[ ] Avoid unbounded wildcard/fuzzy queries.
[ ] Avoid deep from/size pagination.
[ ] Bound aggregation bucket count.
[ ] Verify query fan-out.
[ ] Profile slow queries.
[ ] Evaluate relevance against judged queries.
[ ] Use rescore for expensive top-N ranking.
[ ] Apply authorization before returning any search metadata.
```

## 299. Production Checklist

```text
[ ] Use at least three reliable master-eligible voters where appropriate.
[ ] Monitor cluster state and unassigned shards.
[ ] Configure snapshots and test restore.
[ ] Version indices and use aliases.
[ ] Inspect every bulk item result.
[ ] Implement backpressure and idempotent retry.
[ ] Monitor heap, disk, segments and merges.
[ ] Define source/index reconciliation.
[ ] Define search outage behavior.
[ ] Secure HTTP, transport and repository access.
```

<!-- IMAGE PLACEHOLDER
Title: Elasticsearch design decision tree
What to use: Flowchart from query requirements through database choice, document model, mapping, analyzer, shards, replicas, lifecycle and retrieval strategy.
Preferred source: Create an original diagram from this guide and Elastic best practices.
Search terms: Elasticsearch design decision tree mapping shards query
Purpose: Provide a reusable HLD interview workflow.
Alt text: The Elasticsearch design process starts from search queries and proceeds through mappings, shards, lifecycle and operations.
Editorial note: This should be the final summary diagram on the page.
-->

# Interview Questions and Answers

## 300. What Is Elasticsearch?

Elasticsearch is a distributed search and analytics engine built on Lucene. It indexes JSON documents into structures such as inverted indexes, doc values and point/vector indexes, then distributes those Lucene indexes as shards across cluster nodes.

## 301. Why Is Elasticsearch Fast for Search?

It performs expensive parsing and indexing work before the query. At search time it uses:

- Inverted indexes.
- Term dictionaries.
- Doc values.
- BKD trees.
- Segment-level data structures.
- Caches.
- Parallel shard execution.

## 302. What Is an Inverted Index?

A mapping from each indexed term to the documents containing that term, often with frequencies, positions and offsets.

## 303. What Is the Difference Between `text` and `keyword`?

`text` is analyzed into tokens for full-text relevance search. `keyword` stores the whole value as one exact term and supports filtering, sorting and aggregation.

## 304. What Is an Analyzer?

A pipeline of character filters, tokenizer and token filters that converts raw text into indexed or searched terms.

## 305. What Is the Difference Between Index Analyzer and Search Analyzer?

The index analyzer transforms document text during indexing. The search analyzer transforms user query text. They can differ, as in edge-ngram autocomplete.

## 306. What Is a Shard?

An Elasticsearch shard is one Lucene index containing a subset of an Elasticsearch index's documents.

## 307. Primary Shard vs Replica Shard?

The primary accepts and orders writes for its shard replication group. Replicas copy the shard for availability and additional search capacity.

## 308. Can the Number of Primary Shards Be Changed?

Not directly on an existing index. Use rollover, reindex, split or shrink depending on the direction and constraints.

## 309. Why Are Too Many Shards Bad?

Every shard consumes cluster state, heap metadata, file handles, thread work, segments and coordination. Distributed queries also fan out to every relevant shard.

## 310. How Do You Choose Shard Size?

Balance metadata overhead against recovery time, search performance and indexing throughput. Benchmark the workload; tens of gigabytes is a common starting range for many time-series shards, not a universal rule.

## 311. How Is a Document Routed?

Elasticsearch hashes the routing value—`_id` by default—to select a primary shard. Custom routing can improve locality but risks skew.

## 312. What Is Refresh?

Refresh writes buffered changes into new searchable Lucene segments and opens them for search. It controls near-real-time visibility.

## 313. What Is Flush?

Flush creates a Lucene commit and starts a new translog generation. It is different from refresh.

## 314. What Is the Translog?

The transaction log records recent shard operations for crash and replica recovery until they are safely represented in Lucene commits and retained history.

## 315. Why Are Segments Immutable?

Lucene writes search-optimized immutable structures. Updates create new document versions and mark old versions deleted; merges later reclaim space.

## 316. What Is Segment Merge?

A background process that combines segments, removes physically deleted documents and reduces segment count. It consumes disk and CPU.

## 317. Why Is Elasticsearch Near Real Time?

A successful write is not visible to search until refresh opens a segment containing it. The default refresh cadence balances freshness and indexing efficiency.

## 318. Why Can GET See a Document Before Search?

Real-time GET can use current shard/translog state. Search reads refreshed Lucene segments.

## 319. What Is Query Then Fetch?

Each shard computes local top hits, the coordinator merges them into global candidates, and then fetches source data for the final hits.

## 320. Why Does the Slowest Shard Matter?

A distributed search usually waits for every required shard. One overloaded or recovering shard can determine the request's tail latency.

## 321. Query Context vs Filter Context?

Query context computes relevance scores. Filter context performs binary matching without normal scoring and is preferred for structured constraints.

## 322. `term` vs `match` Query?

`term` searches an exact indexed term. `match` analyzes natural-language input before searching.

## 323. How Does BM25 Rank Documents?

It combines term rarity, saturating term frequency and field-length normalization, with configurable parameters.

## 324. What Are Doc Values?

Column-oriented on-disk field values used for sorting, aggregation and scripting.

## 325. Why Not Aggregate on a Text Field?

Analyzed text lacks normal doc values. Enabling fielddata can consume large heap. Use a keyword multi-field.

## 326. Object vs Nested?

Normal object arrays are flattened and lose tuple relationships. Nested mapping preserves each object as a hidden Lucene document at additional cost.

## 327. When Should Flattened Be Used?

For flexible metadata with arbitrary keys where exact keyword-like lookup is enough and mapping explosion must be avoided.

## 328. Why Avoid Parent-Child?

It adds significant query and global-ordinal cost. Denormalized documents are usually faster and simpler.

## 329. What Is Mapping Explosion?

Uncontrolled creation of thousands of fields, causing large cluster state, heap pressure and slow mapping updates.

## 330. How Does Deep Pagination Hurt?

With `from + size`, every shard collects many candidates that the coordinator later discards. Use PIT and `search_after`.

## 331. What Is a Terms Aggregation Accuracy Issue?

Each shard returns local top buckets. A globally important term can be absent from local candidate lists, causing approximate counts or omissions unless candidate size is sufficient.

## 332. What Is a Composite Aggregation?

A deterministic bucket aggregation that supports pagination through large key combinations using an `after_key`.

## 333. Why Are High-Cardinality Aggregations Expensive?

They create many bucket states and global ordinals, consuming heap, CPU and network.

## 334. What Is an Ingest Pipeline?

A server-side sequence of processors that transforms and enriches a document before indexing.

## 335. Why Use Bulk API?

It reduces network and coordination overhead by sending many operations together. Each item still succeeds or fails independently.

## 336. How Should Bulk Failures Be Retried?

Inspect item responses and retry only transient or rejected items with backoff. Preserve deterministic IDs or versions for idempotency.

## 337. What Is `wait_for_active_shards`?

A precondition controlling how many shard copies must be active before a write proceeds. It is not by itself a universal durability guarantee.

## 338. How Does Elasticsearch Handle Primary Failure?

The master promotes an in-sync replica, publishes updated routing and later allocates a replacement replica.

## 339. What Do Green, Yellow and Red Mean?

Green: all primaries and replicas allocated. Yellow: all primaries but some replicas missing. Red: at least one primary missing.

## 340. Why Use Three Master-Eligible Nodes?

A three-voter topology can retain a majority after one failure and prevents two disconnected sides from both electing a master.

## 341. What Is a Data Stream?

A logical name over a sequence of time-series backing indices with one current write index.

## 342. Why Rollover by Size?

It creates more consistent shard sizes than fixed calendar rollover under variable traffic.

## 343. What Are Hot, Warm, Cold and Frozen Tiers?

Storage tiers for progressively older and less frequently accessed data, trading query latency and local storage cost.

## 344. What Is a Searchable Snapshot?

An index mounted from a snapshot repository and queried using local cache plus remote repository data.

## 345. Why Is Replication Not Backup?

Logical errors and deletes propagate to replicas. Snapshots or source replay preserve independent recovery points.

## 346. How Do You Change an Analyzer?

Create a new index with the new mapping/analyzer, reindex/backfill, keep up with ongoing changes, validate and switch an alias.

## 347. Elasticsearch or PostgreSQL for Search?

Use PostgreSQL for basic search tied closely to transactional data at moderate scale. Use Elasticsearch when relevance, analyzers, facets, typo tolerance and distributed search are core requirements.

## 348. Elasticsearch or ClickHouse for Logs?

Use Elasticsearch when document retrieval, text search and interactive facets dominate. Use ClickHouse when broad structured aggregation and scan efficiency dominate. Some systems use both.

## 349. Elasticsearch or Cassandra?

Elasticsearch for search, relevance and flexible filters. Cassandra for high-write key-partition storage and predictable partition reads.

## 350. Elasticsearch or Redis?

Redis for cache and hot state; Elasticsearch for searchable document collections. Redis can cache popular search responses.

## 351. Exact vs Approximate Vector Search?

Exact search scores all filtered candidate vectors and provides exact ranking. Approximate kNN uses a graph/index to reduce work at the cost of recall.

## 352. What Is Hybrid Search?

Combining lexical and semantic/vector retrieval, often with rank fusion and reranking.

## 353. Why Keep Lexical Search with Vectors?

Lexical search excels at exact names, rare terms, product codes and numbers that embeddings may not retrieve reliably.

## 354. What Is the Biggest Elasticsearch Design Mistake?

Designing indices and mappings before writing down the actual search, filter, sort, aggregation, freshness and authorization requirements.

# Thirty-Second Summary

```text
Elasticsearch is a distributed search and analytics engine built on Lucene.

It is best for:
- Full-text search.
- Relevance ranking.
- Structured filters and facets.
- Logs and document exploration.
- Geospatial search.
- Vector and hybrid retrieval.

Its core design rules are:
- Model documents around retrieval, not relational normalization.
- Choose text vs keyword correctly.
- Control mappings and prevent field explosion.
- Size shards for both overhead and recovery.
- Use bulk indexing and bounded retry.
- Understand refresh, translog, segments and merges.
- Use query context for relevance and filter context for constraints.
- Avoid deep offset pagination and unbounded aggregations.
- Use data streams, rollover and lifecycle tiers for time-series data.
- Keep snapshots and a reindex/rebuild strategy.
- Evaluate relevance with real queries.

Do not use Elasticsearch by default for:
- Multi-row ACID transactions.
- Relational constraints.
- Counters, locks or queues.
- Simple key-value access.
- Broad columnar OLAP where search relevance is irrelevant.
```

<!--
EDITORIAL SOURCES TO VERIFY BEFORE PUBLISHING

Use the current official Elastic documentation as the primary source:

- What is Elasticsearch?
- Elasticsearch basics, indices and documents
- Cluster and node architecture
- Node roles
- Discovery and cluster coordination
- Shards and replicas
- Document routing
- Reading and writing documents
- Sequence numbers and optimistic concurrency
- Translog
- Near real-time search and refresh
- Lucene segments and merge behavior
- Mapping and field data types
- Text and keyword fields
- Object, nested, flattened and join fields
- Dynamic mappings, dynamic templates and mapping limits
- Text analysis, analyzers, tokenizers and token filters
- Synonyms
- Query DSL
- Query and filter context
- Relevance and similarity/BM25
- Aggregations
- Global ordinals
- Pagination, point in time and search_after
- Bulk API and indexing speed guidance
- Search speed guidance
- Shard sizing and oversharding
- Shard allocation awareness
- Data streams
- Rollover
- Index Lifecycle Management
- Data tiers
- Searchable snapshots
- Ingest pipelines
- Cross-cluster search
- Cross-cluster replication
- Snapshot and restore
- Snapshot Lifecycle Management
- Security, TLS, API keys and RBAC
- Dense vector, kNN, HNSW and hybrid search
- Monitoring, JVM, circuit breakers and thread pools
- Allocation explain and disk watermarks

VERSION-SENSITIVE NOTES

- Elastic documentation and API references now span current 9.x APIs and maintained 8.x references; verify the exact deployed product version.
- Vector indexing, quantization, hybrid ranking, RRF and semantic features evolve rapidly and may differ by version, deployment mode and subscription.
- Data Stream Lifecycle, ILM and serverless lifecycle capabilities differ by deployment type.
- Security features such as document-level and field-level security may depend on subscription.
- Heap sizing and node-role guidance should follow current Elastic recommendations rather than old fixed rules.
- Shard-size, QPS, latency, indexed-size and recovery numbers in this guide are interview heuristics or explicit assumptions, not Elasticsearch guarantees.
-->

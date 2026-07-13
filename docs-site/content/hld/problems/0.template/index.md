---
title: Template
slug: hld-template
summary: Generate short URLs, redirect users to original URLs, and track click analytics.
tags:
  - URL Shortener
  - Redirection
  - Analytics
difficulty: Hard
---

# A General Framework for Solving High-Level Design Interviews

High-Level Design (HLD) interviews test whether you can convert a vague product idea into a scalable, reliable, and understandable distributed-system design.

The interviewer is usually not looking for a diagram containing every technology you know. They want to see whether you can:

- clarify the product before designing it;
- identify the most important user workflows;
- translate product scale into traffic and storage estimates;
- choose APIs, databases, caches, queues, and communication protocols for concrete reasons;
- begin with a simple design and evolve it only when a measurable bottleneck appears;
- reason about consistency, availability, latency, durability, and fault tolerance;
- identify hot keys, contention, partial failures, and traffic spikes;
- explain trade-offs instead of presenting one design as universally correct.

This chapter provides a reusable framework for user-facing systems such as:

- URL Shortener;
- BookMyShow;
- Online Auction;
- Notification System;
- News Feed;
- Google Ads;
- YouTube;
- Uber;
- Payment System;
- E-commerce systems.

It also explains how to adapt the framework for infrastructure-oriented problems such as:

- Distributed Cache;
- Rate Limiter;
- Job Scheduler;
- Web Crawler;
- Metrics Monitoring;
- Unique ID Generator;
- Collaborative Document Editor;
- ChatGPT-like systems.

The exact components change from one problem to another, but the reasoning process remains largely the same.

---

## 1. The Complete Interview Flow

Use the following sequence during an HLD interview:

1. **Define the problem in one or two sentences.**
2. **Clarify functional requirements.**
3. **Declare what is out of scope.**
4. **Define non-functional requirements.**
5. **Estimate system scale, traffic, and storage.**
6. **Identify the major entities and data relationships.**
7. **Design one API or communication contract for each user-facing requirement.**
8. **Draw a simple end-to-end design for every major workflow.**
9. **Write the important access patterns or queries.**
10. **Find the first bottleneck using numbers.**
11. **Deep-dive into the bottleneck and evolve the design.**
12. **Handle failures, consistency, hot keys, contention, retries, and traffic spikes.**
13. **Summarize the final design and its trade-offs.**

Do not treat these as completely isolated phases. HLD is iterative.

For example:

- API design may reveal a missing functional requirement.
- Query analysis may reveal that the data model is unsuitable.
- Storage estimates may force partitioning.
- A consistency requirement may change the choice of database.
- A hot-key analysis may introduce a cache or an additional partitioning dimension.

Moving backward and refining the design is normal. What matters is that each change has a clear reason.

---

# Part I — Understand the Problem

## 2. Explain What the System Is

Begin by defining the system in one or two sentences.

This confirms that you and the interviewer are solving the same problem.

### Example: URL Shortener

> A URL shortener accepts a long URL, generates a compact unique alias, and redirects users who access that alias to the original URL. It may also collect redirect analytics.

### Example: Online Auction

> An online auction allows sellers to create time-bound auctions and buyers to place bids. The system must expose the latest valid bid, determine the winner, and prevent invalid or conflicting bids.

### Example: Metrics Monitoring

> A metrics monitoring system ingests timestamped measurements from services, stores them efficiently, supports time-range queries and aggregations, and evaluates alerting rules.

This opening definition should clarify:

- who uses the system;
- what its primary input is;
- what its primary output is;
- what differentiates it from a related system.

Do not spend several minutes explaining the product. The purpose is alignment, not a product lecture.

---

## 3. Functional Requirements

Functional requirements describe what users, administrators, external systems, or automated processes must be able to do.

Write them as complete, testable statements.

Prefer:

- `User should be able to create a short URL.`
- `User should be able to access the original URL using the short URL.`
- `System should record an access event after a successful redirect.`

Avoid vague statements such as:

- `Handle URLs.`
- `Support analytics.`
- `Make it scalable.`

The first two are functional requirements. “Make it scalable” is a non-functional requirement and still needs measurable targets.

---

## 3.1 Select the Core Requirements

Most HLD interviews cannot cover the entire product. Select approximately three to five core requirements.

A good set usually contains:

- at least one write workflow;
- its corresponding read workflow;
- one workflow that creates an interesting scale, consistency, or asynchronous-processing challenge.

### Example: URL Shortener

1. User should be able to create a short URL for a long URL.
2. User should be able to access the original URL using the short URL.
3. System should record an access event for every successful redirect.
4. User should be able to view the total access count for a short URL.

### Example: BookMyShow

1. User should be able to search for shows in a city.
2. User should be able to view available seats for a show.
3. User should be able to temporarily hold selected seats.
4. User should be able to pay and confirm a booking before the hold expires.

### Example: Online Auction

1. Seller should be able to create an auction.
2. Buyer should be able to view an auction and its current highest bid.
3. Buyer should be able to place a bid.
4. System should close the auction at the configured time and determine the winner.

Do not add requirements only because the real product supports them. Add a requirement when it helps define the interview scope.

---

## 3.2 Map Related Write and Read Requirements

Some requirements form a natural pair:

| Write workflow | Related read workflow |
|---|---|
| Create short URL | Redirect using short URL |
| Place bid | View current highest bid |
| Record click | View click count |
| Update profile | View profile |
| Publish post | Load news feed |
| Update product price | View price history |
| Hold seat | View seat availability |

These pairs are important because they help you discuss:

- how quickly a write must become visible;
- whether stale reads are acceptable;
- what happens during a network partition;
- whether caches and replicas may serve old data;
- whether the workflow needs conditional writes or serialization.

You do not need to force every requirement into a pair. Some workflows are independent or system-driven.

---

## 3.3 Declare Out-of-Scope Features

Explicitly excluding features prevents the discussion from expanding uncontrollably.

Typical exclusions include:

- authentication and authorization;
- recommendation ranking;
- advanced fraud detection;
- refunds and chargebacks;
- administrative dashboards;
- content moderation;
- multi-region active-active deployment;
- complex analytics dimensions;
- disaster-recovery implementation details.

### Example: URL Shortener

Out of scope:

- user authentication;
- editing and deleting URLs;
- malicious URL detection;
- custom domains;
- detailed analytics by browser, country, and device.

### Example: Online Auction

Out of scope:

- payment settlement;
- seller verification;
- fraud detection;
- shipping and fulfilment;
- dispute resolution.

Out of scope does not mean “unimportant.” It means “not part of the current design unless the interviewer chooses to add it.”

---

## 3.4 Confirm Ambiguous Product Semantics

Many design mistakes originate from unclear business rules rather than bad technology choices.

Ask questions that materially change the design.

### URL Shortener

- Can the same long URL generate multiple short codes?
- Are custom aliases supported?
- Can links expire?
- Must alias uniqueness be global?

### BookMyShow

- How long is a seat held?
- Can a user hold seats without initiating payment?
- Can partial bookings succeed?
- Is a seat assigned to only one show instance?

### Online Auction

- Must a bid exceed the latest bid by a minimum increment?
- Can the auction end time be extended when a last-second bid arrives?
- Is the displayed highest bid allowed to be stale?
- Are bids reversible?

### News Feed

- Is the feed chronological or ranked?
- Does a user need an exact view of all eligible posts?
- How are celebrity accounts handled?

Ask only questions that influence requirements, scale, data model, protocol, or consistency. Avoid spending interview time on cosmetic product details.

---

# Part II — Define the Non-Functional Requirements

## 4. Why Non-Functional Requirements Matter

Functional requirements tell us what the system does. Non-functional requirements determine how well it must do it.

A technically valid design may still be wrong if it:

- loses accepted writes;
- returns a stale auction bid;
- takes five seconds to redirect a URL;
- collapses under a celebrity hot key;
- cannot survive one server or availability-zone failure;
- costs far more than the business can justify.

For each important workflow, define measurable expectations for:

- availability;
- latency;
- throughput;
- consistency and staleness;
- durability;
- fault tolerance;
- retention;
- scale;
- hotspot behavior.

---

## 5. Fault Tolerance and No Single Point of Failure

A single point of failure is a component whose failure makes the entire critical workflow unavailable.

Examples include:

- one application server;
- one database instance;
- one message broker;
- one in-memory coordinator;
- one scheduler leader with no failover;
- one regional dependency in a supposedly multi-region system.

A strong initial requirement is:

> The system should tolerate the failure of an individual application instance and, where required, the failure of a single availability zone without losing acknowledged critical data.

This statement is more useful than simply saying “No SPOF” because it defines the failure boundary.

Clarify:

- Must the system survive a process failure?
- A machine failure?
- An availability-zone failure?
- A regional failure?
- Is temporary degradation acceptable?
- Can reads continue while writes are unavailable?
- Can some non-critical features be disabled during an incident?

Do not automatically design a global multi-region architecture. Its complexity is justified only when the availability target or disaster-recovery requirement demands it.

---

## 6. Consistency, Availability, and Staleness

This is one of the most commonly misunderstood parts of HLD interviews.

CAP does not mean that every system permanently chooses either consistency or availability. CAP describes the behavior of a distributed system when a network partition prevents nodes from communicating.

During such a partition, a workflow must decide whether to:

- reject or delay an operation to preserve a consistent view; or
- continue serving operations and accept that different nodes may temporarily disagree.

Outside a partition, systems still make many other consistency choices involving:

- synchronous versus asynchronous replication;
- cache invalidation;
- read replicas;
- materialized views;
- event propagation;
- session guarantees;
- transaction isolation.

Therefore, for each related write/read pair, ask a more concrete question:

> After a successful write, how soon must the related read reflect it, and what should happen when the system cannot guarantee that visibility?

---

## 6.1 Build a Consistency Table per Workflow

Use a table such as this:

| Write/read pair | Visibility requirement | Allowed staleness | Failure preference | Reason |
|---|---|---:|---|---|
| Create URL → redirect | Near-immediate | 0–2 seconds, if agreed | Usually availability-oriented after propagation | A newly created link may briefly fail or route through the authoritative store |
| Record click → view count | Eventual | 5–60 seconds | Availability over immediate consistency | Analytics can lag without affecting redirect correctness |
| Place bid → view highest bid | Strong or very low staleness | Usually none or a few milliseconds | Consistency over accepting conflicting bids | Stale bids can produce invalid auction outcomes |
| Hold seat → view availability | Strong for the seat invariant | No stale availability during booking | Consistency over availability for that seat | Two users must not own the same seat |
| Publish post → load feed | Eventual | Seconds | Availability over immediate fan-out consistency | A short feed delay is usually acceptable |

The exact numbers are assumptions. State them and allow the interviewer to change them.

---

## 6.2 Availability-Oriented Workflows

Choose availability over immediate consistency when the system can continue operating safely with temporary disagreement.

Examples:

- analytics counters;
- likes and view counts;
- social-feed propagation;
- search indexing;
- notification delivery;
- recommendation updates.

For these workflows, specify the staleness window.

### Example: URL click count

> A redirect event may take up to 30 seconds to appear in the analytics count. Redirect availability is more important than updating the dashboard synchronously.

This is much better than saying only “eventual consistency.”

Also explain:

- whether reads may be monotonic;
- whether a user should read their own write;
- whether duplicate processing is acceptable;
- how reconciliation occurs.

---

## 6.3 Consistency-Oriented Workflows

Choose consistency over availability when serving conflicting or stale data could violate a business invariant.

Examples:

- assigning the same seat to two users;
- accepting two winners for one auction;
- spending the same account balance twice;
- assigning the same unique alias to different URLs;
- acquiring the same lease by two workers.

During a partition or loss of quorum, the system may reject, delay, or retry the operation rather than risk violating the invariant.

State the invariant explicitly:

> At most one confirmed booking may exist for a show seat.

> A bid is accepted only if it is greater than the latest committed highest bid and the auction is still open.

> At most one active worker may own a particular job lease at a time.

The invariant is the reason for the consistency choice.

---

## 6.4 Consistency Is Often Local, Not System-Wide

One product can contain workflows with different consistency needs.

BookMyShow may use:

- strong consistency for seat holds and booking confirmation;
- eventual consistency for search indexing;
- eventual consistency for analytics;
- asynchronous notifications after confirmation.

An online auction may use:

- serialized or conditional writes for bids;
- eventually consistent page-view counters;
- asynchronous email notifications;
- cached auction metadata with a short TTL.

Do not label the entire product “CP” or “AP” and stop. Discuss the invariant and the data path for each critical workflow.

---

## 7. Define System Scale

Scale estimates do not need to be perfectly accurate. They need to be internally consistent and sufficient to expose bottlenecks.

Estimate only the numbers that affect the design.

Typical inputs are:

- number of users or customers;
- daily active users;
- number of active objects;
- actions per active user per day;
- peak multiplier;
- request and event sizes;
- retention period;
- read-to-write ratio;
- fan-out size;
- number of concurrent connections.

---

## 7.1 Existing System or New System?

### Existing system

When adding a feature to an existing product, reuse the scale of the parent system where appropriate.

Examples:

- live comments on an existing video platform;
- price history tracking for an existing e-commerce catalog;
- an advertising analytics feature on an existing ad network;
- reactions added to an existing messaging platform.

Ask:

- How many existing users or objects can use the new feature?
- What percentage are expected to adopt it?
- Does the new feature consume an existing event stream?
- Must it integrate with an existing datastore or API?

### New system

For a new system, estimate:

- addressable users or organizations;
- expected adoption;
- growth horizon;
- retention period.

A ten-year design horizon can be a convenient assumption for durable records, but do not mechanically apply it to every table. Many event tables have much shorter raw-data retention and longer aggregate retention.

Separate:

- **current scale** — what the system must support now;
- **growth target** — what it should support without a fundamental redesign;
- **retention horizon** — how long each type of data is stored.

---

## 7.2 Market Size, Registered Users, and DAU

These numbers answer different questions.

- **Market size** estimates the total possible number of customers or objects.
- **Registered users** estimate persistent account records.
- **DAU** estimates daily traffic-generating users.
- **Concurrent users** estimate simultaneous sessions or connections.

Do not use all registered users to calculate daily traffic unless the requirement says every account is active daily.

### Example

Assume:

- 100 million registered users;
- 20 million DAU;
- 10 feed loads per DAU per day.

Then:

```text
Daily feed requests
= 20 million × 10
= 200 million requests/day
```

Average throughput:

```text
200,000,000 / 86,400 ≈ 2,315 requests/second
```

At a `5×` peak:

```text
Peak throughput ≈ 11,600 requests/second
```

The arithmetic is simple. The value comes from connecting the estimate to design decisions.

---

## 7.3 Estimate Throughput for Every User-Facing Requirement

Calculate workload per functional requirement rather than declaring one global QPS.

A functional operation may perform several database reads and writes, so use product-specific terms first.

### Example: URL Shortener

| Requirement | Workload term | Estimate |
|---|---|---:|
| Create short URL | URL creations/second | 100 average, 500 peak |
| Redirect | Redirect requests/second | 100,000 average, 500,000 peak |
| Record access event | Access events/second | Same order as successful redirects |
| View count | Analytics queries/second | 1,000 average, 5,000 peak |

Later, when analysing a component, translate these into internal database reads, writes, cache operations, and broker events.

This avoids misleading statements such as “the system has 100,000 write TPS” when one request actually performs a read, a conditional write, and an event publication.

---

## 7.4 Average and Peak Traffic

Average traffic is useful for capacity and storage estimates. Peak traffic is what often determines whether the system remains available.

A common interview assumption is:

- normal peak: `3×–5×` average;
- exceptional campaign or event peak: `10×` or more.

Do not use the same multiplier blindly for all systems.

- Payroll traffic may spike at predictable times.
- Ticket booking may produce a sharp burst at sale opening.
- Live sports comments may spike during a goal.
- Emergency notifications may create correlated traffic.
- A crawler workload may be controlled internally rather than driven by users.

Explain whether the peak is:

- predictable or unexpected;
- global or isolated to one key;
- short-lived or sustained;
- read-heavy or write-heavy.

These distinctions determine whether autoscaling, caching, queuing, admission control, or pre-provisioning is most useful.

---

## 7.5 Set Latency Targets per Requirement

Do not use “as low as possible” as the final requirement. Every optimization has a cost.

Use a percentile and a workload-specific target.

### Example targets

| Workflow | Example latency target |
|---|---:|
| URL redirect | `p99 < 100 ms` at the service edge |
| Create short URL | `p99 < 300 ms` |
| Search shows | `p99 < 300 ms` |
| View seat availability | `p99 < 200 ms` |
| Place auction bid | `p99 < 200 ms` |
| Analytics dashboard | `p99 < 1–2 s` |
| Background notification delivery | 95% within 10 seconds |

These are interview assumptions, not universal standards.

Explain why one operation may tolerate more latency:

- a redirect is on a synchronous user-navigation path;
- an analytics dashboard performs a larger aggregation;
- a background notification is measured by delivery delay rather than HTTP response time.

---

## 7.6 Estimate Storage

For each large table or event stream, estimate:

```text
Rows = events or objects per day × retention days

Storage = rows × bytes per row × replication factor
```

Then add overhead for:

- indexes;
- metadata;
- storage-engine amplification;
- replicas;
- backups;
- materialized views or aggregates.

### Example: Click events

Assume:

- 100 million clicks/day;
- 100 bytes/event after compact encoding;
- 365 days raw retention;
- replication factor of 3.

Raw logical data:

```text
100,000,000 × 365 × 100 bytes
≈ 3.65 TB
```

With three replicas, before indexes and storage overhead:

```text
≈ 10.95 TB
```

The purpose is not to produce an exact procurement plan. The estimate tells you whether:

- one relational instance is enough;
- table partitioning is required;
- raw events need tiered storage;
- aggregates should be retained longer than raw data;
- a columnar or time-series store is justified.

---

## 7.7 Estimate Bandwidth When Payloads Are Large

Bandwidth often matters for:

- video and image systems;
- file storage;
- logs and metrics;
- model inference;
- web crawling;
- large fan-out streams.

Use:

```text
Bandwidth = operations/second × average payload size
```

Example:

```text
50,000 image responses/second × 200 KB
≈ 10 GB/second before caching
```

This immediately suggests CDN and object-storage delivery rather than serving every image through application servers.

---

## 8. Hot Keys, Celebrities, and Skew

Average load can look safe while one key overloads a partition, cache node, database row, or worker.

Common hot keys include:

- a celebrity profile or post;
- a viral short URL;
- a popular live stream;
- one product during a flash sale;
- one auction near its closing time;
- one global rate-limit counter;
- one tenant producing most metrics;
- one domain in a crawler frontier.

Ask:

- Is traffic uniformly distributed?
- Can one key receive thousands of times the average traffic?
- Is the hotspot read-heavy, write-heavy, or both?
- Can the key be replicated, split, buffered, or approximated?

Hot-key handling is often a separate deep dive, not a footnote.

---

## 9. Problem-Specific Non-Functional Requirements

Some systems have constraints that do not fit neatly into generic latency and throughput categories.

Examples:

### URL Shortener

- globally unique or tenant-unique aliases;
- low redirect latency;
- abuse prevention;
- hot-URL handling.

### Web Crawler

- politeness toward external domains;
- URL deduplication;
- freshness and recrawl policy;
- robots.txt compliance;
- trap detection.

### Scheduler

- at-most-one active execution where required;
- lease recovery;
- delayed and recurring jobs;
- retries and dead-letter handling.

### Metrics Monitoring

- high write throughput;
- timestamp ordering tolerance;
- label cardinality;
- retention and rollups;
- alert evaluation delay.

### Unique ID Generator

- uniqueness;
- ordering requirements;
- clock-skew behavior;
- availability when a generator node fails.

Write these explicitly because they frequently determine the core architecture.

---

# Part III — Identify Data and Interfaces

## 10. Core Entities

A complete class model is unnecessary in most HLD interviews, but a small entity list improves API and datastore design.

Tell the interviewer:

> I will first identify the main entities and relationships. I will keep the model lightweight here and add fields, keys, and indexes when we discuss the access patterns.

### Example: URL Shortener

- `ShortUrl`
- `AccessEvent`
- `User`, if ownership is in scope

### Example: BookMyShow

- `City`
- `Theater`
- `Screen`
- `Seat`
- `Movie`
- `Show`
- `ShowSeat`
- `Booking`
- `Payment`

### Example: Online Auction

- `Auction`
- `Bid`
- `Seller`
- `Bidder`
- `AuctionResult`

At this stage, identify:

- the entity identifier;
- ownership or tenant boundary;
- one-to-many relationships;
- immutable versus mutable data;
- high-volume event entities;
- data that has a lifecycle or expiry.

Do not spend excessive time normalizing every field before you know the query patterns.

---

## 10.1 Distinguish Source-of-Truth Data from Derived Data

This distinction prevents accidental consistency confusion.

### Source-of-truth data

Authoritative data that determines business correctness.

Examples:

- short-code mapping;
- confirmed booking;
- accepted auction bid;
- account balance ledger;
- job lease ownership.

### Derived data

Data computed or copied from authoritative state.

Examples:

- search index;
- click count;
- recommendation features;
- cached auction page;
- analytics rollup;
- user feed materialization.

Derived data can usually be rebuilt and may tolerate delay. Source-of-truth data usually needs stronger durability and invariants.

---

## 11. API and Communication Design

Design one external contract for every user-facing functional requirement.

For each contract, explain:

- protocol;
- endpoint or method;
- request;
- response;
- status codes or errors;
- pagination or streaming model;
- idempotency requirements;
- authentication boundary, even if auth implementation is out of scope.

Do not design APIs for internal implementation details unless the interviewer asks for service boundaries.

---

## 11.1 Choosing the Protocol

### HTTP/REST

Use for request-response workflows that map naturally to resources or commands.

Examples:

- create a short URL;
- search shows;
- fetch an auction;
- create a booking;
- query analytics.

### gRPC or another RPC protocol

Useful for internal service-to-service communication when you need:

- strongly defined schemas;
- efficient binary encoding;
- generated clients;
- low-latency internal calls;
- bidirectional streaming.

Do not choose gRPC only because it is faster. Consider browser support, debugging, compatibility, and whether HTTP/JSON is already sufficient.

### Server-Sent Events

Useful for server-to-client streams where the client mainly receives updates.

Examples:

- live auction-price updates;
- notification stream;
- job-progress events;
- live dashboard updates.

SSE works over HTTP and supports automatic reconnection, but communication is one-way from server to client.

### WebSocket

Useful for long-lived, bidirectional, low-latency communication.

Examples:

- collaborative document editing;
- chat;
- multiplayer games;
- live comments with client and server messages;
- interactive model streaming with control messages.

### Polling

Polling is often the simplest baseline for infrequent updates.

Start with polling when:

- freshness requirements are relaxed;
- updates are uncommon;
- the client population is limited;
- operational simplicity matters more than instant delivery.

Improve polling with:

- `updatedAfter` or cursor parameters;
- ETags or conditional requests;
- exponential backoff;
- long polling.

Then introduce SSE or WebSocket when polling overhead or freshness requirements justify a persistent connection.

Do not mechanically “start with polling” for inherently interactive systems such as collaborative editing. Begin with WebSocket or bidirectional streaming when the requirement clearly demands it.

---

## 11.2 REST API Design Rules

Use resource-oriented paths where possible.

Prefer:

```http
POST /v1/urls
GET  /v1/urls/{shortCode}
GET  /v1/urls/{shortCode}/analytics
```

Over:

```http
POST /v1/createShortUrl
GET  /v1/getLongUrl
```

For commands that do not fit cleanly into CRUD, action-style subresources are acceptable:

```http
POST /v1/auctions/{auctionId}/bids
POST /v1/bookings/{bookingId}/confirm
POST /v1/jobs/{jobId}:cancel
```

Use the API shape that makes semantics clear rather than forcing every operation into one style.

---

## 11.3 Example: Create Short URL

```http
POST /v1/urls
Idempotency-Key: 85d47d4c-...
Content-Type: application/json
```

```json
{
  "longUrl": "https://example.com/a/very/long/path",
  "customAlias": "design-notes",
  "expiresAt": "2027-01-01T00:00:00Z"
}
```

```json
{
  "shortCode": "design-notes",
  "shortUrl": "https://sho.rt/design-notes",
  "longUrl": "https://example.com/a/very/long/path",
  "expiresAt": "2027-01-01T00:00:00Z"
}
```

Possible outcomes:

- `201 Created` — mapping created;
- `409 Conflict` — custom alias already exists;
- `400 Bad Request` — invalid URL or expiry;
- `429 Too Many Requests` — creation limit exceeded.

---

## 11.4 Example: Place Auction Bid

```http
POST /v1/auctions/{auctionId}/bids
Idempotency-Key: 9fc31...
Content-Type: application/json
```

```json
{
  "amount": 12500,
  "currency": "INR",
  "expectedVersion": 42
}
```

```json
{
  "bidId": "bid-9081",
  "auctionId": "auction-17",
  "amount": 12500,
  "status": "ACCEPTED",
  "auctionVersion": 43
}
```

`expectedVersion` is one possible optimistic-concurrency mechanism. The database can accept the bid only if the auction has not changed since the client observed version `42`.

Do not add such fields without explaining the invariant they protect.

---

## 11.5 Pagination

Use cursor-based pagination for large or frequently changing result sets.

```http
GET /v1/auctions/{auctionId}/bids?limit=50&cursor=eyJ0cyI6...
```

A cursor typically encodes the last seen ordering key, such as:

- `(createdAt, id)`;
- `(score, id)`;
- `(eventTime, sequenceNumber)`.

Cursor pagination is preferable to large offsets because the database can continue from an indexed key rather than scan and discard many rows. It also behaves more predictably when new records are inserted.

Offset pagination remains acceptable for:

- small administrative datasets;
- bounded result sets;
- interfaces that require direct page numbers and can tolerate change between requests.

---

## 11.6 Idempotency

Retries are normal in distributed systems. A client may not know whether the server completed an operation before the connection failed.

Use an idempotency key for operations where duplicate execution is harmful:

- create payment;
- confirm booking;
- place order;
- create notification campaign;
- submit a job;
- create a short URL when the same request should return the same result.

Store:

```text
(idempotencyKey, callerId, requestHash, result, status, expiresAt)
```

When the same key is retried:

- return the stored result if the request matches;
- reject it if the key is reused with a different request body;
- continue or reconcile an in-progress operation according to the workflow.

Idempotency does not replace database constraints. Use both when necessary.

---

# Part IV — Draw the Baseline High-Level Design

## 12. Start Simple

Begin with the simplest architecture that can satisfy the clarified requirements at the initial scale.

A common baseline for a user-facing HTTP system is:

```text
Client
  → Load Balancer
  → Stateless Application Service
  → Primary Datastore
```

Add components only when a requirement or bottleneck needs them.

Do not begin with:

```text
CDN → Global LB → API Gateway → 12 microservices → Kafka → Redis
→ Cassandra → Elasticsearch → ClickHouse → Data Lake
```

A complicated first diagram makes it difficult to explain:

- which component is authoritative;
- why every component exists;
- which workflow uses which path;
- where failures are handled.

A strong interview design grows visibly:

1. baseline;
2. measured problem;
3. targeted optimization;
4. new trade-off.

---

## 13. Draw One Data Flow per Functional Requirement

For each requirement, trace the request from the client to the final storage or response.

### Example: Create short URL

```text
Client
  → URL Service
  → Short-code generation or alias validation
  → URL Database
  → Response
```

### Example: Redirect

```text
Browser
  → Redirect Service
  → URL Database
  → HTTP redirect response
  → Event Queue
  → Analytics Consumer
  → Analytics Store
```

### Example: Place bid

```text
Client
  → Auction Service
  → Read auction state
  → Conditional bid write / transaction
  → Publish accepted-bid event
  → Response
```

This flow exposes important questions:

- Is the event publication synchronous?
- What happens if the database commits but publishing fails?
- Is the read followed by a conditional write?
- Which response can be returned before background work completes?

---

## 13.1 Use a Consistent Arrow Legend

A diagram becomes easier to inspect when arrows have a meaning.

One useful convention is:

- **dotted arrow** — read;
- **solid arrow** — write or command;
- **double-headed arrow** — long-lived bidirectional connection;
- **different annotation** — asynchronous event or stream.

The specific visual style is less important than consistency. Add a small legend to the diagram.

If one request performs both reads and writes, draw both.

For example, placing an auction bid may require:

1. reading the auction status and current bid;
2. conditionally inserting the new bid;
3. updating current-auction state;
4. publishing an event.

A single arrow labelled “bid” hides the core correctness problem.

---

## 13.2 Annotate Storage with Keys

When drawing a table or datastore, note the important key.

```text
Urls
PK: shortCode
```

```text
Bids
PK: (auctionId, bidSequence)
Index: (auctionId, amount DESC)
```

```text
AccessEvents
Partition key: shortCode + eventDate
Clustering/order key: eventTime
```

The annotation connects the diagram to the access pattern and makes later discussions about indexes, partitions, and hot keys easier.

Do not attempt to write a complete production schema inside every box.

---

## 14. Start with a Relational Database When It Is a Reasonable Baseline

PostgreSQL is a useful default starting point for many interview problems because it provides:

- transactions;
- uniqueness and foreign-key constraints;
- flexible indexing;
- rich query support;
- mature operational tooling;
- a simple source of truth while requirements are still evolving.

This does not mean PostgreSQL is always the final answer.

Start elsewhere when the workload is clearly specialized from the beginning:

- an object store for large immutable files;
- a search engine for full-text retrieval;
- a time-series database for metric samples and rollups;
- a wide-column or log-structured store for enormous partitioned write throughput;
- a graph store for deeply connected traversal-heavy workloads, if relational modelling is demonstrably unsuitable.

A good explanation is:

> I will start with PostgreSQL as the authoritative store because the initial data model is relational and the booking invariant benefits from transactions. I will introduce specialized stores only for access patterns that PostgreSQL cannot meet economically at the required scale.

Avoid saying “always start with SQL” as an absolute rule.

---

## 14.1 Model from Access Patterns

For every important read, write the access pattern.

### URL redirect

```sql
SELECT long_url, expires_at
FROM urls
WHERE short_code = ?;
```

The primary key should support this point lookup.

### Show search

```sql
SELECT id, screen_id, start_time
FROM shows
WHERE city_id = ?
  AND movie_id = ?
  AND start_time >= ?
  AND start_time < ?
ORDER BY start_time
LIMIT ?;
```

A useful index may begin with:

```text
(city_id, movie_id, start_time)
```

### Bid history

```sql
SELECT id, bidder_id, amount, created_at
FROM bids
WHERE auction_id = ?
  AND (created_at, id) < (?, ?)
ORDER BY created_at DESC, id DESC
LIMIT ?;
```

A useful index may be:

```text
(auction_id, created_at DESC, id DESC)
```

Writing the important query often reveals whether the schema and index order are correct.

You do not need to write SQL for every trivial lookup. Prioritize the queries that determine storage design or latency.

---

## 15. Choose the Load Balancer by Traffic Type

For ordinary HTTP APIs, an L7 load balancer is a common choice because it can route using:

- host;
- path;
- headers;
- cookies;
- request metadata.

It may also terminate TLS, apply rate limits, and support health checks.

For generic TCP protocols or very large numbers of long-lived connections, L4 load balancing may reduce overhead and preserve transport-level behavior.

WebSocket begins with an HTTP upgrade, so both L7 and L4 architectures are possible. The decision depends on:

- whether path- or header-based routing is needed;
- connection duration;
- connection count;
- proxy support for upgrades;
- idle timeouts;
- connection draining;
- sticky routing requirements.

Do not use the simplistic rule “HTTP means L7 and WebSocket means L4” without discussing these requirements.

---

# Part V — How to Perform a Deep Dive

## 16. The Deep-Dive Method

Do not add every possible optimization. Select the part of the design most likely to fail the stated requirement.

For each deep dive:

1. Restate the requirement.
2. Describe the current path.
3. Estimate its load or cost.
4. Identify the bottleneck.
5. Apply the smallest useful optimization.
6. Explain the new trade-off or failure mode.
7. Repeat only if the requirement is still not met.

### Example

Requirement:

```text
Redirect latency: p99 < 100 ms at 500,000 peak redirects/second.
```

Current approach:

```text
Every redirect performs a primary-database lookup.
```

Problem:

- database read load is extremely high;
- popular URLs create hot keys;
- cross-region database access may dominate latency.

First optimization:

```text
Cache shortCode → longUrl mappings.
```

New questions:

- cache miss behavior;
- invalidation on expiry or deletion;
- hot-key replication;
- cache-node failure;
- negative caching;
- consistency after creation.

This is a focused deep dive. Listing ten databases without tracing the request is not.

---

# Part VI — Read Latency

## 17. Begin with the Query and Data Size

When a read is too slow, first determine:

- what the query filters by;
- how many rows it scans;
- whether it sorts or joins;
- how much data it returns;
- whether the required data is already ordered;
- whether it is a point, range, aggregate, search, or graph query;
- the logical and physical table size.

Do not estimate latency by dividing the entire table size by disk or network bandwidth when the query uses an index. That calculation models a full scan, not an indexed lookup.

Use the actual query plan conceptually:

```text
index lookup → matching rows → sort/aggregate if needed → result transfer
```

---

## 18. Query Optimization Order

A useful order is:

1. verify the access pattern and schema;
2. add or correct indexes;
3. reduce returned columns and rows;
4. use cursor pagination;
5. partition or bucket very large ranges;
6. precompute frequently requested results;
7. cache reused results;
8. route static content through a CDN;
9. choose a specialized datastore when the workload requires it;
10. shard when one database cannot meet storage or throughput requirements.

This is not a rigid law. It prevents jumping to distributed complexity before fixing a poor query.

---

## 19. Indexing

Indexes are usually the first optimization for selective relational queries.

Choose index columns from:

- equality filters;
- range filters;
- ordering;
- join keys;
- uniqueness requirements.

For a composite B-tree index, column order matters.

Example query:

```sql
SELECT price, observed_at
FROM price_history
WHERE product_id = ?
  AND observed_at >= ?
  AND observed_at < ?
ORDER BY observed_at;
```

Useful index:

```text
(product_id, observed_at)
```

The database can locate one product and scan only the requested time range in order.

### Index trade-offs

Indexes improve reads but add:

- storage overhead;
- write amplification;
- maintenance during inserts and updates;
- longer bulk loads;
- possible cache pressure.

When estimating final write capacity, include the indexes needed for the read paths.

---

## 20. Cursor Pagination Instead of Large Offsets

Offset query:

```sql
SELECT ...
FROM bids
WHERE auction_id = ?
ORDER BY created_at DESC
LIMIT 50 OFFSET 500000;
```

The database may still need to walk or process a large number of preceding entries.

Cursor query:

```sql
SELECT ...
FROM bids
WHERE auction_id = ?
  AND (created_at, id) < (?, ?)
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

The cursor begins from an indexed position.

Cursor pagination also reduces duplicates and missing rows caused by inserts between page requests, although exact behavior depends on ordering and snapshot semantics.

---

## 21. Time Bucketing and Partitioning

Large time-range tables are often divided by day, month, tenant, or another bounded dimension.

Examples:

```text
price_history_2026_07
access_events_2026_07_12
metrics partitioned by day
```

Or at the application key level:

```text
partitionKey = hash(productId) + month
```

Bucketing helps with:

- pruning irrelevant partitions;
- retention and deletion;
- distributing writes;
- preventing one unbounded partition;
- parallel query execution.

But too many tiny buckets increase metadata and query fan-out. Choose bucket size from:

- event rate per key;
- common query window;
- retention operations;
- datastore partition limits.

---

## 22. Precomputation and Denormalization

If a result is requested frequently but expensive to compute, calculate it before the read request.

Examples:

- total clicks per URL;
- daily campaign statistics;
- feed entries per user;
- product-price daily candles;
- top-K items per category;
- unread count per conversation.

Possible implementations:

- counter or aggregate table;
- materialized view;
- stream processor;
- scheduled batch job;
- write-time fan-out;
- database trigger, where operationally appropriate.

### Trade-off

Precomputation shifts work from read time to write or background-processing time and introduces synchronization questions:

- How stale may the aggregate be?
- Can events arrive late or out of order?
- How are duplicates removed?
- Can the aggregate be rebuilt?
- What is the source of truth?

---

## 22.1 Materialized Views Are Not the Same as Caches

A materialized view stores the result of a query or a derived representation inside a data platform. It may be refreshed:

- synchronously;
- incrementally;
- periodically;
- on demand.

A cache stores data primarily to reduce access latency and load. It normally has eviction, TTL, and miss behavior.

They can solve overlapping read-performance problems, but their operational semantics differ.

Use a materialized view when:

- the derived result is a durable query surface;
- database-managed refresh is useful;
- the result needs relational or analytical querying.

Use a cache when:

- the same result is repeatedly requested;
- low-latency access is essential;
- misses can fall back to an authoritative source;
- temporary eviction is acceptable.

Caching can be highly significant. It is not inherently less useful than a materialized view.

---

## 23. Caching

A cache is effective when:

- reads repeat for the same keys;
- the working set fits economically in memory;
- a miss can be served from a source of truth;
- some staleness is acceptable or invalidation is manageable;
- the workload is read-heavy or has hot keys.

Caching is not determined simply by whether “writes are high” or “writes are low.” The decisive factors are read reuse, freshness, invalidation cost, and miss behavior.

### Common cache patterns

#### Cache-aside

```text
read cache
  → hit: return
  → miss: read database → populate cache → return
```

Simple and common, but concurrent misses can create a cache stampede.

#### Read-through

The cache layer loads missing data through a configured backend abstraction.

#### Write-through

The application writes through the cache to the backing store.

#### Write-behind

The cache acknowledges first and persists asynchronously. This can reduce latency but increases durability and reconciliation complexity.

### Cache questions

- What is the cache key?
- What is the TTL?
- Who invalidates it?
- Can stale data violate an invariant?
- What happens when the cache is unavailable?
- How are hot keys replicated?
- Is negative caching needed?
- How is stampede prevention handled?

Possible stampede controls include:

- request coalescing;
- per-key locking;
- probabilistic early refresh;
- TTL jitter;
- stale-while-revalidate;
- prewarming known hot keys.

---

## 24. CDN

Use a CDN for cacheable content that can be served close to users.

Examples:

- images;
- videos;
- static web assets;
- public documents;
- downloadable files;
- sometimes public redirect mappings or API responses, with careful cache control.

A CDN reduces:

- origin bandwidth;
- application-server load;
- geographic latency;
- repeated transfer of immutable content.

Discuss:

- cache key;
- TTL;
- signed URLs or access control;
- invalidation;
- origin failover;
- range requests;
- regional cache miss behavior.

Do not route highly personalized or strongly consistent responses through a CDN unless the cache semantics are explicitly designed.

---

## 25. Co-locate Related Data

When a request frequently needs several related rows, storing them on the same shard or partition can avoid cross-shard fan-out.

Examples:

- all bids for one auction;
- messages for one conversation;
- events for one device and time bucket;
- comments for one post;
- seat state for one show.

Choose a partition key that matches the dominant access pattern.

Trade-off:

- one popular key may become a hotspot;
- some secondary queries require scatter-gather or another index;
- repartitioning becomes expensive if the key choice changes.

Indexing and co-location solve different problems. An index locates data efficiently; co-location controls where related data physically resides in a distributed system.

---

## 26. Time-Series Databases

A time-series database is useful for workloads dominated by:

- timestamped measurements;
- append-heavy ingestion;
- time-window filtering;
- rollups and downsampling;
- retention policies;
- time-based compression;
- functions such as rate, percentile, and moving average.

It is especially common for infrastructure and product metrics.

Cardinality matters because combinations of labels or dimensions can create an enormous number of series. However, “TSDB is only for low cardinality” is too broad. Different systems support different cardinality levels and storage models.

Ask:

- What forms a series key?
- How many unique label combinations exist?
- Are labels bounded or user-controlled?
- What is the sample interval?
- How are old samples downsampled?
- Are late or out-of-order samples accepted?

A time-series database is not automatically the best choice for every time-stamped business event. If the main workload is ad-hoc multidimensional analytics, a columnar OLAP system may be more suitable.

---

## 27. OLAP Stores

Use an analytical or columnar store when queries scan and aggregate large datasets across multiple dimensions.

Examples:

- campaign analytics by date, country, device, and placement;
- product sales grouped by category and region;
- event funnels;
- large time-range reports;
- arbitrary analyst queries.

OLAP systems optimize for:

- column pruning;
- compression;
- vectorized execution;
- partition pruning;
- distributed aggregation;
- large scans.

They are usually not the source of truth for latency-sensitive transactional invariants.

A common architecture is:

```text
Transactional service
  → event stream / change-data capture
  → stream or batch transformation
  → OLAP store
```

This creates an explicit staleness window between the transactional write and analytical visibility.

---

# Part VII — Streaming Reads: SSE and WebSocket

## 28. Persistent Connection Architecture

A persistent-connection system commonly contains:

```text
Client
  ↔ Connection Gateway
  ↔ Connection Registry / Presence Store
  ← Pub/Sub or Event Stream
  ← Producing Services
```

The connection gateway owns active sockets. Producing services should not need to know which machine holds a particular client connection.

The registry may map:

```text
userId or channelId → gateway instance / connection metadata
```

Events are routed to the responsible gateways through a broker, topic, or channel system.

---

## 28.1 Redis Pub/Sub as a Baseline

Redis Pub/Sub is simple for low-latency ephemeral fan-out.

It can be appropriate when:

- missing an event during disconnection is acceptable;
- consumers do not need replay;
- the fan-out scale is manageable;
- operational simplicity is more important than durable delivery.

Its important limitation is that messages are not durably retained for disconnected consumers.

When replay, acknowledgment, ordering, or recovery is required, consider a durable log or queue such as:

- Kafka-like partitioned log;
- Redis Streams;
- a managed message broker;
- a database-backed event stream.

Do not describe all real-time systems as “Redis Pub/Sub.” Choose based on delivery semantics.

---

## 28.2 Persistent-Connection Deep-Dive Questions

Discuss:

- maximum concurrent connections;
- connection establishment rate;
- heartbeat and idle timeout;
- reconnect storms;
- connection draining during deployment;
- authentication refresh;
- message ordering;
- per-client backpressure;
- slow consumers;
- dropped or replayed messages;
- fan-out amplification;
- regional routing.

### Backpressure

A server cannot buffer unlimited messages for a slow client.

Possible policies:

- disconnect and force replay;
- drop replaceable updates, such as intermediate cursor positions;
- retain only the latest state snapshot;
- bound the queue and apply per-client limits;
- degrade update frequency.

The right policy depends on whether every event matters or only the latest state matters.

---

# Part VIII — Write Throughput and Write Latency

## 29. Recalculate Internal Write Load

External request throughput is not the same as database write throughput.

One user action may produce:

- one source-of-truth row;
- several secondary-index updates;
- replication to multiple nodes;
- an outbox record;
- one or more events;
- aggregate updates;
- search-index updates;
- audit logs.

Example:

```text
100,000 accepted events/second
× replication factor 3
× 2 storage structures
```

This is already much more internal work than 100,000 physical writes/second.

Exact storage-engine amplification is implementation-specific, but the interview should acknowledge it.

---

## 30. Vertical Scaling

Before sharding, a larger database machine may provide:

- more CPU;
- more memory for buffer cache;
- faster storage;
- higher network bandwidth;
- simpler operations.

Vertical scaling is often the correct early-stage solution.

Limitations:

- finite machine sizes;
- larger failure domain;
- expensive step changes;
- maintenance and failover complexity;
- no solution for unbounded growth.

Use it as one stage in the evolution, not as an ideological failure.

---

## 31. Horizontal Partitioning and Sharding

Sharding distributes data and load across multiple database nodes.

Choose the shard key from:

- query locality;
- write distribution;
- tenant boundaries;
- hotspot risk;
- resharding requirements.

Examples:

```text
hash(userId)
hash(shortCode)
auctionId
conversationId
hash(deviceId) + timeBucket
```

### Good shard key

- distributes ordinary traffic;
- keeps frequent related operations local;
- has enough cardinality;
- does not grow one partition without bound.

### Sharding trade-offs

- cross-shard joins and transactions;
- scatter-gather queries;
- resharding;
- global uniqueness;
- rebalancing hot partitions;
- operational complexity.

Do not introduce sharding only because the word “scale” appears in the prompt. Use storage and throughput estimates to justify it.

---

## 32. Batching

Batching amortizes network, serialization, and storage overhead.

Examples:

- insert 1,000 analytics events together;
- flush metric samples every second or when a buffer reaches a limit;
- group notification jobs by provider;
- batch object-store metadata updates.

Trade-offs:

- additional buffering latency;
- memory consumption;
- larger retry units;
- duplicate handling;
- partial-batch failure semantics.

Use both:

- a maximum batch size;
- a maximum wait time.

This prevents low-volume traffic from waiting indefinitely.

---

## 33. Queueing and Log-Based Ingestion

A queue or durable log decouples request acceptance from downstream processing.

```text
Producer
  → Broker
  → Consumer group
  → Datastore or external system
```

Useful for:

- analytics ingestion;
- notifications;
- search indexing;
- feed fan-out;
- media processing;
- audit events;
- background model inference.

Benefits:

- absorbs bursts;
- enables consumer scaling;
- isolates downstream failures;
- supports retries and replay;
- smooths traffic.

Trade-offs:

- eventual consistency;
- duplicate delivery;
- ordering constraints;
- queue growth;
- operational complexity;
- harder end-to-end debugging.

A queue does not create infinite capacity. If producers remain faster than consumers, lag grows until retention, memory, disk, or business freshness limits are exceeded.

Track:

- enqueue rate;
- consume rate;
- lag;
- oldest-message age;
- retry rate;
- dead-letter volume.

---

## 34. Choosing a High-Write Datastore

A log-structured or wide-column datastore may be useful when the workload has:

- massive append or upsert throughput;
- predictable partition-key access;
- large horizontal scale;
- limited cross-partition transactions;
- tolerance for denormalized query-specific tables.

Examples include Cassandra-like systems and some managed key-value stores.

Do not describe any datastore as “infinitely scalable.” Every system has limits involving:

- partition size;
- hot keys;
- compaction;
- repair;
- network bandwidth;
- coordination;
- operational cost.

Choose the database from the access pattern and consistency requirement, not from a generic scale ranking.

---

## 35. Reduce Synchronous Write Latency

A synchronous request should perform only the work needed before the client can safely receive success.

Move non-critical work asynchronously:

- analytics;
- email and push notifications;
- search indexing;
- thumbnails;
- recommendation updates;
- audit enrichment.

Possible response:

```http
202 Accepted
```

Use `202` when the requested operation itself is accepted for later completion rather than already complete.

Do not return success before durable acceptance if losing the operation is unacceptable.

For example:

- writing only to a process-local memory buffer before returning may lose data;
- writing to a replicated durable broker before returning may satisfy the durability requirement;
- confirming a booking before the authoritative transaction commits is incorrect.

---

## 35.1 The Dual-Write Problem

A common flow is:

```text
write database
publish event
```

Failure cases:

- database commits, event publication fails;
- event publishes, database transaction rolls back;
- retry publishes a duplicate event.

Use the transactional outbox pattern when the database update and event intent must be atomic.

```text
Database transaction:
  update business table
  insert outbox row

Outbox relay:
  read unpublished rows
  publish event
  mark published
```

Consumers must still be idempotent because a relay can publish the same event more than once.

Other possibilities include change-data capture or a datastore with integrated streaming, depending on the platform.

---

## 36. Load Shedding and Admission Control

During overload, preserving critical workflows may require rejecting or degrading less important work.

Possible actions:

- enforce per-user and global rate limits;
- return `429` or `503` with retry guidance;
- reject requests before expensive processing;
- cap queue depth;
- disable non-essential features;
- serve stale cached data;
- sample low-value analytics;
- reduce recommendation complexity;
- prioritize paid or critical traffic only when product policy allows it.

Load shedding is often safer than allowing every request to enter and time out after consuming resources.

---

# Part IX — Read Throughput

## 37. Read Replicas

Read replicas increase read capacity when:

- reads dominate writes;
- replicas can apply changes fast enough;
- the workflow tolerates replication lag;
- queries can be routed away from the writer.

Use the primary or a strongly consistent read path for operations that require:

- read-your-own-write immediately after mutation;
- latest auction bid;
- current seat state;
- balance or inventory validation.

Use replicas for:

- historical pages;
- profiles with tolerant staleness;
- reports;
- search-like browsing;
- non-critical metadata.

Discuss failover and lag monitoring. A replica that is alive but far behind may be unsuitable for the request.

---

## 38. Caching for Read QPS

Caching reduces source-database read load when many requests reuse the same data.

Common examples:

- URL mappings;
- product metadata;
- user profiles;
- configuration;
- feed pages;
- popular search results.

The key questions remain:

- hit ratio;
- working-set size;
- freshness;
- invalidation;
- hot-key distribution;
- miss amplification.

A cache with a poor hit rate may add complexity without materially reducing database load.

---

## 39. Read Replica or Cache?

They solve different problems.

| Read replica | Cache |
|---|---|
| Stores a broad copy of database data | Stores a selected working set |
| Usually disk-backed database engine | Usually memory-oriented |
| Supports database queries | Usually key-based or limited queries |
| Replication lag determines freshness | TTL/invalidation determines freshness |
| Helps distribute broad read load | Excels at repeated hot reads |
| Can become a failover candidate | Usually not authoritative |

Many systems use both.

Choose from access patterns rather than a rule such as “replicas when writes are low, cache when writes are high.”

---

# Part X — Fault Tolerance and High Availability

## 40. Stateless Application Servers

Run multiple application instances across failure domains.

```text
Load Balancer
  → App instance A
  → App instance B
  → App instance C
```

Keep durable session state outside the process when possible so any healthy instance can handle a request.

Use:

- health checks;
- connection draining;
- rolling or canary deployment;
- autoscaling based on meaningful signals;
- timeouts and resource limits.

For long-lived connections, also maintain connection ownership and graceful reconnection.

---

## 41. Database High Availability

A relational database may use:

- primary with synchronous or asynchronous standbys;
- automatic failover;
- backups and point-in-time recovery;
- read replicas;
- multi-AZ deployment;
- sharding when one group is insufficient.

Clarify:

- which writes are acknowledged only after replication;
- expected recovery-point objective;
- expected recovery-time objective;
- whether failover is automatic;
- how clients discover the new primary;
- whether stale replicas can be promoted.

Replication is not a substitute for backups. A logical deletion or corrupted write can replicate to every node.

---

## 41.1 Quorum Reads and Writes

In a replicated datastore with replication factor `N`:

- `W` is the number of replicas that must acknowledge a write;
- `R` is the number consulted for a read.

When:

```text
R + W > N
```

read and write quorums overlap, which can help the read observe the latest successful write under the datastore's consistency model.

Additional conditions and repair behavior still matter. This formula alone does not guarantee zero data loss.

Durability depends on:

- what “acknowledged” means;
- whether data reached durable storage;
- replica failure correlation;
- hinted handoff and repair;
- conflict resolution;
- failure and recovery timing.

Use quorum terminology only when it applies to the selected database.

---

## 42. Message Broker High Availability

A broker should avoid a single leader, disk, or coordinator becoming a system-wide failure.

Discuss:

- replicated partitions or queues;
- producer acknowledgments;
- consumer offsets or acknowledgments;
- leader election;
- partition distribution across zones;
- retry topics or dead-letter queues;
- retention;
- broker backpressure.

For critical events, clarify whether success means:

- accepted by one broker;
- replicated to a quorum;
- processed by a consumer;
- committed to the final datastore.

These are different guarantees.

---

## 43. Coordination Services

Some systems need coordination for:

- leader election;
- distributed locks;
- membership;
- configuration;
- shard ownership;
- job leases.

A ZooKeeper- or consensus-based service may be appropriate, but do not introduce it merely to make the diagram look distributed.

Modern platforms may already provide consensus or lease primitives through:

- the database;
- the message broker;
- a container orchestrator;
- a managed coordination service.

Explain the exact coordination problem and what happens when the coordinator is unavailable.

---

## 44. Retries, Timeouts, and Circuit Breakers

Every network call can fail or become slow.

For each remote dependency define:

- timeout;
- retry policy;
- retryable errors;
- maximum attempts;
- backoff and jitter;
- idempotency behavior;
- circuit-breaker or fail-fast policy;
- fallback.

Do not retry every error.

Examples:

- retry a transient timeout;
- do not retry an invalid request;
- retry a conditional-write conflict only after re-reading state;
- do not blindly retry a payment without idempotency.

Retries multiply traffic during incidents. Use exponential backoff with jitter and a retry budget.

---

## 45. Graceful Degradation

A system can remain partially useful when a dependency fails.

Examples:

- serve cached product pages when recommendations are unavailable;
- redirect URLs even when analytics ingestion is down;
- accept events into a durable broker while the analytics store is unavailable;
- show a chronological feed when ranking is unavailable;
- hide live viewer counts while preserving video playback.

Identify:

- critical path;
- optional dependencies;
- fallback response;
- maximum fallback duration;
- reconciliation after recovery.

This is often more realistic than trying to make every component equally available.

---

# Part XI — Transactions, Contention, and Correctness

## 46. When Distributed Transactions Are Needed

A preference for consistency does not automatically imply a distributed transaction.

First try to keep the invariant inside:

- one database row;
- one partition;
- one database transaction;
- one authoritative service.

Use conditional writes, unique constraints, or transactions local to that boundary.

A distributed transaction becomes relevant when one atomic invariant spans independently managed resources and the business cannot tolerate intermediate states.

Examples:

- updating two separate databases that must commit together;
- reserving inventory and charging payment under a strict all-or-nothing contract;
- moving money between ledgers owned by separate transactional systems.

Even then, alternatives may include:

- reservation plus confirmation;
- saga with compensation;
- escrow;
- transactional outbox;
- asynchronous reconciliation.

Choose based on the invariant and acceptable intermediate states.

---

## 47. Optimistic Concurrency Control

Use optimistic concurrency when conflicts are possible but not extremely frequent.

Example:

```sql
UPDATE auctions
SET highest_bid = ?,
    highest_bidder_id = ?,
    version = version + 1
WHERE id = ?
  AND version = ?
  AND status = 'OPEN'
  AND end_time > NOW()
  AND highest_bid < ?;
```

If zero rows are updated, the caller re-reads the auction and decides whether to retry or reject the bid.

Benefits:

- no long-held lock across application processing;
- works across multiple service instances;
- simple conflict detection.

Limitations:

- high contention causes retries;
- the condition must include the complete invariant;
- retry behavior needs idempotency.

---

## 48. Pessimistic Locking

A database transaction can lock a row while validating and updating it.

```sql
SELECT *
FROM show_seats
WHERE show_id = ? AND seat_id IN (...)
FOR UPDATE;
```

Then verify and update within the same transaction.

Useful when:

- conflicts are common;
- the critical section is short;
- waiting is preferable to repeated retries.

Trade-offs:

- reduced concurrency;
- deadlocks;
- lock timeout;
- hot-row bottlenecks;
- failure handling for long transactions.

Do not hold database locks while waiting for a user to complete payment. Use a persisted hold with an expiry instead.

---

## 49. Leases and Reservations

A lease grants temporary ownership until an expiry time.

Examples:

- seat hold;
- job ownership;
- shard leadership;
- crawler URL ownership;
- distributed lock with bounded duration.

A lease record may contain:

```text
resourceId
ownerId
leaseToken or fencingToken
expiresAt
version
```

Use fencing tokens when an expired owner could continue acting after a new owner acquires the lease. Downstream systems reject operations with an older token.

Leases require careful treatment of:

- clock assumptions;
- renewal;
- delayed workers;
- duplicate ownership attempts;
- expiry cleanup.

---

## 50. Saga and Compensation

A saga divides a workflow into local transactions and compensating actions.

Example booking flow:

1. create booking intent;
2. reserve seats;
3. authorize payment;
4. confirm booking;
5. publish confirmation.

If a later step fails:

- release seat reservation;
- void or refund payment authorization;
- mark booking failed.

A compensation is not always a perfect rollback. A sent email cannot be unsent, and a refund is a new business event rather than deletion of the charge.

Use a saga when:

- the workflow spans services;
- temporary intermediate states are acceptable;
- compensating actions exist;
- strict distributed atomicity would be too expensive or unavailable.

---

# Part XII — Hot Keys and Celebrity Traffic

## 51. Read-Hot Keys

A viral URL or celebrity post may overload one cache or database partition.

Possible controls:

- CDN or edge caching;
- replicate the cached value across multiple nodes;
- local in-process caching with short TTL;
- request coalescing;
- immutable versioned keys;
- stale-while-revalidate;
- split read traffic by virtual replicas.

Because the underlying value changes rarely, read replication is usually effective.

---

## 52. Write-Hot Keys

Write hotspots are harder because all updates may need to converge on one logical value.

Examples:

- global view counter;
- highest bid for one auction;
- one rate-limit counter;
- one live-stream comment partition;
- one inventory row.

Possible approaches:

- sharded counters with asynchronous aggregation;
- partition by time bucket;
- single-writer ownership per key;
- queue or log serialization;
- conditional updates;
- per-key batching;
- admission control;
- separate exact authoritative state from approximate displayed state.

The correct choice depends on whether the value must be exact and immediately visible.

### Example: view counter

Use many counter shards and aggregate because slight delay is acceptable.

### Example: auction highest bid

Do not independently update many shards and reconcile later if two winners are possible. Serialize or conditionally commit accepted bids for the auction.

---

# Part XIII — Cost-Effective Traffic Spike Handling

## 53. Predictable Spikes

For known events such as ticket-sale openings:

- pre-scale services;
- prewarm caches;
- pre-create partitions;
- validate downstream quotas;
- use a waiting room or admission tokens;
- reserve capacity;
- load-test the exact hot path.

Autoscaling alone may react too late for a sudden spike.

---

## 54. Unexpected Spikes

Use a combination of:

- CDN and caches;
- autoscaling;
- queues;
- rate limiting;
- load shedding;
- backpressure;
- degraded responses;
- request prioritization;
- per-key isolation.

Autoscale from signals such as:

- CPU and memory;
- request concurrency;
- p95/p99 latency;
- queue lag;
- active connections;
- partition utilization.

CPU alone can miss I/O-bound or connection-bound overload.

Cost-effective design means paying for peak capacity only where needed while protecting the system when elastic capacity cannot arrive quickly enough.

---

# Part XIV — Observability and Operations

## 55. Metrics, Logs, and Traces

A production-oriented design should be observable.

Track metrics that correspond to requirements:

- request rate, errors, and latency by endpoint;
- cache hit ratio;
- database latency and connection saturation;
- queue lag and oldest-event age;
- replication lag;
- retry and timeout rate;
- active WebSocket connections;
- dropped messages;
- hot-partition load;
- business success and failure counts.

Use structured logs with identifiers such as:

- request ID;
- user or tenant ID where privacy permits;
- booking, auction, job, or event ID;
- idempotency key;
- trace ID.

Distributed tracing helps follow one operation across services, queues, and databases.

Avoid logging sensitive payloads or credentials.

---

## 56. Service-Level Objectives

A requirement becomes operationally useful when expressed as an SLO.

Examples:

- 99.99% of redirect requests succeed each month, excluding invalid or expired codes;
- 99% of accepted analytics events are queryable within 30 seconds;
- 99.9% of valid bid requests complete within 200 ms;
- no two confirmed bookings reference the same show seat;
- 99% of scheduled jobs begin within one minute of their target time.

SLOs guide:

- alerting;
- capacity planning;
- degradation decisions;
- whether an optimization is necessary.

---

# Part XV — Specialized Problem Templates

## 57. Why Some Problems Do Not Fit the User-Facing Template Directly

The generic framework works best when users call APIs that read and write product data.

Infrastructure systems often have a different center of gravity:

- the main actors may be other services rather than end users;
- APIs may be secondary to an internal algorithm;
- correctness may depend on leases, ordering, or routing;
- throughput may be controlled internally;
- data access may be streaming rather than request-response.

For these problems, keep the same foundation:

1. requirements;
2. scale;
3. interfaces;
4. baseline design;
5. deep dives;
6. fault handling.

But change the problem-specific core.

---

## 58. Distributed Cache

### Core requirements

- Client should be able to get a value by key.
- Client should be able to put or update a value with optional TTL.
- Client should be able to delete a key.
- System should evict entries when capacity is reached.
- System should tolerate cache-node failures according to the desired availability level.

### Main deep dives

#### Routing

How does a client or proxy find the node responsible for a key?

Options:

- modulo hashing;
- consistent hashing;
- rendezvous hashing;
- centralized routing metadata;
- proxy-based routing.

Discuss node addition, removal, and virtual nodes.

#### Replication

- Is the cache replicated?
- Are writes synchronous or asynchronous?
- What happens during failover?
- Is stale data acceptable?

#### Eviction

Common policies:

- LRU;
- LFU;
- FIFO;
- random;
- TTL-based expiration.

Discuss whether policy metadata becomes expensive at high concurrency.

#### Consistency and invalidation

- cache-aside versus write-through;
- stale reads;
- invalidation messages;
- versioned values;
- cache stampede;
- hot keys.

The main architecture is determined more by routing, ownership, replication, and eviction than by CRUD API design.

---

## 59. Rate Limiter

### Core requirements

- System should decide whether a request is allowed under one or more configured limits.
- Administrator should be able to configure rules by user, API, tenant, region, or another dimension.
- System should return limit metadata and retry guidance.
- Enforcement should remain available and sufficiently accurate during failures.

### Main deep dives

#### Algorithm

- fixed window;
- sliding-window log;
- sliding-window counter;
- token bucket;
- leaky bucket.

Choose based on burst tolerance, precision, memory, and implementation cost.

#### Counter storage

- local memory;
- centralized Redis-like store;
- partitioned distributed counters;
- hybrid local allowance with central reconciliation.

#### Enforcement placement

- API gateway;
- service sidecar;
- library;
- dedicated rate-limit service.

#### Correctness trade-off

- Can the system occasionally allow a few extra requests?
- Should it fail open or fail closed when the limiter is unavailable?
- Is the limit global or regional?
- How are hot global keys handled?

The critical path is:

```text
identify rule → update counter/token state atomically → allow or reject
```

---

## 60. Job Scheduler

### Core requirements

- Client should be able to schedule one-time and recurring jobs.
- System should dispatch eligible jobs to workers.
- System should retry failed jobs according to policy.
- System should avoid concurrent execution when the job requires single ownership.
- Client should be able to query and cancel jobs.

### Main deep dives

#### Time indexing

How are jobs due in the next interval found efficiently?

Options:

- database index on `nextRunAt`;
- time buckets;
- delayed queue;
- timing wheel;
- hierarchical queues.

#### Leases

A dispatcher grants a worker a time-bounded lease.

Discuss:

- lease expiry;
- heartbeat and renewal;
- worker crash;
- fencing token;
- duplicate execution.

#### Delivery semantics

Exactly-once execution is generally not guaranteed merely by a queue. Design for at-least-once dispatch with idempotent jobs where possible.

#### Retries

- exponential backoff;
- maximum attempts;
- retryable versus permanent errors;
- dead-letter queue;
- poison jobs.

#### Recurring jobs

Clarify timezone, daylight-saving behavior, missed schedules, overlap policy, and next-run calculation.

---

## 61. Web Crawler

### Core requirements

- System should discover and fetch web pages.
- System should avoid fetching duplicate URLs unnecessarily.
- System should respect domain politeness and robots rules.
- System should extract links and schedule recrawls.
- System should store fetched content or metadata according to scope.

### Main deep dives

#### URL frontier

The frontier prioritizes and schedules URLs.

It must support:

- domain-aware queues;
- priority;
- retry time;
- recrawl time;
- deduplication;
- scale-out workers.

#### Politeness

Do not overload one host.

Possible structure:

```text
host → nextAllowedFetchTime → per-host URL queue
```

Workers fetch only when the host's delay permits it.

#### Deduplication

- normalized URL hash;
- seen-URL store;
- Bloom filter plus authoritative lookup;
- content fingerprinting for duplicate pages.

#### Failure handling

- DNS failure;
- timeout;
- HTTP retry policy;
- redirect loops;
- crawler traps;
- oversized content;
- malicious responses.

The central discussion is frontier scheduling, politeness, deduplication, and freshness—not a standard user CRUD API.

---

## 62. Metrics Monitoring System

### Core requirements

- Agents or services should be able to publish metric samples.
- Users should be able to query metrics over a time range.
- Users should be able to group, filter, and aggregate by labels.
- Users should be able to configure alerting rules.
- System should evaluate alerts within a defined delay.

### Main deep dives

#### Ingestion

```text
Agents → regional ingest endpoints → buffer/log → processors → TSDB
```

Discuss batching, compression, out-of-order samples, retries, and tenant quotas.

#### Data model

```text
metricName + labelSet → time series
```

Label cardinality is a first-class capacity concern.

#### Storage

- partition by series and time;
- compression;
- retention;
- downsampling;
- rollups;
- tiered storage.

#### Query

- range scans;
- label index;
- fan-out across time partitions;
- query limits;
- result caching;
- downsample selection.

#### Alerting

- rule scheduler;
- evaluation workers;
- state such as `pending` and `firing`;
- deduplication;
- notification routing;
- silence and inhibition.

This system contains both a write-heavy ingestion plane and a query/evaluation plane. Design them separately.

---

## 63. Unique ID Generator

### Core requirements

- Generate unique IDs at the required throughput.
- Define whether IDs must be roughly time-ordered.
- Define ID size and representation.
- Remain available during node failures.
- Prevent duplicates during clock movement or node reassignment.

### Possible designs

- database sequence;
- range allocation;
- UUID;
- timestamp + worker ID + sequence;
- centralized ID service;
- random IDs with sufficient collision space.

### Main deep dives

- global uniqueness versus local uniqueness;
- clock rollback;
- worker-ID assignment;
- sequence exhaustion within one timestamp;
- information leakage from ordered IDs;
- index fragmentation from random IDs;
- generator failure and lease reuse.

The design is primarily an algorithm and coordination problem rather than a multi-feature user-facing system.

---

## 64. Collaborative Document Editor

### Core requirements

- Users should be able to open and edit a shared document.
- Users should see remote edits with low latency.
- System should persist document history.
- System should handle concurrent edits.
- Users should reconnect without losing committed changes.

### Main deep dives

#### Connection layer

Use WebSocket or another bidirectional stream.

Maintain:

- document-room membership;
- connection ownership;
- authentication;
- presence;
- reconnect cursor.

#### Concurrency algorithm

Choose and explain:

- Operational Transformation;
- CRDT;
- server-serialized operations.

Discuss:

- operation identity;
- version or causal context;
- conflict resolution;
- convergence;
- cursor and selection transformation.

#### Persistence

Store:

- operation log;
- periodic snapshots;
- document metadata;
- permissions.

Reconstruct from the latest snapshot plus later operations.

#### Fan-out

Route accepted operations to all active users in the document while applying backpressure and reconnect replay.

This problem should start with real-time collaboration and concurrency semantics, not polling.

---

## 65. ChatGPT-Like System

### Core requirements

- User should be able to submit a prompt within a conversation.
- System should generate and stream a response.
- User should be able to continue a previous conversation.
- System should enforce usage, safety, and tenant limits.
- System may support retrieval from user or organization data if included.

### Main deep dives

#### Request path

```text
Client
  → API Gateway
  → Conversation Service
  → Prompt/Safety Processing
  → Model Gateway / Scheduler
  → Inference Workers
  → Token Stream
  → Client
```

#### Model scheduling

Discuss:

- GPU worker pool;
- model and adapter placement;
- batching;
- queueing;
- prompt length;
- token budget;
- preemption and priority;
- admission control.

#### Streaming

SSE is often sufficient for server-to-client token streaming; WebSocket may be useful when richer bidirectional control is required.

#### Conversation storage

Separate:

- authoritative conversation messages;
- generated-token stream state;
- attachments;
- retrieval indexes;
- usage and billing events.

#### Retrieval-augmented generation

If in scope:

```text
document ingest → chunking → embeddings/index
prompt → retrieval → context assembly → inference
```

Discuss tenant isolation, freshness, relevance, and context limits.

#### Reliability and cost

- request admission;
- timeout and cancellation;
- partial output handling;
- model fallback;
- GPU saturation;
- token-based quotas;
- caching only where semantics permit;
- observability without exposing private prompts.

The dominant constraints are accelerator capacity, scheduling, streaming, context size, safety, and cost—not ordinary database QPS alone.

---

# Part XVI — Reusable Interview Templates

## 66. Requirement Template

```markdown
## What is <Problem>?

<One- or two-sentence definition>

## Functional Requirements

1. User should ...
2. User should ...
3. System should ...
4. Administrator should ...

## Out of Scope

- ...
- ...
```

---

## 67. Non-Functional Requirement Template

```markdown
## Fault Tolerance

- Tolerate one application-instance failure.
- Tolerate one availability-zone failure for critical workflows.
- Do not lose acknowledged critical writes.

## Consistency and Staleness

| Write/read workflow | Requirement | Allowed staleness | Failure behavior |
|---|---|---:|---|
| ... | ... | ... | ... |

## Scale

- Registered users:
- DAU:
- Active objects:
- Retention:
- Expected growth horizon:

## Workload per Functional Requirement

| FR | Average operations/s | Peak operations/s | p99 latency |
|---|---:|---:|---:|
| FR-1 | | | |
| FR-2 | | | |

## Problem-Specific Constraints

- Hot keys:
- Uniqueness:
- Ordering:
- Politeness:
- Cardinality:
- Other:
```

---

## 68. Estimation Template

```text
Daily operations
= DAU × operations per active user per day

Average operations/second
= daily operations / 86,400

Peak operations/second
= average operations/second × peak multiplier

Rows retained
= rows per day × retention days

Logical storage
= rows retained × bytes per row

Physical storage
≈ logical storage × replication factor
  + indexes
  + storage-engine overhead
  + derived copies

Bandwidth
= operations/second × bytes per operation
```

Always label assumptions.

---

## 69. API Template

````markdown
### FR-X: <Requirement>

**Protocol:** HTTP / gRPC / SSE / WebSocket

```http
<METHOD> /v1/<resource>
```

Request:

```json
{}
```

Response:

```json
{}
```

Considerations:

- idempotency;
- validation;
- pagination;
- status codes;
- authentication boundary;
- consistency expectation.
````

---

## 70. Baseline Diagram Checklist

For every functional requirement, show:

- actor or client;
- load balancer or gateway;
- application service;
- authoritative datastore;
- cache, queue, or secondary store only when used;
- read and write arrows;
- synchronous versus asynchronous boundaries;
- table or partition key annotations;
- external dependencies;
- response point.

Then ask:

- Which component owns the truth?
- Where can the request fail?
- Which steps are required before success is returned?
- Which steps can be delayed?
- Which operation protects the business invariant?

---

## 71. Deep-Dive Selection Template

```text
Requirement:
Current data path:
Estimated load:
Observed or predicted bottleneck:
First optimization:
Why it helps:
New trade-off:
Failure behavior:
Remaining limitation:
```

Choose two or three important deep dives rather than shallowly naming every distributed-system concept.

---

## 72. Final Design Review

### Requirements

- Did every functional requirement receive a data flow?
- Is out-of-scope functionality still excluded?
- Did the design silently change a business rule?

### Scale

- Are traffic and storage assumptions consistent?
- Did peak traffic receive separate treatment?
- Are fan-out and payload size included?
- Is a hot-key distribution possible?

### API

- Does every user-facing requirement map to a contract?
- Are retries idempotent where necessary?
- Is pagination appropriate?
- Is the communication protocol justified?

### Data

- What is the source of truth?
- What is derived and rebuildable?
- Do keys support the main access patterns?
- Are indexes and their write costs acknowledged?
- Is retention defined?

### Consistency

- What invariant must never be violated?
- How quickly must each write become visible?
- What happens under partition or replica lag?
- Can a cache or read replica serve stale data safely?

### Reliability

- Is any critical component a single point of failure?
- Are timeouts, retries, and backoff defined?
- Can duplicate events or requests occur?
- Is graceful degradation possible?
- Can derived state be rebuilt?

### Throughput and Latency

- Which component is the first bottleneck?
- Is the optimization tied to a measured need?
- Are queues bounded?
- Does asynchronous processing meet the freshness requirement?

### Contention

- Can two requests update the same invariant?
- Is the operation protected by a transaction, conditional write, serialized owner, or lease?
- Are hot writes handled differently from ordinary writes?

### Operations

- Are meaningful metrics available?
- Can queue lag, replica lag, cache hit rate, and hot partitions be observed?
- Is there a recovery and reconciliation path?

---

# Part XVII — How to Present the Design in an Interview

## 73. A Strong Opening

A clear opening may sound like this:

> I will first confirm the core user workflows and what is out of scope. Then I will define the scale, latency, consistency, and availability requirements for each important workflow. I will design the APIs and begin with a simple end-to-end architecture. After that, I will use the traffic and storage estimates to identify the first bottleneck and deep-dive into the required optimizations.

This tells the interviewer that the discussion will be structured and requirement-driven.

---

## 74. Explain Every Major Component with a Reason

Weak:

> I will add Redis, Kafka, Cassandra, and Elasticsearch.

Strong:

> Redirect traffic is approximately 500,000 requests per second and repeatedly accesses a much smaller hot set of URL mappings. I will add a cache-aside layer keyed by short code to reduce database reads. The database remains authoritative, and a cache miss falls back to it.

Weak:

> I will use Kafka for scalability.

Strong:

> Recording analytics is not required before the redirect response is returned. I will durably enqueue the access event and process it asynchronously so an analytics-store slowdown does not increase redirect latency. This means the dashboard is eventually consistent, with a target delay below 30 seconds.

Every technology should answer a concrete question.

---

## 75. State Assumptions Clearly

Use phrases such as:

> I will assume 20 million daily active users and a five-times peak unless you would like a different scale.

> I will assume analytics may lag by up to 30 seconds, while seat ownership must be strongly consistent.

> I will keep multi-region active-active writes out of scope and design for multi-AZ availability within one region.

Assumptions are not weaknesses when they are explicit and reasonable.

---

## 76. Evolve the Diagram Instead of Replacing It

A strong interview narrative may proceed as follows:

1. One application service and PostgreSQL.
2. Add an index for the main read query.
3. Add cache for repeated hot reads.
4. Add a durable event stream for asynchronous analytics.
5. Partition the event store by key and time.
6. Add replicas and multi-AZ placement.
7. Handle hot keys and overload.

Each step should preserve the reader's understanding of the previous design.

---

## 77. Be Precise About Guarantees

Avoid vague claims:

- “Kafka guarantees exactly once.”
- “Cassandra never goes down.”
- “Redis makes it fast.”
- “Quorum prevents data loss.”
- “Microservices make it scalable.”

Prefer:

> The broker may redeliver an event, so the consumer records the event ID and applies the aggregate update idempotently.

> A quorum write reduces the chance of acknowledged data existing on only one replica, but durability still depends on the datastore's acknowledgment and recovery semantics.

> Redis removes most repeated database lookups when the key is cached; misses still depend on the database, and invalidation determines freshness.

Precision builds trust.

---

## 78. Common Mistakes to Avoid

### Designing before clarifying requirements

The architecture may optimize a feature that is not in scope.

### Listing every possible feature

A broad incomplete design is weaker than a focused complete one.

### Treating CAP as a product-wide label

Discuss the invariant, visibility delay, and partition behavior per workflow.

### Using DAU as QPS

Convert users into actions per day and then into average and peak throughput.

### Ignoring retention

A write rate alone does not reveal table size.

### Starting with too many technologies

Begin with a source of truth and add specialized components for measurable reasons.

### Choosing a database before writing access patterns

The query shape and consistency requirement should drive storage design.

### Saying “NoSQL for scale”

Relational systems scale significantly, and NoSQL systems have their own constraints. Name the access pattern that benefits.

### Assuming cache solves all read problems

Cache usefulness depends on hit rate, freshness, working set, and invalidation.

### Ignoring write amplification

Indexes, replicas, outbox records, and derived views all increase internal write work.

### Making every operation asynchronous

Asynchronous processing is incorrect when the response depends on the final authoritative result.

### Returning success before durable acceptance

An in-memory queue is not enough for critical accepted work.

### Ignoring duplicate requests and events

Retries are expected. Design idempotency and deduplication.

### Calling a queue infinite

Sustained overload creates unbounded lag unless admission or capacity changes.

### Using distributed locks unnecessarily

Prefer database constraints, conditional writes, partition ownership, or local transactions when they protect the invariant more simply.

### Ignoring hot keys

A perfectly balanced average can hide one overloaded partition.

### Treating read replicas as strongly current

Replication lag must be compatible with the request.

### Ignoring failure at component boundaries

Always consider the database-commit/event-publish gap, timeouts after success, and partial downstream processing.

### Overlooking observability

A system cannot reliably operate if lag, saturation, errors, and SLO violations are invisible.

---

# Final Summary

A reusable HLD framework can be reduced to seven major questions:

1. **What exactly must the system do?**  
   Define the core user and system workflows and exclude unrelated features.

2. **How well must each workflow work?**  
   Specify scale, peak traffic, latency, durability, availability, visibility delay, and failure behavior.

3. **What data is authoritative, and how is it accessed?**  
   Identify entities, keys, query patterns, retention, and derived views.

4. **What is the simplest complete design?**  
   Draw the end-to-end path for every requirement before introducing distributed complexity.

5. **Where does the baseline fail?**  
   Use traffic, storage, latency, and contention estimates to identify the real bottleneck.

6. **Which targeted mechanism solves that bottleneck?**  
   Add an index, cache, replica, queue, partition, specialized datastore, or concurrency control for a stated reason.

7. **How does the design behave during failure and overload?**  
   Handle retries, duplicates, partial failures, hot keys, backpressure, failover, degradation, and reconciliation.

The best HLD solution is not the diagram with the most boxes. It is the design in which every major component has a clear purpose, every critical invariant is protected, every scalability decision follows from numbers, and every important trade-off is explained.

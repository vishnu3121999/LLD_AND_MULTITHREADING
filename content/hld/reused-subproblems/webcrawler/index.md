# Web Crawler — Full System Design Interview

## 0. What is a Web Crawler?

A web crawler continuously discovers and downloads web pages by:

1. Starting with a set of seed URLs.
2. Downloading those pages.
3. Extracting links from the downloaded content.
4. Adding newly discovered URLs to the crawl queue.
5. Repeating the process while respecting website policies and crawl limits.

Typical use cases:

- Search-engine indexing
- Price monitoring
- News aggregation
- SEO tools
- Broken-link detection
- Web archiving

---

## 1. Functional Requirements

1. System should crawl web pages starting from a given set of seed URLs.
2. System should extract links from downloaded pages and discover new URLs.
3. System should avoid repeatedly crawling duplicate URLs and duplicate content.
4. System should respect `robots.txt` rules for each website.
5. System should enforce per-domain rate limits to avoid overloading websites.
6. System should retry temporarily failed crawl requests.

[//]: # (7. System should periodically recrawl previously downloaded pages.)
8. System should store downloaded content and page metadata.
9. System should support prioritizing important or frequently changing pages.

[//]: # (10. System should expose crawl status and statistics for monitoring.)

### Out of Scope

- Building the search index
- Ranking search results
- Executing complex JavaScript in a browser
- Authentication-protected pages
- CAPTCHA bypassing

[//]: # (- Parsing every possible document format)

---

## 2. Non-Functional Requirements

### 2.1 Scalability

The crawler should support billions of URLs and thousands of page downloads per second.

### 2.2 High Availability

Crawler workers, URL queues, and schedulers should not have a single point of failure.

### 2.3 Fault Tolerance

Worker crashes should not permanently lose URLs.

### 2.4 Politeness

The crawler must:

- Respect `robots.txt`
- Limit concurrent requests to the same domain
- Maintain a delay between requests to the same host

### 2.5 Eventual Consistency

Newly discovered URLs do not need to become immediately crawlable.

A delay of seconds or minutes is normally acceptable.

### 2.6 At-Least-Once Processing

A URL may occasionally be crawled more than once, but it must not be permanently missed.

Strict exactly-once crawling is unnecessary and expensive.

---

## 3. Scale Estimation

Assume a large search-engine crawler.

### 3.1 Crawl Throughput

Assume:

- Pages crawled per day: `1 billion`
- Average page size: `500 KB`
- Peak traffic: `3 × average`

```text
Average crawl QPS
= 1B / 86,400
≈ 11,600 pages/second

Peak crawl QPS
≈ 35,000 pages/second
```

### 3.2 Network Bandwidth

```text
Bandwidth
= 11,600 × 500 KB
≈ 5.8 GB/second
≈ 46 Gbps
```

Peak bandwidth may be around:

```text
≈ 140 Gbps
```

### 3.3 Raw Content Storage

```text
Daily storage
= 1B × 500 KB
= 500 TB/day
```

For 30 days:

```text
500 TB × 30
= 15 PB
```

In practice:

- Compress content
- Store only selected pages
- Deduplicate identical content
- Move old content to cheaper object storage

### 3.4 URL Metadata

Assume approximately `200 bytes` per URL.

```text
1B URLs × 200 bytes
= 200 GB
```

For `100B discovered URLs`:

```text
100B × 200 bytes
= 20 TB
```

This excludes indexes and replication.

---

## 4. Core Entities

### URL

```text
URL
- urlId
- normalizedUrl
- domain
- host
- discoveredAt
- lastCrawledAt
- nextCrawlAt
- crawlStatus
- priority
- retryCount
- contentHash
```

### Page

```text
Page
- urlId
- finalUrl
- statusCode
- contentType
- contentLocation
- contentHash
- fetchedAt
- size
```

### Host

```text
Host
- host
- robotsRules
- robotsFetchedAt
- crawlDelay
- nextAllowedCrawlAt
- activeRequestCount
- failureCount
```

### Crawl Task

```text
CrawlTask
- urlId
- url
- host
- priority
- scheduledAt
- retryCount
```

---

## 5. APIs

These APIs are primarily administrative. The internal crawler workflow normally uses queues rather than synchronous REST APIs.

### Add Seed URLs

```http
POST /crawl-jobs
```

```json
{
  "seedUrls": [
    "https://example.com",
    "https://example.org"
  ],
  "maxDepth": 5,
  "priority": "HIGH"
}
```

Response:

```json
{
  "jobId": "job-123",
  "status": "CREATED"
}
```

### Get Crawl Job Status

```http
GET /crawl-jobs/{jobId}
```

Response:

```json
{
  "jobId": "job-123",
  "status": "RUNNING",
  "discoveredUrls": 1200000,
  "crawledUrls": 850000,
  "failedUrls": 1200
}
```

### Get URL Crawl Status

```http
GET /urls/status?url=https://example.com/page
```

### Request Recrawl

```http
POST /urls/recrawl
```

```json
{
  "url": "https://example.com/page",
  "priority": "HIGH"
}
```

---

## 6. Database Tables

### URLs

```text
Urls
- urlId              PK
- normalizedUrl
- urlHash             UNIQUE
- host
- discoveredAt
- lastCrawledAt
- nextCrawlAt
- status
- priority
- retryCount
- contentHash
```

`urlHash` can be used instead of indexing a very long URL string.

### Pages

```text
Pages
- urlId               PK
- finalUrl
- statusCode
- contentType
- contentLocation
- contentHash
- fetchedAt
- size
```

The actual page body should normally be stored in object storage.

### Hosts

```text
Hosts
- host                PK
- robotsTxtLocation
- robotsFetchedAt
- crawlDelayMs
- nextAllowedCrawlAt
- failureCount
```

### CrawlJobs

```text
CrawlJobs
- jobId               PK
- status
- createdAt
- startedAt
- completedAt
- maxDepth
```

### URLJobMapping

```text
URLJobMapping
- jobId
- urlId
- depth

PK(jobId, urlId)
```

---

## 7. High-Level Architecture

```text
                         ┌───────────────────┐
                         │ Seed URL Service  │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ URL Normalizer    │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ URL Deduplicator  │
                         └─────────┬─────────┘
                                   │
                                   ▼
                     ┌─────────────────────────┐
                     │ URL Frontier / Scheduler│
                     └────────────┬────────────┘
                                  │
                                  ▼
                         ┌───────────────────┐
                         │ Crawl Task Queue  │
                         └─────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              ┌──────────┐   ┌──────────┐   ┌──────────┐
              │ Worker 1 │   │ Worker 2 │   │ Worker N │
              └────┬─────┘   └────┬─────┘   └────┬─────┘
                   │              │              │
                   └──────────────┼──────────────┘
                                  ▼
                       ┌──────────────────────┐
                       │ Content Parser       │
                       └───────┬──────────────┘
                               │
                ┌──────────────┴───────────────┐
                ▼                              ▼
       ┌──────────────────┐          ┌──────────────────┐
       │ Content Storage  │          │ Link Extractor   │
       └──────────────────┘          └────────┬─────────┘
                                              │
                                              ▼
                                     URL Normalizer
```

Supporting components:

```text
- DNS Cache
- robots.txt Cache
- Host Rate Limiter
- Metadata Database
- Retry Queue
- Dead-Letter Queue
- Monitoring System
```

---

## 8. End-to-End Crawl Flow

### Step 1: Add Seed URLs

The seed service receives initial URLs such as:

```text
https://example.com
https://news.example.org
```

### Step 2: Normalize URLs

The URL normalizer converts different representations of the same URL into a canonical form.

Example:

```text
HTTPS://Example.com:443/a/../page#section
```

Becomes:

```text
https://example.com/page
```

### Step 3: Deduplicate URL

The crawler checks whether the normalized URL has already been discovered.

If new:

- Store URL metadata
- Add URL to the URL frontier

If already known:

- Ignore it, or update its priority

### Step 4: Schedule URL

The scheduler decides when the URL may be crawled based on:

- Priority
- `robots.txt`
- Domain crawl delay
- Last crawl time
- Retry state
- Worker capacity

### Step 5: Fetch robots.txt

Before crawling a host:

```text
https://example.com/robots.txt
```

The crawler parses:

```text
User-agent: *
Disallow: /private/
Crawl-delay: 2
```

The parsed rules are cached.

### Step 6: Download Page

A worker:

1. Resolves the hostname using DNS.
2. Checks the host rate limit.
3. Sends the HTTP request.
4. Follows redirects up to a configured limit.
5. Validates response size and content type.
6. Stores page content.

### Step 7: Parse Content

For HTML pages, the parser extracts:

- Links
- Canonical URL
- Metadata
- Language
- Content hash
- Last-modified information

### Step 8: Add New Links

Extracted links are:

1. Converted to absolute URLs.
2. Normalized.
3. Filtered.
4. Deduplicated.
5. Added back to the URL frontier.

### Step 9: Schedule Recrawl

The crawler calculates `nextCrawlAt` based on:

- Historical change frequency
- Page importance
- HTTP cache headers
- Sitemap information
- Crawl budget

---

## 9. URL Frontier

The URL frontier is the central scheduling system that stores URLs waiting to be crawled.

A simple FIFO queue is insufficient because it may:

- Overload one website
- Ignore important pages
- Starve low-priority pages
- Violate crawl-delay rules

The frontier should handle two concerns:

1. URL priority
2. Per-host politeness

### 9.1 Front Queues — Priority

Maintain multiple priority queues:

```text
Priority 0: Homepage and important pages
Priority 1: Frequently changing pages
Priority 2: Normal discovered pages
Priority 3: Low-value pages
```

The prioritizer assigns URLs based on:

- Page rank or domain importance
- Link depth
- Recrawl urgency
- Sitemap priority
- Page update frequency

### 9.2 Back Queues — Politeness

Maintain queues partitioned by host:

```text
example.com queue
wikipedia.org queue
news.com queue
```

Only one or a limited number of workers should fetch from a host at a time.

A heap stores hosts ordered by `nextAllowedCrawlAt`.

```text
Host Priority Queue:

(example.com, 10:00:02)
(news.com,    10:00:03)
(wiki.org,    10:00:05)
```

When a host becomes eligible:

1. Pop the host from the heap.
2. Pick one URL from its queue.
3. Dispatch the URL to a worker.
4. Calculate the next allowed crawl time.
5. Insert the host back into the heap.

---

## 10. URL Normalization

Without normalization, these may be treated as separate URLs:

```text
https://example.com
https://example.com/
https://EXAMPLE.com/
https://example.com:443/
https://example.com/#section
```

Typical normalization rules:

- Lowercase scheme and host
- Remove URL fragments
- Remove default ports
- Resolve `.` and `..`
- Sort query parameters where safe
- Remove known tracking parameters
- Normalize trailing slashes
- Convert international domains consistently
- Resolve relative links

Be careful with query parameters.

These URLs may represent different resources:

```text
/products?sort=price
/products?sort=rating
```

Do not blindly remove or reorder parameters when server behavior is unknown.

---

## 11. URL Deduplication

There are two different duplication problems.

### 11.1 URL Duplication

Multiple links point to the same normalized URL.

Solution:

```text
urlHash = SHA-256(normalizedUrl)
```

Check the hash in the URL metadata store.

At very large scale, checking the database for every discovered URL becomes expensive.

Use:

```text
Bloom Filter → Database
```

Flow:

1. Check Bloom filter.
2. If definitely absent, store the URL.
3. If possibly present, check the database.

#### Bloom Filter Trade-Off

A Bloom filter can produce false positives.

That means a new URL may occasionally be considered already seen.

For a general-purpose search crawler, this small loss may be acceptable.

For a compliance crawler where every URL must be processed, use a persistent exact lookup instead.

### 11.2 Content Duplication

Different URLs may return identical content.

Examples:

```text
example.com/product?id=10
example.com/products/10
example.com/mobile/product/10
```

Calculate a content fingerprint:

```text
contentHash = SHA-256(normalizedPageContent)
```

For near-duplicate content, use:

- SimHash
- MinHash
- Locality-sensitive hashing

The crawler can retain one canonical copy and store references from duplicates.

---

## 12. robots.txt Handling

The crawler should retrieve:

```text
https://host/robots.txt
```

Before crawling the host.

Store:

```text
- Allowed paths
- Disallowed paths
- Crawl delay
- Sitemap URLs
- Expiration time
```

### Caching

Do not download `robots.txt` for every URL.

Cache it per host for several hours or days.

### Failure Policy

When `robots.txt` cannot be fetched:

- Temporary network failure: delay crawling and retry.
- `404 Not Found`: assume no robots restrictions.
- `5xx`: temporarily avoid crawling aggressively.
- Timeout: retry with backoff.

The exact behavior depends on product policy.

---

## 13. Politeness and Rate Limiting

Global QPS limits are not enough.

A crawler handling `10,000 QPS` could accidentally send all requests to one website.

Use per-host rate limiting.

For example:

```text
example.com:
- Maximum concurrent requests: 2
- Minimum delay: 1 second
```

A token bucket may be maintained per host:

```text
HostRateLimit
- tokens
- refillRate
- maxTokens
- lastRefillTime
```

However, for strict crawl delay, a `nextAllowedCrawlAt` scheduler is often simpler.

---

## 14. Partitioning

The crawler must ensure that URLs belonging to the same host are coordinated by the same scheduling partition.

Partition using:

```text
partition = hash(host) % numberOfPartitions
```

Benefits:

- Host-specific rate limits remain local.
- URLs for one host are processed by one scheduler partition.
- Reduced distributed locking.
- Easy horizontal scaling.

Avoid partitioning purely by complete URL because URLs from the same host may land on different schedulers and violate politeness limits.

---

## 15. Queue Design

Use durable queues such as Kafka or an equivalent distributed log.

Possible topics:

```text
discovered-urls
scheduled-crawl-tasks
crawl-results
retry-tasks
dead-letter-tasks
```

### Why Not Use One Queue?

Different stages have different:

- Throughput
- Retry policies
- Partitioning keys
- Retention requirements
- Consumer scaling requirements

### Partition Key

For crawl scheduling:

```text
key = host
```

This preserves host-level ordering within a partition.

---

## 16. Crawler Worker

A crawler worker performs:

```text
1. Receive crawl task
2. Check lease validity
3. Check robots rules
4. Check host crawl limit
5. Resolve DNS
6. Fetch page
7. Validate response
8. Store content
9. Publish crawl result
10. Acknowledge task
```

Each worker should use asynchronous I/O.

Downloading pages is mostly network-bound, so one worker process can handle many concurrent connections.

Example:

```text
1 worker process
× 500 concurrent requests
× 100 worker machines
= 50,000 concurrent fetches
```

Concurrency must still be restricted per host.

---

## 17. HTTP Fetching Details

### Redirects

Follow only a limited number, such as:

```text
Maximum redirects = 5
```

Store:

- Original URL
- Final URL
- Redirect chain

Redirect loops must be detected.

### Compression

Send:

```http
Accept-Encoding: gzip, br
```

This reduces network bandwidth.

### Conditional Requests

For recrawling, send:

```http
If-None-Match: <etag>
If-Modified-Since: <timestamp>
```

If the server returns:

```http
304 Not Modified
```

The crawler avoids downloading the page again.

### Content-Length Limit

Reject or truncate excessively large responses.

Example:

```text
Maximum HTML response: 10 MB
Maximum PDF response: 100 MB
```

### Content-Type Filtering

Initially support:

```text
text/html
application/xhtml+xml
```

Other formats can be handled by specialized parsers.

---

## 18. DNS Optimization

Performing DNS lookup for every page is expensive.

Use a distributed or local DNS cache:

```text
host → IP address, expirationTime
```

Respect DNS TTL.

Potential problems:

- DNS lookup latency
- DNS server overload
- Stale IP addresses
- Domain rebinding
- Multiple IP addresses per host

Workers can maintain local caches, while a shared resolver service handles cache misses.

---

## 19. Retry Handling

Failures should be classified.

### Retryable Failures

- Timeout
- Connection reset
- DNS temporary failure
- HTTP `429`
- HTTP `500`, `502`, `503`, `504`

Use exponential backoff:

```text
Retry 1: 1 minute
Retry 2: 5 minutes
Retry 3: 30 minutes
Retry 4: 2 hours
Retry 5: 1 day
```

Include jitter to prevent all retries from occurring simultaneously.

### Non-Retryable Failures

- Invalid URL
- Unsupported protocol
- HTTP `400`
- HTTP `401`
- HTTP `403`, depending on policy
- Robots disallow
- Permanently removed page

After maximum attempts, send the URL to a dead-letter queue.

---

## 20. Task Leasing and Worker Failure

A worker can crash after receiving a task but before completing it.

Use a lease:

```text
crawlTask
- taskId
- leasedBy
- leaseExpiresAt
- status
```

Flow:

1. Worker receives task.
2. Task is marked `IN_PROGRESS`.
3. Worker receives a lease for a limited duration.
4. Worker periodically renews the lease.
5. If the worker crashes, the lease expires.
6. Scheduler returns the task to the queue.

This provides at-least-once processing.

A page may be downloaded twice if:

1. Worker finishes downloading.
2. Worker crashes before acknowledging.
3. Task is reassigned.

Deduplication and idempotent writes handle this.

---

## 21. Idempotency

Use the crawl task ID or URL version to make writes idempotent.

For example:

```text
crawlVersion = hash(urlId + scheduledAt)
```

The result store can reject duplicate results for the same crawl version.

Page storage path:

```text
/pages/{urlId}/{crawlVersion}
```

Metadata update:

```sql
UPDATE Urls
SET lastCrawledAt = :fetchedAt,
    status = :status
WHERE urlId = :urlId
  AND lastCrawledAt < :fetchedAt;
```

---

## 22. Recrawling Strategy

Not every page should be crawled at the same frequency.

Examples:

```text
News homepage: every 5 minutes
Popular product page: every hour
Company documentation: every week
Archived page: every few months
```

Calculate recrawl frequency based on:

```text
- Historical content changes
- Page importance
- HTTP cache headers
- Sitemap change frequency
- Page popularity
- Crawl failures
- Available crawl budget
```

A simple formula:

```text
nextCrawlInterval
= clamp(
    timeSincePreviousChange × multiplier,
    minimumInterval,
    maximumInterval
  )
```

If a page changes frequently, reduce the interval.

If repeated crawls show no change, increase the interval.

---

## 23. Crawl Priority

A URL priority score can be calculated as:

```text
priority =
    pageImportance
  + freshnessRequirement
  + sitemapPriority
  + numberOfIncomingLinks
  - crawlCost
  - failurePenalty
```

Examples of high-priority URLs:

- Homepages
- Frequently updated news pages
- URLs linked from many important pages
- URLs explicitly submitted through a crawl API

Low-priority URLs:

- Calendar pages generating infinite dates
- Session-specific URLs
- Duplicate filtered product pages
- Pages that rarely change

---

## 24. Crawl Traps

A website may generate an effectively infinite number of URLs.

Examples:

```text
/calendar?date=2050-01-01
/calendar?date=2050-01-02
/search?page=999999
/product?sort=a&filter=b&session=xyz
```

Detection mechanisms:

- Maximum crawl depth
- Maximum URLs per domain
- Query parameter limits
- Repetitive URL pattern detection
- URL path length limit
- Duplicate content detection
- Maximum consecutive numeric pages
- Domain crawl budget

Example:

```text
Maximum discovered URLs per host per day = 1 million
```

---

## 25. Storage Choices

### URL Metadata

Possible choices:

- Cassandra
- DynamoDB
- Bigtable
- Sharded relational database

Access patterns:

```text
- Lookup URL by hash
- Update crawl status
- Find URLs with nextCrawlAt <= now
- Get URLs for a host
```

At massive scale, a wide-column or key-value store works well.

### Page Content

Use object storage:

- Amazon S3
- Google Cloud Storage
- HDFS

Reason:

- Page bodies are large blobs.
- Cheap storage is more important than low-latency row updates.
- Content can be compressed.
- Lifecycle rules can archive old versions.

### Queue

Use:

- Kafka
- Pulsar
- SQS-like queue
- Custom distributed frontier

Kafka is useful for durable event pipelines, but the complete URL frontier usually requires additional scheduling state because Kafka does not directly support delayed per-host scheduling.

### Cache

Use Redis or local caches for:

- `robots.txt`
- DNS results
- Host crawl state
- Recent URL hashes

---

## 26. Scheduling Database Problem

Avoid running a database query like:

```sql
SELECT *
FROM Urls
WHERE nextCrawlAt <= NOW()
ORDER BY priority DESC
LIMIT 10000;
```

At billions of rows and thousands of executions, this creates:

- Large indexes
- Hot ranges
- Lock contention
- Repeated scanning
- Difficult horizontal scaling

Better approach:

```text
Persistent URL metadata
        +
Time-bucketed scheduling queues
```

Example buckets:

```text
crawl-2026-07-10-19-00
crawl-2026-07-10-19-01
crawl-2026-07-10-19-02
```

URLs scheduled for a minute are written to that bucket.

At the scheduled time, the scheduler loads the bucket and dispatches URLs while still applying host-level politeness.

Another option is a distributed timing wheel.

---

## 27. Consistency and Availability

### Adding Discovered URLs

Availability is more important than immediate consistency.

A discovered URL can take seconds or minutes to reach the frontier.

### URL Deduplication

Eventual consistency is acceptable.

Two workers may discover the same URL simultaneously.

The URL store resolves this using a unique URL hash or conditional insert.

### Host Rate Limiting

Stronger consistency is needed within a host scheduling partition.

Two schedulers must not independently believe they can crawl the same host unrestricted.

Avoid distributed coordination by assigning each host to exactly one active scheduler partition.

### Page Storage

Availability is usually preferred.

Temporary delay in storing or exposing page metadata is acceptable.

---

## 28. CAP Analysis

### Discover URL and Schedule URL

```text
Availability > Consistency
```

Reason:

- Duplicate scheduling is tolerable.
- Losing availability during partition would reduce crawl coverage.

Possible staleness:

```text
Seconds to minutes
```

### Crawl Page and Update Metadata

```text
Availability > Consistency
```

The metadata may temporarily show an older crawl timestamp.

### Per-Host Politeness State

Within a scheduling partition:

```text
Consistency is important
```

Violating host rate limits can overload or block the target website.

Instead of running distributed consensus for every crawl, ensure single ownership of each host partition.

---

## 29. Failure Scenarios

### Worker Crashes During Download

- Lease expires.
- URL returns to queue.
- Another worker retries it.

### Scheduler Crashes

- Partition ownership moves to another scheduler.
- Host queues are reconstructed from durable state.
- URLs may temporarily be delayed.

### Queue Becomes Unavailable

- Workers finish current tasks.
- New crawl tasks stop.
- Discovered URLs remain buffered or persisted locally.
- Processing resumes after recovery.

### Metadata Store Becomes Unavailable

Possible policy:

- Stop accepting new URL discoveries.
- Continue in-flight crawls and buffer results.
- Replay buffered events when the store returns.

### Object Storage Failure

- Keep crawl result unacknowledged.
- Retry upload.
- Do not mark the URL as successfully crawled until content is durable.

### Target Website Returns 429

- Read `Retry-After`.
- Reduce host crawl rate.
- Apply exponential backoff.

### Target Website Becomes Slow

- Reduce concurrency for the host.
- Increase crawl interval.
- Use adaptive timeouts.

---

## 30. Monitoring

### Crawl Metrics

```text
- Pages crawled per second
- Bytes downloaded per second
- Successful crawl rate
- HTTP status code distribution
- Average page size
- Crawl latency p50, p95, p99
```

### Queue Metrics

```text
- URL frontier size
- Oldest pending URL age
- Retry queue size
- Dead-letter queue size
- Consumer lag
```

### Host Metrics

```text
- Requests per host
- 429 rate
- robots.txt failures
- Host timeout rate
- Politeness violations
```

### Quality Metrics

```text
- Duplicate URL rate
- Duplicate content rate
- New URL discovery rate
- Content change rate
- Recrawl usefulness
```

Alerts:

```text
- Crawl throughput drops significantly
- Queue lag continuously increases
- HTTP 429 or 5xx rates spike
- Object storage writes fail
- Scheduler partition has no owner
```

---

## 31. Security

Crawler workers interact with arbitrary external websites, so they must be isolated.

Threats include:

- Maliciously large responses
- Decompression bombs
- Redirect loops
- URLs targeting internal infrastructure
- Malicious HTML or parser exploits
- DNS rebinding
- Infinite streams
- Extremely slow responses

Protections:

```text
- Block private IP ranges
- Block cloud metadata endpoints
- Limit response size
- Limit redirects
- Set connection and read timeouts
- Sandbox parsers
- Validate content type
- Restrict supported URL schemes
- Limit decompressed size
```

Reject URLs such as:

```text
file://...
ftp://...
http://127.0.0.1/...
http://169.254.169.254/...
```

unless explicitly supported.

---

## 32. Bottlenecks

### URL Deduplication Store

Every downloaded page may contain tens or hundreds of links.

Example:

```text
11,600 crawled pages/second
× 100 links/page
= 1.16 million discovered links/second
```

Even if most are duplicates, deduplication must handle very high throughput.

Solutions:

- Bloom filters
- Batch writes
- URL-hash partitioning
- Local deduplication before global lookup

### DNS Resolution

Solutions:

- Worker-local cache
- Shared caching resolver
- Batch and asynchronous DNS lookup

### Per-Host Scheduling

Millions of active hosts may produce enormous host-level state.

Solutions:

- Partition by host
- Persist inactive host queues
- Keep only active hosts in memory
- Use a time heap or timing wheel

### Network Bandwidth

Solutions:

- Compression
- Conditional GET
- Regional worker deployment
- Content-size limits
- Avoid downloading unsupported content

### Object Storage

Solutions:

- Batch metadata writes
- Multipart upload for large objects
- Compress content
- Partition object paths
- Use lifecycle rules

---

## 33. Design Evolution

### Version 1: Small Crawler

Suitable for millions of URLs.

```text
PostgreSQL
+
Redis Queue
+
Multiple crawler workers
+
Object storage
```

Flow:

```text
Postgres URLs → Redis queue → Workers → Object storage
```

### Version 2: Medium Scale

```text
Sharded URL database
Kafka
Distributed workers
Redis robots/DNS cache
Object storage
```

### Version 3: Internet Scale

```text
Distributed URL frontier
Host-based partitioning
Bloom filters
Wide-column metadata store
Kafka/Pulsar pipelines
Distributed object storage
Regional crawler clusters
Adaptive recrawl scheduler
```

In an interview, start with Version 1 and introduce Version 2 or Version 3 only when scale requires it.

---

## 34. Important Interview Deep Dives

### 34.1 How do you prevent crawling the same URL twice?

- Normalize URL.
- Compute URL hash.
- Check Bloom filter.
- Perform conditional insert in the URL store.
- Make processing idempotent because duplicates can still occur.

### 34.2 How do you avoid overloading a website?

- Partition queues by host.
- Maintain `nextAllowedCrawlAt`.
- Limit requests per host.
- Respect `robots.txt`.
- Dynamically reduce rate after timeouts and `429` responses.

### 34.3 How do you schedule billions of URLs?

- Do not continuously scan the entire URL database.
- Use time buckets, delayed queues, or timing wheels.
- Maintain host-based back queues.
- Assign each host to one scheduler partition.

### 34.4 How do you handle worker crashes?

- Durable task queue
- Visibility timeout or task lease
- Retry after lease expiration
- Idempotent page writes
- At-least-once processing

### 34.5 How do you determine recrawl frequency?

Use:

- Previous content change interval
- Importance
- HTTP cache headers
- Sitemap metadata
- Crawl budget
- Failure history

### 34.6 How do you detect duplicate content?

- Exact content hash for identical pages
- SimHash or MinHash for near duplicates
- Store canonical page and duplicate references

---

## 35. Common Interview Mistakes

### Using One Global FIFO Queue

This can overload one host and does not support prioritization.

### Checking the Database for Every Extracted Link

A page may produce hundreds of links, creating millions of database reads per second.

Use local filtering and Bloom filters.

### Partitioning by Complete URL

This spreads URLs from one host across multiple schedulers and makes politeness enforcement difficult.

Partition by host.

### Storing Page Content Directly in the Metadata Database

Large page bodies make row storage expensive and difficult to scale.

Use object storage.

### Claiming Exactly-Once Crawling

Exactly-once execution across queues, workers, and storage is unnecessary.

Use at-least-once processing with idempotency.

### Ignoring Crawl Traps

Infinite URL generation can consume the entire crawler.

### Ignoring robots.txt and Rate Limits

Politeness is a core requirement, not an optional feature.

### Using Kafka Alone as the URL Frontier

Kafka is useful for durable pipelines, but it does not directly solve:

- Per-host delays
- Dynamic priorities
- Long-duration scheduling
- Host-level concurrency

A scheduler and persistent frontier state are still required.

---

## 36. Final Interview Architecture

```text
Seed URLs / Extracted Links
            │
            ▼
      URL Normalizer
            │
            ▼
 Local Deduplication
            │
            ▼
       Bloom Filter
            │
            ▼
 Distributed URL Store
            │
            ▼
 Priority URL Frontier
            │
            ▼
 Host-Based Scheduler
            │
            ▼
 Durable Crawl Queue
            │
            ▼
 Async Crawler Workers
     │       │       │
     │       │       └── DNS Cache
     │       └────────── robots.txt Cache
     └────────────────── Host Rate Limiter
            │
            ▼
      HTTP Response
            │
            ▼
     Content Processor
       │           │
       ▼           ▼
 Object Storage  Link Extractor
                      │
                      ▼
               URL Normalizer
```

---

## 37. Interview Summary

A scalable web crawler is primarily a distributed scheduling system rather than merely a collection of HTTP clients.

The most important design decisions are:

1. Normalize and deduplicate discovered URLs.
2. Partition scheduling by host.
3. Maintain priority queues and per-host politeness queues.
4. Respect `robots.txt` and crawl delays.
5. Use asynchronous workers for high network concurrency.
6. Store page bodies in object storage and metadata separately.
7. Use leases, retries, and idempotency for worker failures.
8. Dynamically determine recrawl intervals.
9. Detect crawl traps and duplicate content.
10. Use at-least-once processing rather than expensive exactly-once semantics.

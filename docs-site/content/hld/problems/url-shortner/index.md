---
title: URL Shortner
slug: urlshortner
summary: Regional news feed aggregation with low-latency infinite scroll, publisher ingestion, and feed caching.
tags:
  - Feed
  - Aggregation
  - Caching
difficulty: Hard
---

## Functional Requirements

1. User should be able to generate a unique short URL for a given long URL with an optional expiration time & custom aliases.
2. User should be able to access the original URL using the generated short URL.
3. System should record analytics (clicks, timestamp, location, device, referrer) for every successful redirect.
4. User should be able to view analytics for a short URL. (e.g., click count, trends, geographic distribution)

## Out of Scope

1. User auth & authz
2. Editing & deleting urls
3. Malicious URL detection

## Non-Functional Requirements

No single point of failure (fault tolerance).
CAP Theorem:
  Url conversion & access (FR-1 & FR-2):
    availability > consistency
      1-5 sec inconsistency allowed
  Analytics record & view (FR-3 & FR-4):
    availability > consistency :
      Minor delay (1–5 sec) in analytics updates is acceptable.
Throughput & Latencies:
  Url creation (FR-1):
    Write TPS = 1M/day = 10/s
    Write Latency = never mind
  Url access (FR-2):
    Read QPS = 100M/day = 1k/s
    Read Latency = 100ms
Handle Celebrity/Hot keys
Handle traffic spikes in cost effective way (optional, only if time at end)

## Core Entities

- Article
- User
- Publisher

## API Design

```http
GET /feed?cursor={cursor}&limit={limit}&region={region}
```

Returns a page of articles for a region.

Notes:

1. Cursor-based pagination is preferred over offset-based pagination at scale.
2. Region can be inferred from the user's IP using an IP-to-region database, or it can be passed explicitly by the client.

```http
GET /article/{id}
```

Returns:

```http
302 Found
Location: https://publisher.example/article-path
```

This endpoint is optional. The browser could directly navigate to the publisher URL from the article object. A redirect endpoint is useful if we want click analytics before sending the user to the publisher.

## High-Level Design

Publisher ingestion can happen through three sources:

1. Webhooks, when a publisher supports push-based updates.
2. RSS polling, when a publisher exposes feeds.
3. Web scraping, when neither webhook nor RSS is available.

Preference order:

```text
Webhook > RSS > web scrape
```

`rssUpdateFreq` can be configured manually by admins or adjusted by the data collection service based on real-time publisher behavior.

Publisher tiers:

| Tier | Update frequency | Worker behavior |
|---|---|---|
| High frequency | Less than 15 minutes | Poll/scrape frequently |
| Medium frequency | Less than 1 hour | Poll/scrape hourly |
| Low frequency | More than 1 hour | Poll/scrape less often |

The data collection service can run separate worker pools for publisher tiers. New article events are written to the article store and used to update feed caches.

## Deep Dives

### Read Latency

Current scale estimate:

- Publishers: 10K.
- Articles per publisher: 1 article every 10 minutes, around 150 per day.
- Retention: 30 days.
- Total articles: `10K * 150 * 30 = 45M`.
- Article row size: around 200 bytes.
- Table size: around 10GB.

Naive query latency:

- Full table scan can take seconds.
- Sorting and offset pagination add more latency.
- Network latency adds additional overhead.

### Optimization 1: Indexing

Use an index on `(region, published_at)`.

This helps, but if the filtered region still contains around 1GB of rows, latency can still be too high for a 200ms target.

### Optimization 2: Cursor-Based Pagination

Cursor pagination avoids repeatedly scanning and skipping rows.

Cursor options:

1. Timestamp cursor: good, but duplicate timestamps need careful handling.
2. Composite cursor on `(published_at, article_id)`: great, stable ordering.
3. Monotonically increasing article IDs: great, but requires a specialized ID generator.

What about newly arrived articles while the user is scrolling?

Use a double-cursor strategy:

```json
{
  "start_cursor": "newest item seen",
  "end_cursor": "oldest item seen"
}
```

The client can expand in both directions and avoid duplicates.

### Media Delivery

Use a CDN for thumbnails and media assets.

Store thumbnails in multiple dimensions in object storage and serve the right size based on device and viewport.

### Write TPS

Publisher write traffic is small:

```text
10K publishers * 150 articles/day = 1.5M articles/day = around 15 writes/second
```

A single properly tuned PostgreSQL writer can handle this. Sharding is not required for the initial write path.

### Read QPS

Read traffic is much larger:

```text
500M DAU * 5 feed refreshes/day * 10 requests/feed = 25B requests/day
```

This is around 250K requests per second.

Read replicas:

1. A vertically scaled PostgreSQL instance may handle around 100K simple indexed point lookups per second under favorable conditions.
2. Each feed request reads multiple rows.
3. If each request reads 20 rows, a single instance can only serve a much smaller effective request rate.
4. Many read replicas would be needed, and this still does not fully solve latency.

Redis feed cache:

1. Store one sorted set per region.
2. Use article timestamp or ranking score as the sorted-set score.
3. On new article insert, call `ZADD`.
4. Trim old entries with `ZREMRANGEBYRANK` to keep only the latest feed window.

Example cache model:

```text
feed:{region} -> Redis sorted set of article IDs
article:{article_id} -> article payload
```

Cluster sizing:

- Redis can handle around 100K to 200K operations per second per node depending on workload.
- Data size is small for the latest regional feed window:
  - `200 regions * 500 articles/region * 200 bytes = around 20MB`.
- A Redis Sentinel setup can be enough if the data model remains this small.
- Use one primary and replicas for reads.
- Geo-distribute replicas for lower latency.

Cache pattern:

- Write-around or event-driven cache population is preferred.
- Cache-aside is possible but has more TTL and staleness issues.
- CDN is not a great fit for feed responses because cursors and regions create many request variations.

### Feeding Redis

There are multiple ways to update the Redis feed cache:

1. Data collection service updates Redis directly.
2. Data collection service writes to PostgreSQL and publishes an event.
3. CDC publishes article changes from PostgreSQL to Kafka.
4. Feed generation workers consume Kafka and update Redis.

Kafka is useful because multiple downstream systems care about article events:

- Feed generation.
- Analytics.
- Notification systems.
- Search indexing.

Prefer CDC from PostgreSQL over dual writes from the data collection service. If the data collection service writes to the DB and Kafka separately, Kafka publish failure can create inconsistencies.

### No SPOF

1. Run web servers with autoscaling across zones.
2. Geo-distribute read replicas or cache replicas.
3. Keep Redis replicas close to major user regions.
4. Use managed failover for database and cache.

### Handling Spikes

1. Autoscale web servers.
2. Add more cache read replicas.
3. Keep feed cache warm and avoid expiry-based thundering herds.
4. Rate limit abusive clients.

### Category-Based Feeds

API:

```http
GET /feed?region=US&category=sports&cursor={cursor}&limit={limit}
```

Approach 1:

- Store multiple sorted sets per category and region.
- Example: `feed:UK:sports`, `feed:UK:politics`, and `feed:UK`.

Trade-off:

- More memory.
- Article update or delete needs updates in multiple sorted sets.

Approach 2:

- Pull more rows from the regional sorted set and filter in memory.
- This is simpler when categories are sparse or low traffic.

### Ranking Instead of Timestamp Ordering

If trending articles or well-known publishers should rank above less important recent articles, compute a ranking score using:

1. Publisher authority.
2. Freshness.
3. Trending velocity.
4. User engagement.

Store the score in the sorted set instead of timestamp. To avoid duplicate scores, combine the score with a monotonic tiebreaker.

### Personalized Feeds

Personalized feeds are out of scope, but the main challenge is scale:

```text
500M users * 500 articles * 200 bytes = around 50TB
```

Caching one feed per user is expensive and creates invalidation complexity when articles are updated or deleted.

## Trade-Offs

| Decision | Benefit | Cost |
|---|---|---|
| Availability over consistency | Feed stays available during partial failures | Some users may briefly see stale feeds |
| Redis regional feed cache | Very low read latency | Extra cache update pipeline |
| CDC to Kafka | Avoids dual-write inconsistency | More infrastructure |
| Cursor pagination | Stable low-latency scrolling | More client and API complexity |
| Timestamp ranking | Simple and fresh | Does not capture article quality |

## Interview Notes

- Separate write volume from read volume. Writes are small, reads are huge.
- Do not use offset pagination for infinite scroll at this scale.
- Redis sorted sets are a clean fit for regional latest-feed windows.
- CDC is better than asking every writer to publish Kafka events manually.

---
title: URL Shortener
slug: url-shortner
summary: Generate short URLs, redirect users to original URLs, and track click analytics.
tags:
  - URL Shortener
  - Redirection
  - Analytics
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
    `1-5 sec` inconsistency allowed
  Analytics record & view (FR-3 & FR-4):
    availability > consistency
    Minor delay `(1–5 sec)` in analytics updates is acceptable.
Throughput & Latencies:
  Url creation (FR-1):
    Write TPS = `1M/day = 10/s`
    Write Latency = never mind
  Url access (FR-2):
    Read QPS = `100M/day = 1k/s`
    Read Latency = `100ms`
Handle Celebrity/Hot keys
Handle traffic spikes in cost effective way (optional, only if time at end)
Uniqueness

## API Design

### FR-1: Generate short URL
Protocol: REST over HTTP

```http
POST /api/v1/urls

REQUEST BODY:
{
  "longUrl": "https://example.com/some/long/url",
  "customAlias": "my-link",
  "expiresAt": "2026-12-31T23:59:59Z"
}

STATUS : 201 CREATED
RESPONSE BODY:
{
  "shortUrl": "https://short.ly/my-link",
  "shortCode": "my-link"
}
```

### FR-2: Redirect to original URL
Protocol: HTTP redirect

```http
GET /{shortCode}

STATUS : 302 FOUND
RESPONSE HEADER:
Location: https://example.com/some/very/long/url

```

### FR-4: View URL analytics
Protocol: REST over HTTP

```http
GET /api/v1/urls/my-link/clicks

STATUS : 200 OK
RESPONSE BODY:
{
  "shortCode": "my-link",
  "totalClicks": 15230
}
```


## High-Level Design

FR-1:
Table:
- urls
  - id
  - shortCode
  - longUrl
  - createdAt
  - expiresAt

```sql
INSERT INTO urls (
    short_code,
    long_url,
    expires_at
)
VALUES (
    'my-link',
    'https://example.com/some/long/url',
    '2026-12-31T23:59:59Z'
);
```

EXPLANATION:
URL Service receives the long URL from the user.

If custom alias is provided, use it as the short code.

If custom alias is not provided, generate a random short code.

Short code can be generated using Base62 characters.

Base62 contains:

```text
a-z, A-Z, 0-9
```

The `shortCode` should be unique.

Postgres unique constraint on `shortCode` helps avoid duplicates.

If generated short code already exists, generate another short code and retry.

FR-2:
Table:
- urls
  - id
  - shortCode
  - longUrl
  - createdAt
  - expiresAt

```sql
SELECT id, short_code, long_url, expires_at
FROM urls
WHERE short_code = 'my-link';
```

EXPLANATION:
Redirect Service receives the short code.

First, it checks whether the short code exists.

If the short code does not exist, return `404 NOT FOUND`.

If the short URL is expired, return `410 GONE`.

If the short URL is valid, return `302 FOUND` with the original long URL in the `Location` header.

Redis can be used to cache `shortCode -> longUrl` mapping so that most redirect requests do not hit Postgres.

FR-3:
Table:
- clickEvents
  - id
  - shortUrlId
  - clickedAt
  - country
  - device
  - referrer

```sql
INSERT INTO click_events (
    short_url_id,
    clicked_at,
    country,
    device,
    referrer
)
VALUES (
    1,
    NOW(),
    'IN',
    'MOBILE',
    'google.com'
);
```

EXPLANATION:
For every successful redirect, the system should record one click event.

The click event contains timestamp, location, device and referrer.

Analytics recording should not block the redirect.

So Redirect Service can push the click event to a queue.

Analytics Worker consumes the event from the queue and stores it in Postgres.

This keeps redirect latency low.

FR-4:
Table:
- clickEvents
  - id
  - shortUrlId
  - clickedAt
  - country
  - device
  - referrer

```sql
SELECT COUNT(*) AS total_clicks
FROM click_events
WHERE short_url_id = 1;

SELECT country, COUNT(*) AS clicks
FROM click_events
WHERE short_url_id = 1
GROUP BY country;

SELECT device, COUNT(*) AS clicks
FROM click_events
WHERE short_url_id = 1
GROUP BY device;

SELECT referrer, COUNT(*) AS clicks
FROM click_events
WHERE short_url_id = 1
GROUP BY referrer;
```

EXPLANATION:
Analytics Service reads data from `clickEvents`.

It returns total clicks, geographic distribution, device distribution and referrer distribution.

For basic HLD interview discussion, querying `clickEvents` is enough.

If traffic becomes very high, we can optimize later using pre-aggregated analytics tables in the deep dive section.


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

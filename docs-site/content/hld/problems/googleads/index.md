---
title: Google Ads
slug: googleads
summary: Serve ads, track impressions/clicks/conversions, and provide campaign analytics to advertisers.
tags:
  - Ads
  - Analytics
  - Event Processing
difficulty: Hard
---

## Functional Requirements

1. Advertiser should be able to create ad campaigns with budget, bid, targeting rules and ad creatives.
2. System should be able to serve relevant ads for a given user/page/search context.
3. System should record ad events like impressions, clicks and conversions.
4. Advertiser should be able to view campaign analytics. (e.g., impressions, clicks, CTR, CPC, spend, conversions, trends)

## Out of Scope

1. User auth & authz
2. Fraud detection
3. Advanced ML-based ad ranking

## Non-Functional Requirements

No single point of failure (fault tolerance).
CAP Theorem:
Ad serving & event recording (FR-2 & FR-3):
availability > consistency
`1-5 sec` inconsistency allowed
Analytics aggregation & view (FR-3 & FR-4):
availability > consistency
Minor delay `(1–5 sec)` in analytics updates is acceptable.
Throughput & Latencies:
Campaign creation (FR-1):
Write TPS = `1M/day = 10/s`
Write Latency = never mind
Ad serving (FR-2):
Read QPS = `1B/day = 10k/s`
Read Latency = `100ms`
Handle Celebrity/Hot keys
Handle traffic spikes in cost effective way (optional, only if time at end)


## API Design

```http
POST /api/v1/campaigns

REQUEST BODY:
{
  "advertiserId": "adv-123",
  "name": "Summer Sale Campaign",
  "dailyBudget": 10000,
  "bidAmount": 5,
  "targetCountries": ["IN"],
  "targetKeywords": ["shoes", "running shoes"],
  "startTime": "2026-12-01T00:00:00Z",
  "endTime": "2026-12-31T23:59:59Z"
}

STATUS : 201 CREATED
RESPONSE BODY:
{
  "campaignId": "camp-123",
  "status": "ACTIVE"
}
```

```http
POST /api/v1/ads

REQUEST BODY:
{
  "campaignId": "camp-123",
  "title": "Buy Running Shoes",
  "description": "Flat 40% off on running shoes.",
  "landingUrl": "https://example.com/shoes",
  "imageUrl": "https://cdn.example.com/shoe-ad.png"
}

STATUS : 201 CREATED
RESPONSE BODY:
{
  "adId": "ad-123",
  "status": "ACTIVE"
}
```

```http
POST /api/v1/ad-requests

REQUEST BODY:
{
  "userId": "user-123",
  "country": "IN",
  "device": "MOBILE",
  "keywords": ["running shoes"],
  "placement": "SEARCH_TOP"
}

STATUS : 200 OK
RESPONSE BODY:
{
  "adId": "ad-123",
  "campaignId": "camp-123",
  "title": "Buy Running Shoes",
  "description": "Flat 40% off on running shoes.",
  "landingUrl": "https://example.com/shoes",
  "imageUrl": "https://cdn.example.com/shoe-ad.png",
  "impressionTrackingId": "imp-123"
}
```

```http
POST /api/v1/ad-events

REQUEST BODY:
{
  "eventType": "CLICK",
  "adId": "ad-123",
  "campaignId": "camp-123",
  "userId": "user-123",
  "impressionTrackingId": "imp-123",
  "country": "IN",
  "device": "MOBILE",
  "placement": "SEARCH_TOP",
  "eventTime": "2026-12-10T10:30:00Z"
}

STATUS : 202 ACCEPTED
RESPONSE BODY:
{
  "status": "RECORDED"
}
```

```http
GET /api/v1/campaigns/{campaignId}/analytics?from={from}&to={to}

STATUS : 200 OK
RESPONSE BODY:
{
  "campaignId": "camp-123",
  "impressions": 100000,
  "clicks": 2500,
  "conversions": 300,
  "ctr": 2.5,
  "cpc": 5,
  "spend": 12500,
  "trend": [
    {
      "timestamp": "2026-12-10T10:00:00Z",
      "impressions": 10000,
      "clicks": 300,
      "conversions": 40,
      "spend": 1500
    },
    {
      "timestamp": "2026-12-10T11:00:00Z",
      "impressions": 12000,
      "clicks": 350,
      "conversions": 50,
      "spend": 1750
    }
  ]
}
```


## High-Level Design

FR-1:
Table:
- campaigns
  - id
  - advertiserId
  - name
  - dailyBudget
  - bidAmount
  - status
  - startTime
  - endTime
  - createdAt

- campaignTargeting
  - id
  - campaignId
  - targetCountry
  - targetKeyword
  - device

- ads
  - id
  - campaignId
  - title
  - description
  - landingUrl
  - imageUrl
  - status
  - createdAt

```sql
INSERT INTO campaigns (
    advertiser_id,
    name,
    daily_budget,
    bid_amount,
    status,
    start_time,
    end_time,
    created_at
)
VALUES (
    'adv-123',
    'Summer Sale Campaign',
    10000,
    5,
    'ACTIVE',
    '2026-12-01T00:00:00Z',
    '2026-12-31T23:59:59Z',
    NOW()
);
```

EXPLANATION:
Campaign Service allows advertisers to create campaigns.

Each campaign has budget, bid, targeting rules and active time range.

Targeting rules are stored in `campaignTargeting`.

Ad creatives are stored in `ads`.

One campaign can have multiple ads.

FR-2:
Table:
- campaigns
  - id
  - advertiserId
  - dailyBudget
  - bidAmount
  - status
  - startTime
  - endTime

- campaignTargeting
  - id
  - campaignId
  - targetCountry
  - targetKeyword
  - device

- ads
  - id
  - campaignId
  - title
  - description
  - landingUrl
  - imageUrl
  - status

```sql
SELECT a.id, a.campaign_id, a.title, a.description, a.landing_url, a.image_url
FROM ads a
JOIN campaigns c ON a.campaign_id = c.id
JOIN campaign_targeting ct ON c.id = ct.campaign_id
WHERE c.status = 'ACTIVE'
  AND a.status = 'ACTIVE'
  AND c.start_time <= NOW()
  AND c.end_time >= NOW()
  AND ct.target_country = 'IN'
  AND ct.target_keyword = 'running shoes'
ORDER BY c.bid_amount DESC
LIMIT 1;
```

EXPLANATION:
Ad Serving Service receives the user/page/search context.

The context can contain country, device, placement and keywords.

The service finds active campaigns matching the targeting rules.

For simple HLD interview design, ads can be ranked by bid amount.

The selected ad is returned to the client.

When the ad is returned, the system also creates an impression event.

This impression event should be pushed asynchronously to an event queue.

Redis can cache active campaign and targeting data so that every ad request does not hit Postgres.

FR-3:
Table:
- adEvents
  - id
  - eventType
  - adId
  - campaignId
  - advertiserId
  - userId
  - impressionTrackingId
  - eventTime
  - country
  - device
  - placement
  - bidAmount

```sql
INSERT INTO ad_events (
    event_type,
    ad_id,
    campaign_id,
    advertiser_id,
    user_id,
    impression_tracking_id,
    event_time,
    country,
    device,
    placement,
    bid_amount
)
VALUES (
    'CLICK',
    'ad-123',
    'camp-123',
    'adv-123',
    'user-123',
    'imp-123',
    NOW(),
    'IN',
    'MOBILE',
    'SEARCH_TOP',
    5
);
```

EXPLANATION:
Ad events are the most important part of the analytics system.

The system records different event types:

```text
IMPRESSION
CLICK
CONVERSION
```

An `IMPRESSION` event is recorded when an ad is shown.

A `CLICK` event is recorded when the user clicks the ad.

A `CONVERSION` event is recorded when the user performs the desired action like purchase, signup or app install.

Ad Serving Service should not synchronously write events to Postgres.

Instead, it pushes ad events to Kafka or a queue.

Analytics Worker consumes these events and stores them in `adEvents`.

This keeps ad serving fast and allows analytics to be updated with a small delay.

FR-4:
Table:
- adEvents
  - id
  - eventType
  - adId
  - campaignId
  - advertiserId
  - userId
  - eventTime
  - country
  - device
  - placement
  - bidAmount

- campaignAnalyticsHourly
  - campaignId
  - adId
  - bucketStart
  - country
  - device
  - placement
  - impressions
  - clicks
  - conversions
  - spend

```sql
SELECT
    SUM(impressions) AS impressions,
    SUM(clicks) AS clicks,
    SUM(conversions) AS conversions,
    SUM(spend) AS spend
FROM campaign_analytics_hourly
WHERE campaign_id = 'camp-123'
  AND bucket_start >= '2026-12-10T00:00:00Z'
  AND bucket_start < '2026-12-11T00:00:00Z';

SELECT
    bucket_start,
    SUM(impressions) AS impressions,
    SUM(clicks) AS clicks,
    SUM(conversions) AS conversions,
    SUM(spend) AS spend
FROM campaign_analytics_hourly
WHERE campaign_id = 'camp-123'
GROUP BY bucket_start
ORDER BY bucket_start;
```

EXPLANATION:
Advertisers need campaign analytics like impressions, clicks, CTR, CPC, spend and conversions.

Basic formulas:

```text
CTR = clicks / impressions * 100
CPC = spend / clicks
Conversion Rate = conversions / clicks * 100
```

Raw `adEvents` table stores all events.

But analytics dashboards should not scan raw events every time.

So Analytics Worker can also update `campaignAnalyticsHourly`.

This table stores hourly aggregated metrics for each campaign, ad, country, device and placement.

Analytics Service reads from `campaignAnalyticsHourly` and returns:

```text
1. Total impressions
2. Total clicks
3. Total conversions
4. CTR
5. CPC
6. Spend
7. Time-based trends
8. Breakdown by country, device and placement
```

This keeps advertiser dashboards fast while still keeping raw events for detailed debugging.
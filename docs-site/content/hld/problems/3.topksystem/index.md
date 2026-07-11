---
title: Top K System
slug: topksystem
summary: Track item activity and return top K items globally or by category for a given time window.
tags:
  - TopK
  - Ranking
  - Analytics
difficulty: Hard
---

## Functional Requirements

1. System should be able to record activity events for items. (e.g., views, clicks, likes)
2. System should be able to compute top K items based on event count for different time windows. (e.g., last 1 hour, last 24 hours, last 7 days)
3. User should be able to fetch top K items globally or by category. (TODO)
4. Tumbling window support. (TODO)


## Out of Scope

1. User auth & authz
2. Personalized ranking
3. Fraud detection

## Non-Functional Requirements

No single point of failure (fault tolerance).
CAP Theorem:
  Event recording & ranking update (FR-1 & FR-2):
    availability > consistency
    `1 min` inconsistency allowed
Throughput & Latencies:
  Event recording (FR-1):
    Write TPS = `100M/day = 1k/s`
    Write Latency = `never mind`
  Top K read (FR-3 & FR-4):
    Read QPS = `10M/day = 100/s`
    Read Latency = `100ms`
Handle Celebrity/Hot keys
Handle traffic spikes in cost effective way (optional, only if time at end)


## API Design


```http
POST /api/v1/events

REQUEST BODY:
{
  "itemId": "item-123",
  "eventTime": "2026-12-31T10:00:00Z"
}

STATUS : 202 ACCEPTED
RESPONSE BODY:
{
  "status": "RECORDED"
}
```

```http
GET /api/v1/top-k?window=24h&k=10

STATUS : 200 OK
RESPONSE BODY:
{
  "window": "24h",
  "items": [
    {
      "rank": 1,
      "itemId": "item-123",
    },
    {
      "rank": 2,
      "itemId": "item-456",
    },
    ....
  ]
}
```


## High-Level Design

::TABBED::
::TAB::
TITLE: FR-1
IMAGE: images/FR-1.png
::SIDEBYSIDE::
::LEFT::
EXPLANATION:
Event Service receives activity events for items.
gh, we can optimize later using stream processing and Redis sorted sets in the deep dive section.
::END-LEFT::
::RIGHT::
SQL:
```sql
SELECT itemId, COUNT(*) AS cnt
FROM Events
WHERE eventTime >= NOW() - INTERVAL '1 day'
GROUP BY itemId
ORDER BY cnt DESC
LIMIT k;
```
::END-RIGHT::
::END-SIDEBYSIDE::
::END-TAB::

::END-TABBED::



## Deep Dives:

### READ LATENCY:
::TABBED::
::TAB::
TITLE: Current Approach
IMAGE: images/current.png
EXPLANATION:
		1) Tables Size:
			a) Event Table:
				i) rows: 50B/day * 400 days/year * 10 years = 50B * 4k = 2*10^14
				ii) size: 100Bytes/row * 2*10^14 = 20 PB
        2) Target < 100ms:
            Time to scan 20PB of data with 1GB/s SSD speed = 20 *10^6 s
::END-TAB::
::TAB::
TITLE: Indexing
EXPLANATION:
on eventTime: TODO
::END-TAB::
::TAB::
TITLE: Pagination
EXPLANATION:
Not applicable to this problem
::END-TAB::
::TAB::
TITLE: Bucketing + Indexing
IMAGE: images/bucketing.png
::SIDEBYSIDE::
::LEFT::
EXPLANATION:
* rows:

	* total 10B videos on YT
	* 90% views on top 1% videos

		* 90% of 50B on 100M
		* 100M rows for 90%
	* remaining 10% views on top 10% videos

		* 10% of 50B on 1B
		* 1B rows
	* You can simplify it by saying 90% of videos get `<1000s` views so those can be ignored & we just focus on top 10% of videos = 1B videos
	* So, if window:

		* last hour: rows = 1B
		* last year: `24 * 365 * 1B = 9 Trillion`

* size:

	* last hour: `100 * 1B = 100 GB`
	* last year: `100 * 9T = 900 TB`

* time:
	* last hour: 100s
	* last year: hours - days

		* Have multiple tables to solve this

			* helps

::END-LEFT::
::RIGHT::

SQL:
```sql
SELECT
	itemId,
	SUM(count) AS total_count
FROM EventsHourly
WHERE flooredHourTime >= NOW() - INTERVAL '24 hours'
GROUP BY itemId
ORDER BY total_count DESC
	LIMIT 10;
```

::END-RIGHT::
::END-TAB::
::TAB::
TITLE: Materialized Views/ Denormalization
EXPLANATION:
NA
::END-TAB::
::TAB::
TITLE: Caching
IMAGE: images/caching.png
EXPLANATION:
				i) Depends on inconsistency we agreed upon. If its less than 5min. Then we are good. Else not
				ii) 
				iii) cron runs every 2mins
::END-TAB::
::TAB::
TITLE: TSDB
EXPLANATION:
i) No - since high cardinality of itemId
::END-TAB::
::TAB::
TITLE: OLAP
EXPLANATION:
::END-TAB::
::END-TABBED::

::SEPERATOR::
### WRITE TPS:
EXPLANATION:
i) Depends on inconsistency we agreed upon. If its less than 5min. Then we are good. Else not
ii)
iii) cron runs every 2mins

::SEPERATOR::
### READ TPS:
EXPLANATION:
i) Depends on inconsistency we agreed upon. If its less than 5min. Then we are good. Else not
ii)
iii) cron runs every 2mins
---

title: Rate Limiter
slug: rate-limiter
summary: Protect APIs and downstream services by limiting how many requests a client can make within a configured period.
tags:

* API Gateway
* Distributed Systems
* Redis
* Traffic Management
  difficulty: Hard
  requirementsLayout: stacked

---

## Overview

A rate limiter controls how many requests a client (user, IP, API key, service) can make in a given time window, protecting your system from abuse, accidental overload, and cost blowouts.



## Functional Requirements

1. Admin should be able to configure rate limit rules per client (user/API key/IP) and per resource (API endpoint/route) — e.g. "100 requests per minute", "5 login attempts per 15 minutes".
2. System should allow/reject incoming requests based on whether the client has exceeded their configured limit for that resource.
3. User (client) should receive a clear response indicating they've been rate-limited, including when they can retry.
4. Admin should be able to update rate limit rules for a given client without redeploying the service.





## Out of Scope
1. User authentication and authorization.
2. Bot detection and CAPTCHA challenges.
3. Request queuing and asynchronous job scheduling.
4. ML-based adaptive rate limiting.


## Non-Functional Requirements

1. Fault Tolerance
2. CAP Theorem:
    3. Rule Configuration (write, FR-1/4) ↔ Rule Enforcement (read, FR-2)
        4. Availability > Consistency
        5. 1–5 sec staleness allowed.
        6. If an admin updates a client's limit from 100/min to 200/min, it's fine if some rate limiter nodes keep enforcing the old limit for a few seconds until the config propagates (via cache TTL or pub-sub invalidation).
3. System Scale:
    4. new system, 10 years
   5. Userbase  : 5B internet users , 2B DAU, sending 100 reqs a day each (whatsapp)
4. Throughput & Latencies:
    5. FR-1/4:
        6. Rule creations/updates = 100/day
        7. Rule creation/update Latency = 100ms
    8. FR-3:
        9. Client requests = 2B*100/day = 200B/day = 2M/s
        10. Response latency for RL exceed case = 100ms



## API Design


### FR-1: Create RateLimit Rule
Protocol: REST
```http
POST /api/v1/rate-limit-rules

REQUEST BODY:
{
  "name": "Order Creation Limit", 
  "scopeType": "USER", 
  "resource": "/api/v1/orders", 
  "httpMethods": [ "POST" ],
  "algorithm": "TOKEN_BUCKET",
  "algorithmConfig": {
    "bucketCapacity": 100,
    "refillRatePerMilliSec": 10000,
  }
}

STATUS : 201 CREATED
RESPONSE BODY:
{
  "ruleId": "rule_4021",
  "status": "ACTIVE", 
  "createdAt": "2026-07-10T10:00:00Z"
}
```

### FR-2: Check request against limit
Protocol: REST
```http
POST /internal/v1/rate-limit/check

REQUEST BODY:
{
  "clientId": "client_7712",
  "httpMethods": "GET" 
  "resource": "/api/v1/campaigns"
}

STATUS : 200 OK
RESPONSE BODY:
{
  "allowed": true,
  "remaining": 42,
  "resetAt": "2026-07-10T12:01:00Z"
}
```

### FR-3: Client calling original API
Protocol: REST
```http
GET /api/v1/campaigns

STATUS : 429 TOO MANY REQUESTS
RESPONSE HEADER:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1720598460
Retry-After: 42

RESPONSE BODY:
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "You have exceeded 100 requests per 60 seconds for this endpoint. Retry after 42 seconds."
}
```



### FR-4: Update RateLimit Rule
Protocol: REST
```http
PATCH /api/v1/rate-limit-rules/{rule_id}

REQUEST BODY:
{
  "algorithmConfig": {
    "bucketCapacity": 100,
    "refillRatePerSecond": 10,
  }
}

STATUS : 201 CREATED
RESPONSE BODY:
{
  "ruleId": "rule_4021",
  "status": "ACTIVE", 
  "updatedAt": "2026-07-10T10:00:00Z"
}
```
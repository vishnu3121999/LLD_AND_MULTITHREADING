# Approach Comparison

## Existing Packages

`A_basic` demonstrates a fixed-window rate limiter with clients, rate-limit rules, buckets, and request allowance decisions.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- Clients are assigned rate-limit rules.
- A rule defines max requests per time window.
- A bucket tracks current window and request count.

Action based points:
- Admin adds rules and clients.
- User/system asks whether a request is allowed.
- System resets bucket windows and increments request count.

Misc:
- A_basic implements fixed-window logic directly.
- Sliding window, token bucket, distributed storage, and concurrency are deferred.

#### Common Misc

Offline or online:
- Treat as API infrastructure with datastore maps.

Extensibility:
- Rate-limiting algorithms can become Strategy later.

History and undo:
- Not needed.

Notifications:
- Not needed.

Exception handling:
- Missing client/rule and clock issues are later validations.

Concurrency:
- Concurrent increments for the same client are deferred.

### UseCase Diagram

Actors:
- User/System
- Admin
- System

UseCases:
- addRateLimitRule(Admin) -> create RateLimitRule(System)
- addClient(Admin) -> create Client(System)
- allowRequest(User/System) -> get/create bucket(System) -> reset window if needed(System) -> allow or reject(System)

### Class Diagram

Core entities:
- `Client(clientId, name, rateLimitRuleId)` points to assigned rule.
- `RateLimitRule(rateLimitRuleId, maxRequests, windowMillis)` stores policy.
- `RateLimitBucket(rateLimitBucketId, windowStartMillis, requestCount)` stores mutable counter state.

Method placement:
- `allowRequest` belongs in the facade because it coordinates client, rule, and bucket.
- `reset` and `increment` belong in `RateLimitBucket` because they only mutate bucket state.

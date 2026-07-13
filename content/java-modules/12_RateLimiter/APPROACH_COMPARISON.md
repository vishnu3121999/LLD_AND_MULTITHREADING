# Approach Comparison

## Existing Packages

`A_basic` demonstrates a fixed-window API rate limiter with clients, API endpoints, rate-limit plans, endpoint rules, buckets, and explicit allow/block decisions.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- The system supports multiple API clients.
- The system supports multiple API endpoints.
- A client is assigned one rate-limit plan.
- A plan contains endpoint-specific rate-limit rules.
- A rule defines the algorithm label, max request count, and window size.
- A bucket stores the mutable request count for one client and one rule.
- A decision tells the caller whether the request is allowed, remaining quota, and retry-after time.

Action based points:
- Admin adds API endpoints.
- Admin adds rate-limit plans.
- Admin adds rules to plans.
- Admin adds clients and assigns plans.
- User/system asks whether a request is allowed for a client and endpoint.
- System finds the matching rule, creates or reads a bucket, resets expired windows, increments allowed requests, and returns a decision.

Misc:
- A_basic implements fixed-window behavior directly in the facade.
- Sliding window, token bucket, leaky bucket, distributed counters, Redis persistence, and rule priorities are deferred.

#### Common Misc

Offline or online:
- Treat this as online/API infrastructure because clients and endpoints are catalog-like entities and the facade represents server-side use cases.

Extensibility:
- `RateLimitAlgorithm` is an enum in A_basic with `FIXED_WINDOW`.
- Future packages can replace the facade's direct algorithm logic with Strategy for fixed window, sliding window, token bucket, or leaky bucket.
- Future packages can add user-level, IP-level, tenant-level, and endpoint group limits.

Store full history and support undo:
- Not needed for A_basic.
- Request logs or audit events can be added later if reporting is required.

Notification broadcasts:
- Not needed.
- Later packages could notify metrics or alerting systems when clients are blocked often.

Exception handling:
- Missing client, missing plan, missing endpoint rule, duplicate IDs, invalid limits, and clock issues are later-package concerns.

Edge cases:
- No rule for endpoint, overlapping rules, unlimited clients, negative timestamps, and retry-after rounding are not handled in A_basic.

Concurrency and thread-safety:
- Real rate limiters must handle concurrent requests for the same bucket.
- A_basic intentionally uses `HashMap` and no locks; concurrency belongs to a later package.

### UseCase Diagram

Actors:
- User/System
- Admin
- System

UseCases:
- addApiEndpoint(Admin) -> create ApiEndpoint(System) -> putApiEndpoint(DataStore)
- addRateLimitPlan(Admin) -> create RateLimitPlan(System) -> putRateLimitPlan(DataStore)
- addRateLimitRule(Admin) -> create RateLimitRule(System) -> putRateLimitRule(DataStore) -> add ruleId to RateLimitPlan(System)
- addClient(Admin) -> create Client(System) -> putClient(DataStore)
- allowRequest(User/System) -> get Client(System) -> get RateLimitPlan(System) -> find endpoint rule(System) -> get or create RateLimitBucket(System) -> reset expired window(System) -> increment or block(System) -> return RateLimitDecision(User/System)

### Class Diagram

Identifying layers/structure:
- Main:
  - Creates datastore and `RateLimiterFacade`.
  - Generates direct admin-created IDs.
  - Adds endpoints, plan, rules, and client.
  - Calls `allowRequest` to demonstrate allowed, blocked, and reset-window flows.
- Facade:
  - `RateLimiterFacade` owns the user, system, and admin workflows.
  - It coordinates datastore reads/writes and bucket state updates.
- Core entities:
  - `Client`, `ApiEndpoint`, `RateLimitPlan`, `RateLimitRule`, `RateLimitBucket`, and `RateLimitDecision`.
- Datastore:
  - `DataStore` and `InMemoryDataStore` store maps only.
  - Datastore has no business logic, no validation, and no ID generation.

Core entities and relationships:
- `Client(clientId, name, rateLimitPlanId)` points to its assigned plan.
- `ApiEndpoint(apiEndpointId, path, httpMethod)` represents a limited API route.
- `RateLimitPlan(rateLimitPlanId, name, rateLimitRuleList)` stores rule IDs.
- `RateLimitRule(rateLimitRuleId, apiEndpointId, rateLimitAlgorithm, maxRequests, windowMillis)` stores endpoint quota configuration.
- `RateLimitBucket(rateLimitBucketId, windowStartMillis, requestCount)` stores mutable counter state.
- `RateLimitDecision(clientId, apiEndpointId, rateLimitStatus, remainingRequests, retryAfterMillis, requestedAtMillis)` is returned to the caller and is not stored.

Method placement:
- `allowRequest` belongs in the facade because it coordinates client, plan, rule, and bucket.
- `getOrCreateBucket` and `resetWindowIfExpired` are system methods in the facade.
- `addClient`, `addApiEndpoint`, `addRateLimitPlan`, and `addRateLimitRule` are admin methods in the facade.
- `RateLimitBucket.reset`, `increment`, and `getRemainingRequests` belong in the bucket because they only use bucket state.
- Datastore methods only get, put, contains, and remove entities.

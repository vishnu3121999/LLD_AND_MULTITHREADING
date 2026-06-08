# Approach Comparison

## Existing Packages

`A_basic` demonstrates services, circuit breakers, CLOSED/OPEN state, failure counting, and request blocking after a threshold.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- A downstream service has one circuit breaker.
- A circuit breaker has failure threshold, failure count, and state.

Action based points:
- Admin registers circuit breakers and downstream services.
- User/system calls a downstream service.
- System records success or failure and opens the breaker when failures hit threshold.

Misc:
- A_basic supports CLOSED and OPEN only.
- HALF_OPEN, time-based reset, fallback, metrics, and concurrency are deferred.

#### Common Misc

Offline or online:
- Treat as infrastructure/API style.

Extensibility:
- State transitions and fallback policy can be enhanced in later packages.

History and undo:
- Not needed.

Notifications:
- Not needed in A_basic.

Exception handling:
- Missing service/breaker is later validation.

Concurrency:
- Concurrent failure updates are deferred.

### UseCase Diagram

Actors:
- User/System
- Admin
- System

UseCases:
- addCircuitBreaker(Admin) -> create CircuitBreaker(System)
- addDownstreamService(Admin) -> create DownstreamService(System)
- callService(User/System) -> check breaker state(System) -> record success/failure(System) -> return result(System)

### Class Diagram

Core entities:
- `DownstreamService(downstreamServiceId, name, circuitBreakerId)` points to breaker.
- `CircuitBreaker(circuitBreakerId, failureThreshold, failureCount, breakerState)` owns breaker state.

Method placement:
- `callService` belongs in the facade because it coordinates service lookup and breaker update.
- `recordSuccess` and `recordFailure` belong in `CircuitBreaker` because they mutate only breaker state.

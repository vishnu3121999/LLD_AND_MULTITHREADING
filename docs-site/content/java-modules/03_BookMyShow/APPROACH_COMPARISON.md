# 03_BookMyShow Approach Progression

These packages model a simple movie-ticket booking system:

- Admin catalog setup for cities, movies, theaters, screens, shows, and seats
- Fixed seat layouts per screen/auditorium
- Seat types: NORMAL, PREMIUM, and RECLINER
- Show-specific base price, calculated seat price, and availability
- Search shows by movie and city
- Temporary seat holds before payment
- Payment hierarchy with credit-card and UPI data objects
- Hold expiry timestamp is recorded only on the pending ticket
- Ticket lifecycle from pending payment to confirmed or expired
- Direct exception handling for missing data, invalid inputs, ticket state, and seat availability

The progression keeps each package runnable on its own. Later packages should copy the previous package and introduce one focused idea.

## A_basicSeatHoldBooking: Catalog, Search, Holds, Expiry, And Pricing

Main idea:

```text
City, Movie, Theater, Screen, Seat, Show, ShowSeat, Ticket, Payment, CreditCardPayment, and UPIPayment are simple domain models
City owns the list of theaters in that city
Theater owns screens, but does not store city
Screen owns fixed layout seat ids, but does not store theater
Seat stores only seat id and seat type
Show stores only movie and start time
Entity id lists use domain names like theaterList, screenList, seatList, and showList
Ticket stores selected show-seat ids in showSeatList and the calculated ticket price
Ticket owns the hold expiry time
Entity list helpers follow addTheater(id) and getTheaterList() naming
Seat = fixed physical seat in a screen layout
ShowSeat = per-show seat with show-seat id, seat id, base price, calculated seat price, and booking status
ShowSeat does not store show id or holding ticket id
Ticket.showSeatList is the source of which seats were selected for a pending booking
SeatType = NORMAL, PREMIUM, RECLINER
SeatStatus = AVAILABLE, HELD, BOOKED
TicketStatus = PENDING_PAYMENT, CONFIRMED, EXPIRED
PaymentStatus = PENDING, COMPLETED, FAILED
BookMyShowFacade owns the first-version admin and user workflows directly
Main creates random ids for admin-created catalog entities
Ticket ids are created by the booking workflow and returned from selectSeats
Facade admin methods are add-only: add city, movie, theater, screen, screen seat, and show
Facade method order is user methods, system methods, admin methods, then helpers
addSeat builds the fixed screen layout before shows are created
addShow copies the screen layout into show seats with a base price
addShow creates show-seat ids using the show id and seat id, so the facade can find show seats for a show without a reverse showId field on ShowSeat
Facade user methods search shows, view show seats, select seats, and pay
getSeatsForShow expires stale pending tickets, releases seats still held by those tickets, and recalculates available show-seat prices
selectSeats creates a pending ticket, holds selected seats, and delegates final ticket price calculation to PriceCalculator using the ticket object
PriceCalculator keeps base price, seat type, and time-of-day logic directly for show-seat price
PriceCalculator keeps discount and tax logic directly for final ticket price
selectSeats and pay stay happy-path and do not run validation checks
pay accepts a Payment object, delegates to PaymentProcessor, then books seats and confirms the ticket on success
PaymentProcessor keeps external payment API behavior outside the Payment entity
PaymentProcessor uses a simple centralized dispatcher for CreditCardPayment and UPIPayment
PaymentProcessor handler methods return true in package A to keep payment simulation simple
DataStore is the storage interface
InMemoryDataStore stores all domain objects in HashMap fields named cityMap, movieMap, theaterMap, screenMap, showMap, seatMap, showSeatMap, and ticketMap
Main demonstrates multi-city setup, layout, pricing pipeline, search, seat selection, payment, and booking
```

Best for:

- A first interview-friendly BookMyShow design
- Keeping the first version centered around one readable facade
- Keeping admin operations intentionally small and add-only
- Separating fixed auditorium layout from per-show seat availability
- Explaining why seats are held before payment
- Keeping business terminology separate from thread-safety locks

Tradeoff:

- The facade is intentionally broad in package A; later packages can split behavior only when a new capability needs it.
- Admin update/remove/cancel operations are intentionally left out of package A to keep the first version readable.
- PaymentProcessor uses simple in-method success simulation; strategy comes later.
- Package A keeps validation out of selection and payment; richer validation comes later.
- No thread-safety is guaranteed yet.

## B_Strategy: Payment Strategy

Adds one focused idea:

```text
PaymentStrategy defines a common pay(payment) behavior
CreditCardPaymentStrategy handles CreditCardPayment
UPIPaymentStrategy handles UPIPayment
PaymentProcessor owns the strategy objects as fields
PaymentProcessor picks the right strategy based on the Payment subclass
BookMyShowFacade.pay accepts only ticket id and Payment
Main creates PaymentProcessor without passing a strategy
No factory is introduced in this package
```

Best for:

- Showing that payment behavior can vary independently from booking flow.
- Keeping the first strategy step explicit and easy to trace.

Tradeoff:

- Strategy selection still lives inside PaymentProcessor; C moves that selection into a factory.

## C_Factory: Payment Strategy Factory

Adds one focused idea on top of B:

```text
PaymentStrategyFactory selects the right PaymentStrategy for the Payment object
PaymentProcessor asks the factory for a strategy at runtime
BookMyShowFacade.pay goes back to accepting only ticket id and Payment
Main no longer creates CreditCardPaymentStrategy directly
```

Best for:

- Hiding strategy selection from facade callers.
- Keeping payment creation/use cleaner once multiple payment types exist.

Tradeoff:

- The factory currently switches on payment subclass; richer type metadata can be added later if needed.

## D_COR: Pricing Chain

Adds one focused idea on top of C:

```text
PricingHandler is the chain node abstraction
PricingContext carries base price, seat type, show time, and current price through the chain
Show-seat price chain: BasePriceHandler -> SeatTypeHandler -> TimeOfDayHandler
Ticket price chain: DiscountHandler -> TaxHandler
PriceCalculator builds and runs both chains
Discount and tax still apply only at ticket-price level
```

Best for:

- Making pricing rules order-aware and independently extendable.
- Adding future handlers such as weekend surcharge, coupon discount, or convenience fee without rewriting PriceCalculator logic.

Tradeoff:

- More classes than the direct calculator in A/B/C, so it is introduced only after the basic flow is stable.

## E_ExceptionHandling: Direct Domain Exceptions

Adds one focused idea on top of D:

```text
SeatUnavailableException captures the domain case where a requested show seat cannot be selected or booked
BookMyShowFacade keeps lookup helpers that throw NoSuchElementException for missing city, movie, theater, screen, show, seat, show seat, or ticket records
BookMyShowFacade throws IllegalArgumentException for invalid method inputs such as blank ids, empty selected-seat lists, missing payment, mismatched payment amount, and non-positive base price
PaymentStrategyFactory throws IllegalArgumentException for unsupported payment object type
ShowSeat owns availability checks because seat availability state lives in ShowSeat
Ticket owns payable, confirm, and expire state checks because ticket lifecycle state lives in Ticket
pay checks ticket payable state, payment amount, payment result, then books the seats listed on the ticket and confirms the ticket
Main is the only place that catches RuntimeException, matching the throw-anywhere-catch-at-boundary style used by the reference modules
No validation chain, observer, or state pattern is introduced in this package
```

Best for:

- Making failure cases explicit without changing the core booking design.
- Showing normal Java exception choices before introducing heavier patterns.
- Keeping validation rules close to the object or facade boundary that naturally owns the data.

Tradeoff:

- Validation is still direct and method-local; future packages can improve concurrency separately.

## E_ExceptionHandlingV2: State Exceptions Only

Alternative exception-handling package copied from D_COR:

```text
No custom exception classes are introduced
IllegalStateException is used for unavailable seats, invalid ticket lifecycle, and duplicate catalog records
ShowSeat owns availability state checks
Ticket owns payable, confirm, and expire state checks
BookMyShowFacade does not add explicit lookup exceptions in this variant
```

Best for:

- Comparing a minimal built-in-exception approach against the richer E_ExceptionHandling version.
- Keeping exception discussion focused on invalid state.

Tradeoff:

- General input and lookup validation are intentionally limited in this variant.

## F_Concurrency: Per-Show Booking Lock

Adds one focused idea on top of E_ExceptionHandlingV2:

```text
All datastore maps use ConcurrentHashMap because this package now allows admin writes while reads may be happening
BookMyShowFacade locks on the Show object for getSeatsForShow, selectSeats, and pay
The show lock protects the check-and-update flow on ShowSeat status: AVAILABLE -> HELD -> BOOKED
The same show lock protects ticket expiry release: PENDING_PAYMENT -> EXPIRED and HELD -> AVAILABLE
selectSeats stores a ticket only after its seats are held, so a failed concurrent hold does not leave a pending ticket
Admin add methods synchronize on dataStore because they perform contains -> put -> parent list update
City, Theater, and Screen return snapshot id lists so user reads do not iterate over lists while admin methods append to them
addShow stores show seats and show before adding the show id to the screen list, so search cannot discover a half-created show
Main starts two threads selecting the same seats for the same show; only one selection can succeed
```

Best for:

- Preventing double booking of the same show seats under parallel user requests.
- Showing why concurrency is added only around real check-and-update flows.
- Handling concurrent admin creation without exposing partially updated catalog lists.

Tradeoff:

- Payment processing runs inside the show lock in this interview version because PaymentProcessor is an in-memory simulation.
- A production payment gateway flow would usually introduce an intermediate payment-processing state or idempotency key to avoid holding a show lock during external I/O.

## Planned Next Packages

```text
G_additionalFeatures: Add any optional extensions after the concurrency baseline is stable.
```

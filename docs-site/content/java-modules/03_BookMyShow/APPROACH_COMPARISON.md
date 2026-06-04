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

The progression keeps each package runnable on its own. Later packages should copy the previous package and introduce one focused idea.

## A_Basic: Catalog, Search, Holds, Expiry, And Pricing

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

## E_ExceptionHandling: Explicit Boundary Validation

Adds one focused idea on top of D:

```text
BookMyShowFacade validates method parameters with IllegalArgumentException
BookMyShowFacade translates missing datastore lookups into NoSuchElementException
Show-seat selections outside the requested show are treated as invalid method input
Admin duplicate creation checks throw RuntimeException
Remaining booking business validations use RuntimeException
Ticket owns invalid ticket lifecycle transitions with IllegalStateException
ShowSeat owns invalid seat state transitions with IllegalStateException
Payment type validation stays at the facade boundary before ticket lookup
PaymentStrategyFactory keeps the copied package fallback behavior for unsupported payment types
Main catches RuntimeException at the demo boundary only
No validation chain, state pattern, custom exception hierarchy, or model validation helpers are introduced
```

Best for:

- Showing where each runtime exception type belongs in the existing design.
- Keeping parameter and lookup validation in the facade instead of passive models or datastore classes.
- Keeping invalid state-transition checks inside Ticket and ShowSeat where that state is owned.

Tradeoff:

- The facade gains validation helpers, but the booking algorithm and package structure remain the same.

## E_ExceptionHandlingV2: Business And State Exceptions Only

Refines E with one focused change:

```text
Explicit IllegalArgumentException checks are removed from facade validation
Explicit NoSuchElementException lookup helpers are removed
Explicit show-seat ownership validation is removed instead of being replaced by RuntimeException
Duplicate creation RuntimeException checks remain
Booking business RuntimeException checks remain
Ticket and ShowSeat IllegalStateException checks remain
Unsupported payment fallback is not replaced with a new exception
Main continues to catch RuntimeException at the demo boundary only
```

Best for:

- Comparing explicit boundary validation against a leaner exception-handling version.
- Showing that state-transition exceptions can stay even when argument and lookup checks are removed.

Tradeoff:

- Invalid arguments and missing datastore elements fall through to the copied package behavior instead of being translated into explicit IllegalArgumentException or NoSuchElementException.

## F_OrchestrationValidation: Preflight Before Multi-Object Updates

Adds one focused idea on top of E:

```text
Orchestration validation is used only in the main booking flows with real partial-update risk
Ticket exposes read-only validateCanConfirm()
ShowSeat exposes read-only validateCanHold() and validateCanBook()
State-changing methods still call their own validation methods before mutating state
selectSeats validates every selected show seat can be held, then holds seats before storing the ticket
pay validates the ticket and all selected show seats before processing payment, booking seats, and confirming the ticket
No rollback abstraction, transaction manager, concurrency lock, state pattern, or validation chain is introduced
```

Orchestration analysis:

```text
selectSeats()
Updates:
1. dataStore.putTicket() updates ticketMap and does not throw in this implementation
2. holdSeats() updates ShowSeat status and can throw from ShowSeat.hold()
3. priceCalculator.calculateTicketPrice() updates Ticket price and does not throw in the normal validated flow
Risk:
If putTicket() happens before holdSeats() and holdSeats() fails, an invalid pending ticket remains in datastore
If one seat hold succeeds and a later seat hold fails, partial seat holds are possible inside the multi-seat operation
Solution:
Precheck all selected ShowSeat objects with validateCanHold()
Run holdSeats() before dataStore.putTicket()

pay()
Updates:
1. releaseExpiredHolds() updates expired tickets and held show seats
   - ticket.expire() can throw from Ticket
   - showSeat.releaseHold() can throw from ShowSeat
2. showSeat.book() updates ShowSeat status and can throw from ShowSeat
3. ticket.confirm() updates Ticket status and can throw from Ticket
Risk:
If showSeat.book() succeeds and ticket.confirm() fails, booked seats remain while the ticket is not confirmed
releaseExpiredHolds() does not need rollback because it is cleanup and does not create an inconsistent payment result if later booking fails
Solution:
Run releaseExpiredHolds()
Precheck ticket.validateCanConfirm()
Precheck all selected ShowSeat objects with validateCanBook()
Then process payment, book seats, and confirm ticket

Other facade methods:
No orchestration validation is added for searchShows(), getSeatsForShow(), getTicket(), or simple admin add methods
addShow is left unchanged because the current flow has no state-transition exception after partial mutation worth handling in this package
```

Best for:

- Showing how facade orchestration can avoid partial updates while keeping state ownership inside Ticket and ShowSeat.
- Preparing the exception-handling package for later merge without adding broad model validation.

Tradeoff:

- A few read-only validation methods are exposed on state-owning entities specifically for multi-update orchestration.

## G_Concurrency1: Same-Method Race Handling

Adds one focused idea on top of F:

```text
Builds on F_OrchestrationValidation
Case 1 asks only what happens when the same facade method runs concurrently
No coarse facade-wide booking lock is used
getSeatsForShow() is not locked because same-method calls do not create inconsistent state
selectSeats() synchronizes on the Show object to prevent overlapping selections from leaving orphan held seats
pay() synchronizes on the Ticket object to prevent duplicate payment processing for the same ticket
pay() runs expiry cleanup before the Ticket lock because G_Concurrency1 is not handling cross-method expiry-vs-payment yet
Admin add methods synchronize on a facade-owned catalogLock for contains-plus-put-plus-parent-list updates
Admin prerequisite lookups like getRequiredCity(), getRequiredTheater(), getRequiredScreen(), and getRequiredMovie() stay outside catalogLock; failing because the parent was not created yet is request ordering, not an inconsistent-state race
Only ticketMap uses ConcurrentHashMap because non-overlapping selectSeats() calls can write tickets concurrently for different shows
Other datastore maps remain HashMap because G_Concurrency1 does not handle user-read/admin-write cross-method catalog races
City, Theater, and Screen keep the F_OrchestrationValidation ArrayList-backed id lists
Main demonstrates two admins concurrently adding the same city and two users concurrently calling selectSeats() for the same show seat
```

Case-1 report:

```text
For each facade method:

searchShows(String movieTitle, String cityId)
entities getting updated: []

1. What if the same method is called with the same params simultaneously?
Nothing gets updated. No lock needed.
2. What if the same method is called with different params simultaneously?
Nothing gets updated. No lock needed.

getSeatsForShow(String showId)
entities getting updated: [Ticket.ticketStatus, ShowSeat.seatStatus, ShowSeat.price]

1. What if the same method is called with the same params simultaneously?
No inconsistent state. Expiry cleanup is idempotent in final state, and show-seat price recalculation is deterministic. A duplicate cleanup may throw, but throwing alone is not a concurrency bug worth locking for.
2. What if the same method is called with different params simultaneously?
No inconsistent state for booking. Different shows update different show seats and tickets. No lock needed for case 1.

selectSeats(String userId, String showId, List<String> showSeatList)
entities getting updated: [ShowSeat.seatStatus, ticketMap, ShowSeat.price, Ticket.price]

1. What if the same method is called with the same params simultaneously?
Exact same ordered seat list does not create two tickets because seats are held before the ticket is stored, and ShowSeat.hold() rechecks state. One call succeeds and the other fails.
2. What if the same method is called with different params simultaneously?
Real seat-state race if selections overlap. One call can hold part of its list, another call can hold an overlapping seat, and the first call can fail later, leaving an orphan held seat with no ticket. Lock selectSeats() on the Show object and run the seat-availability check plus hold update inside the lock.
If selections do not overlap, there is no seat-state race, but both calls still write ticketMap. Use ConcurrentHashMap for ticketMap structure safety.

pay(String ticketId, Payment payment)
entities getting updated: [Ticket.ticketStatus, ShowSeat.seatStatus, Payment.status]

1. What if the same method is called with the same params simultaneously?
Real race. Both calls can process payment before either confirms the ticket if ticket/seat/payment-amount checks run outside the ticket lock. Lock pay() per ticket and run those mutable state checks inside the lock.
2. What if the same method is called with different params simultaneously?
No booking inconsistency for different valid tickets. Different tickets own different selected seats in a valid datastore. No extra same-method lock needed beyond ticket-level locking.

getTicket(String ticketId)
entities getting updated: []

1. What if the same method is called with the same params simultaneously?
Nothing gets updated. No lock needed.
2. What if the same method is called with different params simultaneously?
Nothing gets updated. No lock needed.

addCity(String cityId, String name)
entities getting updated: [cityMap]

1. What if the same method is called with the same params simultaneously?
Real race. Both calls can pass containsCity(cityId) before either put happens, so duplicate create can be accepted. Use catalogLock around contains-plus-put.
2. What if the same method is called with different params simultaneously?
No semantic conflict. catalogLock serializes cityMap writes between admins. No ConcurrentHashMap needed for case 1.

addMovie(String movieId, String title)
entities getting updated: [movieMap]

1. What if the same method is called with the same params simultaneously?
Real race. Both calls can pass containsMovie(movieId) before either put happens, so duplicate create can be accepted. Use catalogLock around contains-plus-put.
2. What if the same method is called with different params simultaneously?
No semantic conflict. catalogLock serializes movieMap writes between admins. No ConcurrentHashMap needed for case 1.

addTheater(String cityId, String theaterId, String name)
entities getting updated: [theaterMap, City.theaterList]

1. What if the same method is called with the same params simultaneously?
Real race. Both calls can pass containsTheater(theaterId), one map value can overwrite the other, and City.theaterList can get duplicate theater ids. Look up the City before locking, then use catalogLock only around contains-plus-put-plus-City.theaterList update.
2. What if the same method is called with different params simultaneously?
If the city is the same, both calls append to City.theaterList. Use catalogLock around the admin update. If cities differ, catalogLock still serializes theaterMap writes, so no ConcurrentHashMap needed for case 1.

addScreen(String theaterId, String screenId, String name)
entities getting updated: [screenMap, Theater.screenList]

1. What if the same method is called with the same params simultaneously?
Real race. Both calls can pass containsScreen(screenId), one map value can overwrite the other, and Theater.screenList can get duplicate screen ids. Look up the Theater before locking, then use catalogLock only around contains-plus-put-plus-Theater.screenList update.
2. What if the same method is called with different params simultaneously?
If the theater is the same, both calls append to Theater.screenList. Use catalogLock around the admin update. If theaters differ, catalogLock still serializes screenMap writes, so no ConcurrentHashMap needed for case 1.

addSeat(String screenId, String seatId, SeatType seatType)
entities getting updated: [seatMap, Screen.seatList]

1. What if the same method is called with the same params simultaneously?
Real race. Both calls can pass containsSeat(seatId), one map value can overwrite the other, and Screen.seatList can get duplicate seat ids. Look up the Screen before locking, then use catalogLock only around contains-plus-put-plus-Screen.seatList update.
2. What if the same method is called with different params simultaneously?
If the screen is the same, both calls append to Screen.seatList. Use catalogLock around the admin update. If screens differ, catalogLock still serializes seatMap writes, so no ConcurrentHashMap needed for case 1.

addShow(String showId, String movieId, String screenId, LocalDateTime startTime, int basePrice)
entities getting updated: [showSeatMap, Screen.showList, showMap]

1. What if the same method is called with the same params simultaneously?
Real race. Both calls can pass containsShow(showId), show seats can overwrite each other, and Screen.showList can get duplicate show ids. Look up the Movie and Screen before locking, then use catalogLock only around contains-plus-show-seat creation-plus-put-plus-Screen.showList update.
2. What if the same method is called with different params simultaneously?
If the screen is the same, both calls append to Screen.showList. Use catalogLock around the admin update. If screens differ, catalogLock still serializes showMap/showSeatMap writes, so no ConcurrentHashMap needed for case 1.
```

Same-method concurrency decisions:

```text
1. Which methods actually need concurrency handling?
selectSeats() and pay().
Admin add methods also need concurrency handling because they are check-plus-update catalog workflows.
getSeatsForShow() is not locked in case 1 because same-method calls do not create inconsistent final state.

2. Which shared objects can race?
For same-method calls, overlapping selectSeats() calls can race on ShowSeat.seatStatus, and duplicate pay() calls can race on Ticket.ticketStatus, ShowSeat.seatStatus, and Payment.status.
Admin check-plus-update workflows can race on datastore maps and City/Theater/Screen id lists without catalogLock.
ticketMap has concurrent writes from selectSeats().

3. Whether concurrent collections are really needed, and for which maps only?
Only ticketMap uses ConcurrentHashMap in this package because selectSeats() calls for different shows can write tickets concurrently.
Admin maps remain HashMap because catalogLock serializes admin write workflows in case 1.
User-read/admin-write catalog overlap is a cross-method concern left for H_Concurrency2.
The entity id lists stay as the baseline ArrayList-backed lists; catalogLock protects admin writes to those lists in case 1.

4. Whether locking should be method-level, object-level, aggregate-level, or datastore-level?
For case 1, selectSeats() locks on the Show object for the selection workflow, and pay() locks on the Ticket object.
Admin add methods use a facade-owned catalogLock because each method coordinates map uniqueness checks with parent list updates.
Prerequisite parent lookups that are not part of an update invariant stay outside the lock.
getSeatsForShow(), searchShows(), and getTicket() do not get G_Concurrency1 locks.

5. Which things do not need concurrency handling and why?
Movie, Seat, Show, and User are immutable/read-only after construction.
Payment strategies and pricing handlers are stateless after construction.
searchShows() and getTicket() do not mutate state.
getSeatsForShow() same-method calls do not create inconsistent state.
Admin methods need catalog workflow locking; read-only catalog views are not locked in this package.
```

Race condition solved in G_Concurrency1:

```text
selectSeats() different params:
Overlapping selections can leave an orphan held seat if one request partially holds seats and then fails on an overlap.
The Show lock makes validation and holding one atomic workflow for that show.

pay() same params:
Duplicate pay calls can process payment twice before the ticket is confirmed.
The Ticket lock makes validation, payment processing, booking, and confirmation one atomic workflow for that ticket.
Expiry cleanup is not part of the Ticket lock in this package because cross-method expiry cleanup is handled in H_Concurrency2.
```

Best for:

- Showing same-method race analysis without inventing locks for harmless cases.
- Preventing orphan holds from overlapping selectSeats() calls.
- Preventing duplicate payment processing for the same ticket.
- Preventing duplicate admin creates and parent-list corruption from double-click or multi-admin requests.
- Showing that ConcurrentHashMap protects map structure, not mutable domain objects stored in the maps.

Tradeoff:

- It is intentionally not the final booking lock design because cross-method booking races are not addressed yet.

## H_Concurrency2: Shared-Entity Race Handling

Adds one focused idea on top of G_Concurrency1:

```text
Case 2 checks which entities are updated by multiple facade methods
H_Concurrency2 starts from G_Concurrency1 and keeps its case-1 guarantees
Not every shared entity update needs a lock
selectSeats() locks selected ShowSeat objects instead of locking the whole Show
getSeatsForShow() expiry cleanup locks the ticket's selected ShowSeat objects before expiring/releasing
getSeatsForShow() keeps the original collect-then-calculate flow; locking is inside calculatePricesForAvailableShowSeats()
pay() keeps the existing releaseExpiredHolds(ticket.getShowId()) call before acquiring selected ShowSeat locks
pay() locks the ticket's selected ShowSeat objects while calling the payment gateway and confirming
The Show object is used only as a short acquisition gate while taking the selected ShowSeat locks
After selected ShowSeat locks are acquired, the Show lock is released before the workflow runs
The implementation uses explicit acquire/release with try/finally, not a callback-style lock wrapper
ShowSeatLockManager owns the explicit lock objects so the facade does not manage lock-map details
All datastore maps become ConcurrentHashMap because user reads can overlap with admin writes without taking catalogLock
City.theaterList, Theater.screenList, and Screen.showList become CopyOnWriteArrayList because searchShows() reads them while admin methods append
Screen.seatList stays ArrayList because only admin methods read/write it under catalogLock
ConcurrentHashMap protects map structure only, not Ticket or ShowSeat mutable state
Main demonstrates two admins concurrently adding the same city and two users concurrently trying to hold the same show seat
```

Case-2 report:

```text
For each entity from the updated list above:

cityMap: [addCity]
movieMap: [addMovie]
theaterMap: [addTheater]
screenMap: [addScreen]
seatMap: [addSeat]
showMap: [addShow]
showSeatMap: [addShow]
ticketMap: [selectSeats]
City: [addTheater] fields updated: [theaterList]
Theater: [addScreen] fields updated: [screenList]
Screen: [addSeat, addShow] fields updated: [seatList, showList]
ShowSeat: [getSeatsForShow, selectSeats, pay] fields updated: [seatStatus, price]
Ticket: [getSeatsForShow, selectSeats, pay] fields updated: [ticketStatus, price]
Payment: [pay] fields updated: [status]

For each shared entity, what coordination is required, and where is that coordination applied?

City: [addTheater] fields updated: [theaterList]
Problem:
addTheater() appends to City.theaterList under catalogLock, but searchShows() reads City.theaterList without catalogLock.
Solution:
Use CopyOnWriteArrayList for City.theaterList.
Keep addTheater() under catalogLock for admin duplicate-check-plus-update.
Do not lock searchShows(); it only needs safe iteration, not a globally consistent catalog snapshot.

Theater: [addScreen] fields updated: [screenList]
Problem:
addScreen() appends to Theater.screenList under catalogLock, but searchShows() reads Theater.screenList without catalogLock.
Solution:
Use CopyOnWriteArrayList for Theater.screenList.
Keep addScreen() under catalogLock for containsScreen() plus screenMap put plus Theater.screenList append.

Screen: [addSeat, addShow] fields updated: [seatList, showList]
Problem:
addShow() appends to Screen.showList while searchShows() can read Screen.showList.
addSeat() mutates Screen.seatList and addShow() reads Screen.seatList, but both are admin workflows already serialized by catalogLock.
Solution:
Use CopyOnWriteArrayList for Screen.showList only.
Keep Screen.seatList as ArrayList.
No Screen object lock is needed.

ShowSeat: [getSeatsForShow, selectSeats, pay] fields updated: [seatStatus, price]
Problem:
selectSeats() vs selectSeats() is already handled in G_Concurrency1 with the Show lock, but that lock is broader than needed.
The missed cross-method race is getSeatsForShow() expiry cleanup vs pay() booking for the same show.
pay() can send a payment request while getSeatsForShow() expires the ticket and releases its held seats.
Solution:
Use ShowSeat locks as the booking lock.
selectSeats(), pay(), and expiry cleanup lock all selected ShowSeat objects for that workflow.
The facade first synchronizes on Show only while acquiring explicit ShowSeat ReentrantLocks.
After the ShowSeat locks are acquired, the Show lock is released and the workflow continues under the ShowSeat locks.
This avoids deadlock without requiring sorted recursive locking.
This keeps multi-seat validation plus update atomic without locking the whole Show.
pay() can hold those ShowSeat locks while waiting for the payment gateway because those seats are already HELD for that ticket.
Other seats in the same show can still proceed independently.
getSeatsForShow() recalculates price under the individual ShowSeat lock when the seat is still AVAILABLE.
The facade keeps the original getSeatsForShow() shape: collect result, then calculate prices.

Ticket: [getSeatsForShow, selectSeats, pay] fields updated: [ticketStatus, price]
Problem:
getSeatsForShow() can move a pending ticket to EXPIRED.
pay() can move a pending ticket to CONFIRMED.
Duplicate pay() calls can also race on the same ticket.
Solution:
Do not add a separate Ticket lock in H_Concurrency2.
Every valid ticket has a non-empty showSeatList, and all workflows that mutate that ticket also lock that ticket's ShowSeat objects first.
So duplicate pay() and expiry cleanup for the same ticket serialize on the same ShowSeat locks.
Ticket.ticketStatus is updated only while those ShowSeat locks are held.
Ticket.price is only updated by selectSeats(), so it does not add a separate cross-method race.

Payment: [pay] fields updated: [status]
Only pay() mutates Payment.status.
No separate Payment lock is needed.
The gateway call runs while the selected ShowSeat locks are held.
No Show, Ticket, or datastore lock is held during the gateway call.

Datastore maps:
Problem:
G_Concurrency1 intentionally did not handle user-read/admin-write catalog races.
In H_Concurrency2, user methods can read maps while admin methods write maps, and user reads do not take catalogLock.
Solution:
Use ConcurrentHashMap for all datastore maps in H_Concurrency2.
This is needed for map structure safety because search/get flows can read while admin flows put new entries.
catalogLock still handles admin check-plus-update invariants such as containsCity() then putCity().
ConcurrentHashMap is not a replacement for those workflow locks because it does not make contains-plus-put atomic at the facade level.
ConcurrentHashMap also does not protect mutable objects stored in the map; Ticket and ShowSeat state still need facade locking.
```

Cross-method race condition solved:

```text
Before H_Concurrency2:
G_Concurrency1 handled selectSeats() vs selectSeats() and pay() vs pay().
It did not coordinate expiry cleanup in getSeatsForShow() with pay().

Race:
pay() can validate a pending, held ticket and send the payment request.
At the same time, getSeatsForShow() can expire that ticket and release its seats.
pay() may then fail to book after payment has already completed.

After H_Concurrency2:
getSeatsForShow() expiry cleanup and pay() use the same selected ShowSeat locks.
If the ticket is expired, pay() observes that before processing payment.
If pay() starts first, expiry cleanup waits for the ShowSeat locks and cannot release the seats mid-payment.
Different shows still proceed independently.
Different seats in the same show also proceed independently.
```

Concurrency decisions:

```text
1. Which methods actually need concurrency handling?
From G_Concurrency1: selectSeats(), pay(), and admin add methods.
Added in H_Concurrency2: getSeatsForShow() expiry cleanup must share ShowSeat locking with pay() because of expiry-vs-payment.
H_Concurrency2 also keeps searchShows() lock-free but makes the catalog maps/lists safe for user-read/admin-write overlap.

2. Which shared objects can race?
The real cross-method race is on Ticket and ShowSeat between getSeatsForShow() expiry cleanup and pay() booking.

3. Whether concurrent collections are really needed, and for which maps only?
All datastore maps remain ConcurrentHashMap because user reads can overlap with admin writes without taking catalogLock.
ticketMap additionally handles concurrent selectSeats() ticket creation for different shows.
ConcurrentHashMap does not protect Ticket or ShowSeat internals.
ShowSeatLockManager uses a plain HashMap internally; its getLock() method is synchronized, so a concurrent collection is not needed for the lock map.
City.theaterList, Theater.screenList, and Screen.showList use CopyOnWriteArrayList for searchShows() read overlap with admin appends.
Screen.seatList stays ArrayList because only admin methods read/write it under catalogLock.

4. Whether locking should be method-level, object-level, aggregate-level, or datastore-level?
selectSeats(), pay(), and getSeatsForShow() expiry cleanup use object-level locking on ShowSeat.
Show is used only as a short acquisition gate while taking ShowSeat locks.
The actual workflow does not run under the Show lock.
Locking the whole Show for the workflow would block unrelated seats in the same show.
Adding a separate Ticket lock is unnecessary because ticket workflows already serialize on that ticket's selected ShowSeats.
Datastore-level locking would block independent shows unnecessarily.

5. Which things do not need concurrency handling and why?
searchShows() and getTicket() do not mutate booking state.
getSeatsForShow() same-method duplicate cleanup is not locked for its own sake.
ShowSeat.price recalculation is deterministic and is not a separate lock reason.
When getSeatsForShow() does recalculate a price, calculatePricesForAvailableShowSeats() locks that single ShowSeat.
Admin methods keep the G_Concurrency1 catalogLock; H_Concurrency2 adds targeted concurrent-list handling for user-read/admin-append overlap.
```

Best for:

- Explaining that an entity matrix is a filter, not a reason to lock everything.
- Preventing payment-after-expiry cleanup races.
- Keeping locks tied to the actual inconsistent state being prevented.

Tradeoff:

- Payment processing runs inside selected ShowSeat locks. The Show lock is not held during payment; it is used only to serialize acquisition of ShowSeat locks.
- Admin catalog writes use the same catalogLock design from G_Concurrency1. A production system may replace this with database uniqueness constraints and transactions.

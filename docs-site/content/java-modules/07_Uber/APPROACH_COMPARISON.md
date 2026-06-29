# Approach Comparison

## Existing Packages

`A_basic` demonstrates the first runnable Uber-like cab booking design with riders, drivers, cabs, locations, fare estimates, bookings, OTP-based ride start, and ride completion.

`B_Strategy` adds fare and driver-matching strategies so pricing and nearby-driver selection are no longer hardcoded in the facade.

`C_Observer` adds driver notification observers. The facade notifies registered observers when a booking is created.

`D_ExceptionHandling` adds explicit facade parameter validation, required datastore lookup checks, duplicate admin checks, business validation failures, and model-owned state transition exceptions.

`D_ExceptionHandlingV2` removes explicit argument and lookup validation, while keeping duplicate creation checks, business RuntimeException checks, and model-owned IllegalStateException checks.

`E_OrchestrationValidations` adds targeted precheck-and-update orchestration validation for facade methods with concrete partial-update risk.

`F_Concurrency1` handles same-method concurrent booking acceptance with a Booking lock and concurrent datastore map access.

`G_Concurrency2` builds on `F_Concurrency1` and coordinates cross-method booking lifecycle races on the same Booking aggregate.

Later packages can add payment handling and persistence.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- The system supports riders & drivers.
- Each driver is linked to one cab.
- Each cab has a vehicle type and current location.

Action based points:
- Admin Actions:
  - Admin adds riders.
  - Admin adds cabs.
  - Admin adds drivers and links each driver to a cab.
- User Actions:
  - Rider updates current location.
  - Rider views fare estimates for available vehicle types.
  - Rider books a ride by choosing a vehicle type.
  - Rider can cancel the ride anytime before ride starts.
  - Driver accepts a ride.
  - Driver starts the ride using the rider OTP.
  - Driver ends the ride.
- System Actions:
  - Calculates fare.
  - Send notifications to nearby available drivers regarding ride requests
  - Generate OTPs for system-created bookings.

  
#### Common Misc

Offline or online:
- Online

Extensibility:
- Core entities:
  - `VehicleType` can grow with more cab categories.

- Behaviour:
  - Cab assignment
  - Fare calculation and surge pricing

History and undo:
- NA

Notifications:
- Nearby driver lookup is enough for A_basic.
- Real-time driver notification can be added later with Observer or an event model.

Exception handling:
- Missing rider, missing driver, missing cab, invalid OTP, unavailable cab, duplicate IDs, and wrong booking status are later-package validations.

Edge cases:
- No nearby cab, multiple drivers accepting the same booking, expired OTP, rider cancellation, driver cancellation, and invalid location inputs are deferred.

Concurrency:
- Real Uber-like booking has concurrent driver acceptance and cab availability races.
- A_basic intentionally uses `HashMap` and no locks.

### UseCase Diagram

Actors:
- Rider
- Driver
- Admin
- System

UseCases:
- addRider(Admin) 
- addCab(Admin) 
- addDriver(Admin) 
- updateRiderLocation(Rider) 
- showFareEstimates(Rider) → findNearbyCabs(System) → calculateFare(System)
- bookRide(Rider) -> notifyDrivers(System)
- acceptRide(Driver) 
- startRide(Driver) -> matchOTP(System) 
- endRide(Driver)

### Class Diagram

Layers:
- `Main` creates direct user/admin IDs and calls facade methods only.
- `UberFacade` owns rider, driver, admin, and system workflows.
- `DataStore` and `InMemoryDataStore` store maps only.
- Models own simple state changes such as updating location, assigning driver, starting ride, and completing ride.

Identify Core Entities and Cardinality:
- Rider 
- Driver -> Cab 
- Booking -> Rider, Driver, Cab


Core entities:
- `Rider(riderId, name, currentLocation)` represents a rider and current pickup position.
- `Driver(driverId, name, cabId)` represents a driver linked to one cab by ID.
- `Cab(cabId, vehicleType, registrationNumber, currentLocation, available)` represents a bookable vehicle.
- `Location(latitude, longitude)` is a small value object with distance calculation.
- `FareEstimate(vehicleType, fare)` represents a rider-facing fare option.
- `Booking(bookingId, riderId, pickupLocation, destinationLocation, vehicleType, bookingTime, fare, otp, driverId, bookingStatus)` represents one ride lifecycle.

Enums:
- `VehicleType`: `SEDAN`, `GO`, `AUTO`, `BIKE`.
- `BookingStatus`: `RIDE_REQUESTED`, `DRIVER_ASSIGNED`, `RIDE_STARTED`, `RIDE_COMPLETED`, `RIDE_CANCELLED`.

Method placement:
- `UberFacade.showFareEstimates` belongs in the facade because it coordinates cab lookup and fare calculation.
- `UberFacade.bookRide` belongs in the facade because it creates the system booking and stores it.
- `UberFacade.getNearbyDrivers` belongs in the facade because it maps available cabs to drivers.
- `UberFacade.acceptRide`, `startRide`, and `endRide` belong in the facade because they coordinate booking, driver, cab, and rider state.
- `Booking.assignDriver`, `startRide`, `completeRide`, and `cancel` belong in `Booking` because they mutate booking-owned state.
- `Cab.markUnavailable`, `markAvailable`, and `updateLocation` belong in `Cab` because they mutate cab-owned state.
- `DataStore` methods only get, put, contains, remove, and list entities; no business logic belongs in datastore.

## B_Strategy: Fare And Driver Matching Strategies

Adds two focused strategy seams on top of `A_basic`:

```text
FareStrategy defines calculateFare(...)
BaseFareStrategy owns base per-distance rates by vehicle type
SurgeFareStrategy wraps a base fare strategy and applies demand/supply surge
DriverMatchingStrategy defines findDrivers(...)
NearestDriverMatchingStrategy filters available nearby cabs and maps them to drivers
UberFacade delegates fare calculation to FareStrategy
UberFacade delegates nearby driver lookup to DriverMatchingStrategy
Main wires explicit strategies for the demo
```

Best for:

- Separating pricing behavior from facade orchestration.
- Separating driver matching from booking flow.
- Preparing for alternate matching strategies such as rating-based, zone-based, or load-aware matching.

Tradeoff:

- Strategy selection is still manually wired in `Main`; no factory is introduced yet.

## C_Observer: Driver Notification Observers

Adds one focused idea on top of `B_Strategy`:

```text
DriverNotificationObserver defines onRideRequested(...)
ConsoleDriverNotificationObserver prints driver notifications
WebSocketDriverNotificationObserver simulates publishing to a driver channel
UberFacade owns observer registration and removal
UberFacade stores observers in a CopyOnWriteArraySet to avoid duplicate registrations
Concrete observers implement equals(...) and hashCode(...)
notifyDrivers(bookingId) gets nearby drivers and notifies every registered observer
bookRide(...) still creates the booking with requested vehicle type, stores it, and then calls notifyDrivers(...)
```

Best for:

- Keeping notification side effects out of booking creation logic.
- Supporting multiple notification channels without changing booking flow.
- Showing why `notifyDrivers` is a system hook rather than a rider-facing workflow step.

Tradeoff:

- Observer callbacks receive live domain objects. A production system may prefer immutable notification event DTOs.

## D_ExceptionHandling: Explicit Boundary Validation

Adds one focused idea on top of `C_Observer`:

```text
UberFacade validates method parameters with IllegalArgumentException
UberFacade translates missing datastore lookups into NoSuchElementException
Admin duplicate creation checks throw RuntimeException
Business validation failures use RuntimeException
Booking owns invalid booking-status transitions with IllegalStateException
Cab owns invalid availability transitions with IllegalStateException
Main catches RuntimeException at the demo boundary only
No validation chain, state pattern, custom exception hierarchy, or orchestration rollback is introduced
```

Best for:

- Making invalid facade calls fail with clear exception ownership.
- Keeping datastore classes passive.
- Keeping state-transition checks inside the model that owns the state.

Tradeoff:

- Multi-object workflows can still have partial-update risk. A later orchestration-validation package can add preflight checks without mixing that concern into this exception package.

## D_ExceptionHandlingV2: Business And State Exceptions Only

Refines `D_ExceptionHandling` with one focused change:

```text
Explicit IllegalArgumentException checks are removed from facade validation
Explicit NoSuchElementException lookup helpers are removed
Duplicate creation RuntimeException checks remain
Business RuntimeException checks remain
Booking and Cab IllegalStateException checks remain
Main continues to catch RuntimeException at the demo boundary only
```

Best for:

- Comparing explicit boundary validation against a leaner exception-handling version.
- Keeping state-transition exceptions even when argument and lookup checks are removed.

Tradeoff:

- Invalid arguments and missing datastore elements fall through to direct access behavior instead of descriptive IllegalArgumentException or NoSuchElementException.

## E_OrchestrationValidations: Precheck Multi-Update Flows

Adds one focused idea on top of `D_ExceptionHandlingV2`:

```text
Booking exposes validateCanAssignDriver() and validateCanCompleteRide()
Cab exposes validateCanMarkUnavailable() and validateCanMarkAvailable()
Mutating methods still call their validateCanX() methods internally
UberFacade.acceptRide(...) prechecks booking assignment and cab reservation before mutating either object
UberFacade.endRide(...) prechecks booking completion and cab availability before mutating booking, cab, or rider state
No rollback, transaction abstraction, locks, State pattern, or validation chain is introduced
```

Best for:

- Preventing invalid partial domain state in multi-object facade operations.
- Keeping state validation inside the entity that owns the state.
- Showing orchestration validation separately from normal argument or lookup exception handling.

Tradeoff:

- It prevents known sequential partial-update failures, but it is not concurrency-safe. A later package can add locking or atomic acceptance.

Orchestration validation analysis:

```text
acceptRide(bookingId, driverId)
Updates:
1. booking.assignDriver(...) mutates Booking.driverId and Booking.bookingStatus.
2. cab.markUnavailable() mutates Cab.available.
Throwing updates:
- booking.assignDriver(...) can throw IllegalStateException.
- cab.markUnavailable() can throw IllegalStateException.
Partial-update risk:
- If booking assignment succeeds and cab reservation fails, the booking points to a driver whose cab was not reserved by this flow.
Selected solution:
- Precheck booking.validateCanAssignDriver() and cab.validateCanMarkUnavailable() before either mutation.

endRide(bookingId, driverId)
Updates:
1. booking.completeRide() mutates Booking.bookingStatus.
2. cab.updateLocation(...) mutates Cab.currentLocation.
3. cab.markAvailable() mutates Cab.available.
4. rider.updateLocation(...) mutates Rider.currentLocation.
Throwing updates:
- booking.completeRide() can throw IllegalStateException.
- cab.markAvailable() can throw IllegalStateException.
Partial-update risk:
- If booking completion and cab movement happen before cab availability fails, booking and cab state can be left inconsistent.
Selected solution:
- Precheck booking.validateCanCompleteRide() and cab.validateCanMarkAvailable() before any mutation.

cancel(bookingId)
Updates:
1. booking.cancel() mutates Booking.bookingStatus.
2. cab.markAvailable() mutates Cab.available when a driver is assigned.
Throwing updates:
- booking.cancel() can throw IllegalStateException.
- cab.markAvailable() can throw IllegalStateException.
Partial-update risk:
- If cab is already available, the booking being cancelled while the cab remains available is not an invalid domain partial state.
Selected solution:
- Intentionally skipped.

startRide(bookingId, driverId, otp)
Updates:
1. booking.startRide() mutates Booking.bookingStatus.
Throwing updates:
- booking.startRide() can throw IllegalStateException.
Partial-update risk:
- Single domain update only; no later update can leave an earlier update partially applied.
Selected solution:
- Intentionally skipped.

bookRide(riderId, destinationLocation, vehicleType)
Updates:
1. dataStore.putBooking(...) stores the new Booking.
2. notifyDrivers(...) sends observer notifications.
Throwing updates:
- Observer callbacks may throw if an implementation fails.
Partial-update risk:
- A stored booking with partial notification delivery is a side-effect delivery issue, not invalid domain state in the current in-memory model.
Selected solution:
- Intentionally skipped.

updateRiderLocation(riderId, currentLocation)
Updates:
1. rider.updateLocation(...) mutates Rider.currentLocation.
Throwing updates:
- None from the Rider method itself.
Partial-update risk:
- Single update only.
Selected solution:
- Intentionally skipped.

addRider(...), addCab(...), addDriver(...)
Updates:
1. Each method performs one datastore put after its duplicate check.
Throwing updates:
- Duplicate checks can throw before the put.
Partial-update risk:
- No multi-update sequence.
Selected solution:
- Intentionally skipped.

showFareEstimates(...), getNearbyDrivers(...), calculateFare(...), findNearbyDrivers(...), notifyDrivers(...), addDriverNotificationObserver(...), removeDriverNotificationObserver(...)
Updates:
1. These methods either read data, calculate values, send observer side effects, or mutate only the observer set.
Throwing updates:
- Observer callbacks can throw from notifyDrivers(...).
Partial-update risk:
- No invalid domain partial state is created by these methods in the current model.
Selected solution:
- Intentionally skipped.
```

## F_Concurrency1: Same-Method Race Handling

Adds one focused idea on top of `E_OrchestrationValidations`:

```text
Builds on E_OrchestrationValidations
Case 1 asks only what happens when the same facade method runs concurrently
No coarse facade-wide lock is used
InMemoryDataStore uses ConcurrentHashMap for riderMap, driverMap, cabMap, and bookingMap
acceptRide(...) synchronizes on Booking only while checking and accepting the ride
Cab is not used as a lock target
cancel(...), startRide(...), and endRide(...) are not cross-method coordinated yet
Main keeps the normal ride demo and adds a concurrent acceptRide demo
```

### Case-1 Report

For each facade method:

#### `updateRiderLocation(String riderId, Location currentLocation)`

**Entities getting updated:** `[Rider.currentLocation]`

1. **What if the same method is called with the same params simultaneously?**
   Both calls write the same rider location. No invalid final state is created, so no lock is needed.

2. **What if the same method is called with different params simultaneously?**
   Calls for different riders do not overlap. Calls for the same rider are last-writer-wins GPS updates; this package has no timestamp/order invariant, so no lock is added.

#### `showFareEstimates(Location pickupLocation, Location destinationLocation)`

**Entities getting updated:** `[]`

1. **What if the same method is called with the same params simultaneously?**
   Read-only. No lock needed.

2. **What if the same method is called with different params simultaneously?**
   Read-only. It reads datastore snapshots while bookings/admin writes may happen, so map structure safety comes from ConcurrentHashMap.

#### `bookRide(String riderId, Location destinationLocation, VehicleType vehicleType)`

**Entities getting updated:** `[bookingMap]`

1. **What if the same method is called with the same params simultaneously?**
   Each call creates a separate UUID booking. This does not violate a duplicate booking invariant.

2. **What if the same method is called with different params simultaneously?**
   Concurrent writes to bookingMap and snapshot reads from fare/surge calculation can corrupt a HashMap structure. F_Concurrency1 changes bookingMap to ConcurrentHashMap.

#### `getNearbyDrivers(String bookingId)`

**Entities getting updated:** `[]`

1. **What if the same method is called with the same params simultaneously?**
   Read-only. No lock needed.

2. **What if the same method is called with different params simultaneously?**
   Read-only. It uses bookingMap, cabMap, and driverMap, whose structures are protected by ConcurrentHashMap.

#### `cancel(String bookingId)`

**Entities getting updated:** `[Booking.bookingStatus, Cab.available]`

1. **What if the same method is called with the same params simultaneously?**
   Duplicate cancel may make one call throw after the other cancels, but final booking/cab state remains valid. No case-1 lock is added.

2. **What if the same method is called with different params simultaneously?**
   Different bookings do not overlap unless invalid data already points multiple bookings to the same cab. Cross-method booking/cab coordination is left for G_Concurrency2.

#### `acceptRide(String bookingId, String driverId)`

**Entities getting updated:** `[Booking.driverId, Booking.bookingStatus, Cab.available]`

1. **What if the same method is called with the same params simultaneously?**
   Same booking and same driver/cab do not create an invalid final state by themselves, but the same Booking validate-then-assign window is shared with the different-driver case. F_Concurrency1 uses the Booking lock only, so duplicate same-driver accepts serialize without adding a Cab lock.

2. **What if the same method is called with different params simultaneously?**
   Same booking with different drivers/cabs has a real race. Without a Booking lock, two threads can both pass `booking.validateCanAssignDriver()`, then each can reserve its own cab and assign the booking. The last booking write wins, but the losing driver's cab may remain unavailable. F_Concurrency1 synchronizes on Booking only. Different bookings targeting the same cab are intentionally not solved here because that would require Cab locking and is outside the same-ride invariant.

#### `startRide(String bookingId, String driverId, String otp)`

**Entities getting updated:** `[Booking.bookingStatus]`

1. **What if the same method is called with the same params simultaneously?**
   Duplicate starts may cause one call to throw after another starts the ride, but the final booking state is valid. No case-1 lock is added.

2. **What if the same method is called with different params simultaneously?**
   Different bookings do not overlap. Same booking with wrong driver/OTP fails validation. Cross-method lifecycle races are left for G_Concurrency2.

#### `endRide(String bookingId, String driverId)`

**Entities getting updated:** `[Booking.bookingStatus, Cab.currentLocation, Cab.available, Rider.currentLocation]`

1. **What if the same method is called with the same params simultaneously?**
   Duplicate end may cause one call to throw after another completes the ride, but final booking/cab/rider state remains valid. No case-1 lock is added.

2. **What if the same method is called with different params simultaneously?**
   Different bookings do not overlap in valid data. Cross-method booking/cab coordination is left for G_Concurrency2.

#### `addDriverNotificationObserver(DriverNotificationObserver observer)`

**Entities getting updated:** `[driverNotificationObserverSet]`

1. **What if the same method is called with the same params simultaneously?**
   CopyOnWriteArraySet plus concrete observer equality prevents duplicate observer registration and protects collection structure.

2. **What if the same method is called with different params simultaneously?**
   CopyOnWriteArraySet protects concurrent additions. No extra lock is needed.

#### `removeDriverNotificationObserver(DriverNotificationObserver observer)`

**Entities getting updated:** `[driverNotificationObserverSet]`

1. **What if the same method is called with the same params simultaneously?**
   Duplicate remove is harmless. CopyOnWriteArraySet protects structure.

2. **What if the same method is called with different params simultaneously?**
   CopyOnWriteArraySet protects concurrent removals. No extra lock is needed.

#### `calculateFare(Location pickupLocation, Location destinationLocation, VehicleType vehicleType)`

**Entities getting updated:** `[]`

1. **What if the same method is called with the same params simultaneously?**
   Read-only calculation. No lock needed.

2. **What if the same method is called with different params simultaneously?**
   Read-only calculation over datastore snapshots. ConcurrentHashMap protects map structure.

#### `findNearbyDrivers(Location pickupLocation, VehicleType vehicleType)`

**Entities getting updated:** `[]`

1. **What if the same method is called with the same params simultaneously?**
   Read-only lookup. No lock needed.

2. **What if the same method is called with different params simultaneously?**
   Read-only lookup. Freshness can change while cabs are accepted, but acceptRide validates cab availability before assignment.

#### `notifyDrivers(String bookingId)`

**Entities getting updated:** `[]`

1. **What if the same method is called with the same params simultaneously?**
   Duplicate notifications can happen if the caller invokes notify twice, sequentially or concurrently. That is not a domain-state race.

2. **What if the same method is called with different params simultaneously?**
   No domain mutation. CopyOnWriteArraySet protects observer iteration while observers are added/removed.

#### `addRider(String riderId, String name, Location currentLocation)`

**Entities getting updated:** `[riderMap]`

1. **What if the same method is called with the same params simultaneously?**
   Same-key overwrite/exception timing is intentionally skipped because the final map cannot contain duplicate rider IDs.

2. **What if the same method is called with different params simultaneously?**
   Concurrent HashMap writes can corrupt map structure. F_Concurrency1 changes riderMap to ConcurrentHashMap.

#### `addCab(String cabId, VehicleType vehicleType, String registrationNumber, Location currentLocation)`

**Entities getting updated:** `[cabMap]`

1. **What if the same method is called with the same params simultaneously?**
   Same-key overwrite/exception timing is intentionally skipped because the final map cannot contain duplicate cab IDs.

2. **What if the same method is called with different params simultaneously?**
   Concurrent HashMap writes can corrupt map structure. F_Concurrency1 changes cabMap to ConcurrentHashMap.

#### `addDriver(String driverId, String name, String cabId)`

**Entities getting updated:** `[driverMap]`

1. **What if the same method is called with the same params simultaneously?**
   Same-key overwrite/exception timing is intentionally skipped because the final map cannot contain duplicate driver IDs.

2. **What if the same method is called with different params simultaneously?**
   Concurrent HashMap writes can corrupt map structure. F_Concurrency1 changes driverMap to ConcurrentHashMap.

Same-method concurrency decisions:

```text
1. Which methods actually need concurrency handling?
acceptRide(...) needs a Booking-level critical section.
bookRide(...), addRider(...), addCab(...), and addDriver(...) need concurrent datastore map structures.

2. Which shared objects can race?
Booking.driverId and Booking.bookingStatus during concurrent accepts for the same booking.
Datastore maps during concurrent writes and snapshot reads.

3. Whether concurrent collections are really needed, and for which maps/lists only?
riderMap, driverMap, cabMap, and bookingMap use ConcurrentHashMap.
driverNotificationObserverSet already uses CopyOnWriteArraySet.
No other lists or entities are changed.

4. Whether locking should be method-level, object-level, aggregate-level, lock-manager-level, or datastore-level?
Object/aggregate-level locking is used for acceptRide(...): synchronized on Booking only.
ConcurrentHashMap is used for map structure safety.

5. Which things do not need concurrency handling and why?
Read-only methods do not mutate domain state.
Duplicate same-key admin calls are same-key overwrite/exception timing, not duplicate final IDs.
Rider location updates are last-writer-wins with no ordering invariant.
Duplicate equivalent observer registration is prevented by CopyOnWriteArraySet and observer equality.
```

Race conditions solved in F_Concurrency1:

```text
acceptRide(...):
Before F_Concurrency1, concurrent accepts for the same booking could both pass booking assignment validation.
Bad final state: the booking could point to the later driver while the earlier driver's cab remained unavailable.
Fix: synchronize on the Booking while validating booking state, validating cab availability, assigning the driver, and marking the selected cab unavailable.

Datastore maps:
Before F_Concurrency1, concurrent admin/bookRide writes and read snapshots used HashMap.
Bad final state: map structure could be corrupted by concurrent read/write or write/write access.
Fix: use ConcurrentHashMap for riderMap, driverMap, cabMap, and bookingMap.
```

Best for:

- Same-method race handling without a coarse facade lock.
- Preventing multiple drivers from accepting the same ride.
- Protecting map structure while preserving simple datastore APIs.

Tradeoff:

- Cross-method booking lifecycle races are intentionally left for G_Concurrency2.
- Different bookings targeting the same cab are not handled in this package.
- ConcurrentHashMap protects map structure, not mutable Booking or Cab objects.

## G_Concurrency2: Shared-Entity Race Handling

Adds one focused idea on top of `F_Concurrency1`:

```text
Case 2 checks which mutable entities are touched by multiple facade methods
G_Concurrency2 starts from F_Concurrency1 and keeps its same-method guarantees
Booking lifecycle methods, including acceptRide(...), share the Booking lock
Cab reserve/release/location changes happen inside the owning Booking lifecycle lock
Cab is not used as a separate lock target
Main adds a startRide(...) vs cancel(...) demo
```

### Case-2 Report

For each entity from the updated list above:

- `riderMap`: `[addRider]`
- `driverMap`: `[addDriver]`
- `cabMap`: `[addCab]`
- `bookingMap`: `[bookRide]`
- `Booking`: `[acceptRide, cancel, startRide, endRide]`; fields updated: `[driverId, bookingStatus]`
- `Cab`: `[acceptRide, cancel, endRide]`; fields updated: `[available, currentLocation]`
- `Rider`: `[updateRiderLocation, endRide]`; fields updated: `[currentLocation]`
- `driverNotificationObserverSet`: `[addDriverNotificationObserver, removeDriverNotificationObserver, notifyDrivers]`

For each shared entity, what coordination is required, and where is that coordination applied?

`Booking`: `[acceptRide, cancel, startRide, endRide]`; fields updated: `[driverId, bookingStatus]`

Problem:
`acceptRide(...)` can overlap with `cancel(...)`. One thread can validate booking assignment while another cancels the booking, then the first thread can assign a driver after cancellation. `startRide(...)` can also overlap with `cancel(...)` so both operations observe DRIVER_ASSIGNED and produce a result inconsistent with the other operation's success.

Solution:
G_Concurrency2 synchronizes on the Booking object in `acceptRide(...)`, `cancel(...)`, `startRide(...)`, and `endRide(...)` while checking and mutating booking lifecycle state.

`Cab`: `[acceptRide, cancel, endRide]`; fields updated: `[available, currentLocation]`

Problem:
Cab state changes are side effects of the booking lifecycle in this package. For the same booking, `acceptRide(...)`, `cancel(...)`, and `endRide(...)` are already serialized by the Booking lock. Different bookings targeting the same cab are intentionally not handled here because the package does not model a cab-level assignment aggregate.

Solution:
Do not add a Cab lock. Keep cab changes inside the Booking lock for the booking workflow that owns them.

`Rider`: `[updateRiderLocation, endRide]`; fields updated: `[currentLocation]`

Problem:
Concurrent rider location writes are last-writer-wins. The current package has no timestamp/order invariant that says which location should win.

Solution:
No lock is added.

`riderMap`, `driverMap`, `cabMap`, `bookingMap`

Problem:
Concurrent structure access was already a case-1 map issue.

Solution:
G_Concurrency2 keeps F_Concurrency1's ConcurrentHashMap changes. No additional locks are needed.

`driverNotificationObserverSet`

Problem:
Observer add/remove can overlap with notification iteration.

Solution:
Existing CopyOnWriteArraySet already protects iteration plus mutation and avoids duplicate equivalent observers. No additional lock is needed.

Cross-method race conditions solved:

```text
Before G_Concurrency2:
F_Concurrency1 handled same-method acceptRide(...) on Booking and datastore map structure.
It did not coordinate other methods that mutate the same Booking lifecycle state.

Race 1: acceptRide(...) vs cancel(...)
acceptRide(...) could validate assignment while cancel(...) moved the booking to RIDE_CANCELLED.
Fix: both methods synchronize on the Booking.

Race 2: startRide(...) vs cancel(...)
Both methods could act on DRIVER_ASSIGNED state concurrently.
Fix: both methods synchronize on the Booking while checking and mutating booking status.

Race 3: booking lifecycle cab side effects
Cab reservation/release/location changes are kept inside the Booking lock for the owning booking lifecycle operation.
No separate Cab lock is introduced.
```

Concurrency decisions:

```text
1. Which cross-method races exist?
acceptRide(...) vs cancel(...) on Booking.driverId and Booking.bookingStatus.
startRide(...) vs cancel(...) on Booking.bookingStatus.
Cab side effects inside acceptRide(...), cancel(...), and endRide(...) for the same booking lifecycle.

2. Which entity/aggregate should be the lock owner?
Booking is the lifecycle aggregate lock.
Cab is not a lock owner in this package.

3. Whether locks should be object-level, aggregate-level, or lock-manager-level?
Object/aggregate-level synchronized blocks are enough.
No LockManager is needed because Booking is the only lifecycle lock target.

4. Which collections need concurrent structures because reads and writes can overlap across methods?
riderMap, driverMap, cabMap, and bookingMap remain ConcurrentHashMap from F_Concurrency1.
driverNotificationObserverSet remains CopyOnWriteArraySet.

5. Which methods/entities still do not need concurrency handling and why?
Read-only fare and nearby-driver methods do not mutate domain state.
Rider.currentLocation remains last-writer-wins because no ordering invariant exists.
Same-key admin overwrite timing is intentionally skipped because final duplicate IDs cannot exist in a map.
Observer duplicate registration is handled by CopyOnWriteArraySet and observer equality.
```

Best for:

- Coordinating booking lifecycle methods that share Booking and Cab state.
- Keeping lock ownership at entity/aggregate level.
- Avoiding datastore-wide locking.

Tradeoff:

- This is still in-memory synchronization only.
- It does not add distributed locking, persistence transactions, rollback, or timestamp ordering for rider locations.

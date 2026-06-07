# Approach Comparison

## Existing Packages

`A_basic` demonstrates the base elevator system with buildings, elevators, displays, pickup requests, destination selection, and direct in-facade nearest-elevator assignment.

`B_Strategy` adds assignment and movement strategies so elevator selection and next-stop choice are no longer hardcoded in the facade/model.

`C_Observer` adds elevator observers. Displays subscribe to elevators and are notified when stops are added or the elevator moves.

`D_ExceptionHandling` adds explicit facade parameter validation, required lookup checks, duplicate admin checks, and elevator-owned invalid state checks.

`D_ExceptionHandlingV2` removes explicit argument and lookup validation, keeps duplicate admin checks, and keeps elevator-owned state exceptions.

## E_Concurrency1: Same-Method Race Handling

Adds one focused idea on top of D_ExceptionHandlingV2:

```text
Builds on D_ExceptionHandlingV2
Case 1 asks only what happens when the same facade method runs concurrently
No coarse facade-wide lock is used
requestElevator() synchronizes on the assigned Elevator only while adding the pickup stop
enterDestination() synchronizes on the target Elevator only while adding the destination stop
assignElevator() is not locked because same-method calls only read state
Admin add methods use ConcurrentHashMap with the existing contains-plus-put flow
Concurrent duplicate-id admin overwrites are intentionally accepted in this package
addElevator() adds to the CopyOnWriteArraySet-backed Building.elevatorList after the elevator put succeeds
addDisplay() adds to the CopyOnWriteArraySet-backed Elevator.observerList after the display put succeeds
startElevator() delegates to ElevatorMovementService, which uses ElevatorStartLockManager to reject duplicate concurrent starts for the same elevator id
stopElevator() is not locked in case 1 because duplicate stops leave the elevator in the correct MAINTENANCE final state
buildingMap, elevatorMap, and displayMap use ConcurrentHashMap in this package
Building.elevatorList uses CopyOnWriteArraySet for same-method admin add races and duplicate elevator-id suppression
Elevator.observerList uses CopyOnWriteArraySet for same-method admin add races and duplicate display-id suppression
Main demonstrates two admins concurrently adding the same building and two passengers concurrently calling enterDestination() for the same elevator
```

### Case-1 Report

For each facade method:

#### `requestElevator(String buildingId, int floor, Direction direction)`

**Entities getting updated:** `[Elevator.stopSet]`

1. **What if the same method is called with the same params simultaneously?**
   Real race if both calls assign the same elevator. Both calls mutate the same TreeSet stopSet. Even if the same floor is a duplicate logical stop, TreeSet is not thread-safe. Lock on the assigned Elevator while adding the stop.
   Do not replace stopSet with a concurrent ordered set for this case. The facade is protecting the Elevator aggregate workflow, not just a collection write: maintenance-state validation, stop insertion, and observer notification must stay coordinated around the same Elevator.

2. **What if the same method is called with different params simultaneously?**
   If both calls assign the same elevator, the same stopSet race exists. If they assign different elevators, no shared mutable elevator object is updated. No datastore collection structure changes in this method.


#### `enterDestination(String elevatorId, int floor)`

**Entities getting updated:** `[Elevator.stopSet]`

1. **What if the same method is called with the same params simultaneously?**
   Real race on Elevator.stopSet. Duplicate floor insertion may be logically idempotent, but concurrent TreeSet mutation is unsafe. Lock on the Elevator while adding the stop.

2. **What if the same method is called with different params simultaneously?**
   Same elevator and different floors race on the same TreeSet. Different elevators do not share mutable state. No datastore map structure changes in this method.


#### `assignElevator(String buildingId, int floor, Direction direction)`

**Entities getting updated:** `[]`

1. **What if the same method is called with the same params simultaneously?**
   Nothing gets updated. No case-1 lock needed.

2. **What if the same method is called with different params simultaneously?**
   Nothing gets updated. No case-1 lock needed. Building-list read overlap with addElevator() is a cross-method concern left for F_Concurrency2.


#### `addBuilding(String buildingId, String name)`

**Entities getting updated:** `[buildingMap]`

1. **What if the same method is called with the same params simultaneously?**
   The contains-then-put duplicate check is not atomic, so both admin calls can pass the check before either put happens. ConcurrentHashMap is enough for the partial-write concern because it protects the map structure while both calls write.

2. **What if the same method is called with different params simultaneously?**
   Both calls write the same datastore map structure. ConcurrentHashMap protects those independent structural writes, so no facade creation lock is needed.


#### `addElevator(String buildingId, String elevatorId, int capacity, int currentFloor, List<Integer> allowedFloorList, ElevatorMovementStrategy elevatorMovementStrategy)`

**Entities getting updated:** `[elevatorMap, Building.elevatorList]`

1. **What if the same method is called with the same params simultaneously?**
   The contains-then-put duplicate check is not atomic, so both admin calls can pass the check. One elevator value can overwrite the other. In this package, duplicate map overwrite is accepted, but duplicate Building.elevatorList entries are prevented because the collection is a CopyOnWriteArraySet.

2. **What if the same method is called with different params simultaneously?**
   If the building is the same, both calls add to Building.elevatorList. The collection is a CopyOnWriteArraySet, so concurrent add structure is safe without locking the Building. If buildings differ, they update different Building collections. elevatorMap is ConcurrentHashMap, so different elevator ids can be inserted concurrently without a facade creation lock.


#### `addDisplay(String elevatorId, String displayId, int floor)`

**Entities getting updated:** `[displayMap, Elevator.observerList]`

1. **What if the same method is called with the same params simultaneously?**
   The contains-then-put duplicate check is not atomic, so both admin calls can pass the check. One display value can overwrite the other. In this package, duplicate map overwrite is accepted, but duplicate Elevator.observerList registrations are prevented because the collection is a CopyOnWriteArraySet and Display equality is based on displayId.

2. **What if the same method is called with different params simultaneously?**
   If the elevator is the same, both calls add to Elevator.observerList. The collection is a CopyOnWriteArraySet, so concurrent observer registration structure is safe without locking the Elevator. If elevators differ, they update different observer sets. displayMap is ConcurrentHashMap, so different display ids can be inserted concurrently without a facade creation lock.


#### `startElevator(String elevatorId)`

**Entities getting updated:** `[Elevator.currentFloor, Elevator.direction, Elevator.elevatorState, Elevator.stopSet]`

1. **What if the same method is called with the same params simultaneously?**
   Real race. Two callers can enter the same long-running start loop and both mutate elevator movement state and stopSet. Use ElevatorMovementService with ElevatorStartLockManager to reject a duplicate concurrent start for the same elevator id.

2. **What if the same method is called with different params simultaneously?**
   Different elevator ids do not share the same Elevator object. No method-level or datastore-level lock is needed. The lock manager tracks by elevator id.


#### `stopElevator(String elevatorId)`

**Entities getting updated:** `[Elevator.direction, Elevator.elevatorState]`

1. **What if the same method is called with the same params simultaneously?**
   No inconsistent final state. Duplicate stop clicks leave the elevator in MAINTENANCE, and one call may throw because the elevator is already stopped. Throwing alone is not treated as a concurrency bug.

2. **What if the same method is called with different params simultaneously?**
   Different elevators do not share mutable state. Same elevator still has the correct MAINTENANCE final state. start-vs-stop is a cross-method race left for F_Concurrency2.

Same-method concurrency decisions:

```text
1. Which methods actually need concurrency handling?
requestElevator(), enterDestination(), addBuilding(), addElevator(), addDisplay(), and startElevator().
assignElevator() is read-only for case 1.
stopElevator() duplicate calls do not create an incorrect final state.

2. Which shared objects can race?
Elevator.stopSet can race in requestElevator() and enterDestination().
buildingMap can race in addBuilding().
elevatorMap and Building.elevatorList can race in addElevator().
displayMap and Elevator.observerList can race in addDisplay().
The running state of an elevator start loop can race in startElevator().

3. Whether concurrent collections are really needed, and for which maps only?
buildingMap, elevatorMap, and displayMap use ConcurrentHashMap in E_Concurrency1 because same-method admin creates can write the same datastore map structure concurrently.
No atomic putIfAbsent methods are added because duplicate-id overwrites are intentionally accepted in E_Concurrency1.
The existing contains-then-put flow remains non-atomic.
Building.elevatorList uses CopyOnWriteArraySet because same-method admin calls can add elevator ids concurrently and duplicate elevator ids should be suppressed.
Elevator.observerList uses CopyOnWriteArraySet because same-method admin calls can add observers concurrently and duplicate display ids should be suppressed.
stopSet stays TreeSet because a concurrent set would only protect set structure; it would not make Elevator.elevatorState validation, stop insertion, and observer notification atomic.
ConcurrentHashMap would not protect mutable Elevator, Building, or Display objects stored in the maps.

4. Whether locking should be method-level, object-level, aggregate-level, or datastore-level?
requestElevator() and enterDestination() use object-level locking on Elevator.
Admin create methods do not use explicit facade creation locks in E_Concurrency1.
Admin id uniqueness is not guaranteed under simultaneous duplicate-id calls in E_Concurrency1; only collection structure safety is handled.
Admin Building.elevatorList updates use collection-level concurrency through CopyOnWriteArraySet because the same-method race is a collection-structure add race and duplicate elevator ids should be suppressed.
Admin Elevator.observerList updates use collection-level concurrency through CopyOnWriteArraySet because the same-method race is a collection-structure add race and duplicate display ids should be suppressed.
ElevatorMovementService uses lock-manager-level coordination because the movement loop is long-running and should not hold the Elevator monitor for the whole facade method.
Datastore-level locking is avoided.

5. Which things do not need concurrency handling and why?
assignElevator() does not mutate state in case 1.
stopElevator() duplicate calls leave a correct final state.
Display is immutable after construction.
Elevator.allowedFloorList is copied in the constructor and not mutated.
Datastore remove methods are not used by any facade workflow.
```

Race conditions solved in E_Concurrency1:

```text
requestElevator() and enterDestination():
Concurrent same-elevator stop additions can corrupt the TreeSet-backed stopSet.
The Elevator lock serializes the stop insertion for same-method calls.

Admin add methods:
Concurrent admin calls can write datastore maps and parent lists at the same time.
ConcurrentHashMap protects map structure.
CopyOnWriteArraySet protects Building.elevatorList structure and suppresses duplicate elevator ids.
CopyOnWriteArraySet protects Elevator.observerList structure and suppresses duplicate display ids through Display.equals()/hashCode().
Duplicate-id overwrites are intentionally not solved in E_Concurrency1.

addElevator() and addDisplay():
Parent aggregate lists can be appended by concurrent admin calls.
Building.elevatorList uses CopyOnWriteArraySet so same-method admin add races do not corrupt collection structure or duplicate elevator ids.
Elevator.observerList uses CopyOnWriteArraySet so same-method admin add races do not corrupt collection structure or duplicate display ids.

startElevator():
Two start loops for the same elevator can both mutate movement state.
ElevatorMovementService keeps ElevatorStartLockManager so only one active movement loop is allowed per elevator id.
```

Best for:

- Showing same-method race analysis without locking harmless read methods.
- Protecting TreeSet mutations where same-method user calls target the same Elevator aggregate.
- Using concurrent maps and CopyOnWriteArraySet only where the same-method admin race is a collection-structure race.
- Leaving duplicate admin overwrites intentionally unsolved in this package.
- Showing that concurrent collections are not automatic replacements for workflow locks.

Tradeoff:

- It is intentionally not the final elevator concurrency design because movement-vs-stop-addition, movement-vs-stop, and admin-write/user-read races are handled in F_Concurrency2.

## F_Concurrency2: Shared-Entity Race Handling

Adds one focused idea on top of `E_Concurrency1`:

```text
Case 2 checks which mutable entities are touched by multiple facade methods
F_Concurrency2 is copied from E_Concurrency1 and keeps its admin collection choices
Admin methods remain simple: no explicit admin creation locks
buildingMap, elevatorMap, and displayMap remain ConcurrentHashMap
Building.elevatorList remains CopyOnWriteArraySet
Elevator.observerList remains CopyOnWriteArraySet
Elevator.stopSet remains TreeSet because same-Elevator stop workflows are protected by the Elevator aggregate lock
requestElevator() and enterDestination() synchronize on the target Elevator while calling addStop()
stopElevator() synchronizes on the target Elevator while calling stop()
ElevatorMovementService owns the long-running movement loop
ElevatorMovementService synchronizes on the target Elevator around the start transition and each movement step
ElevatorMovementService owns ElevatorStartLockManager so duplicate start loops are rejected outside the facade
Elevator has no long-running loop and no synchronization
Main keeps the case-1 demos and adds a start-vs-enterDestination-vs-stopElevator demo
```

### Case-2 Report

For each entity from the updated list above:

- `buildingMap`: `[addBuilding]`
- `elevatorMap`: `[addElevator]`
- `displayMap`: `[addDisplay]`
- `Building`: `[addElevator]`; fields updated: `[elevatorList]`
- `Elevator`: `[requestElevator, enterDestination, addDisplay, startElevator, stopElevator]`; fields updated: `[stopSet, observerList, currentFloor, direction, elevatorState]`
- `Display`: `[]`; fields updated: `[]`

For each shared entity, what coordination is required, and where is that coordination applied?

#### `Building`

**Facade methods:** `[addElevator]`
**Fields updated:** `[elevatorList]`

**Problem:**
addElevator() writes Building.elevatorList while assignElevator() and requestElevator() can read Building.elevatorList through getElevatorListForBuilding().

**Solution:**
No new F lock is needed.
E_Concurrency1 already changed Building.elevatorList to CopyOnWriteArraySet.
That makes concurrent append and iteration safe and suppresses duplicate elevator ids.
There is no multi-field Building invariant, so a Building object lock would be unnecessary.

#### `Elevator`

**Facade methods:** `[requestElevator, enterDestination, addDisplay, startElevator, stopElevator]`
**Fields updated:** `[stopSet, observerList, currentFloor, direction, elevatorState]`

**Race 1: add-stop methods vs movement loop**

**Problem:**
requestElevator() and enterDestination() add floors to Elevator.stopSet.
ElevatorMovementService reads stopSet, chooses the next stop, moves currentFloor, removes currentFloor from stopSet, and updates direction/elevatorState by calling Elevator one-step operations.
If these run at the same time against TreeSet, the stop schedule can be corrupted or read while being mutated.

**Solution:**
Use the Elevator object as the aggregate lock.
requestElevator() and enterDestination() synchronize on the Elevator in the facade while calling addStop().
ElevatorMovementService synchronizes on the same Elevator while checking pending stops and running one movement step.
TreeSet is safe because addStop(), stopSet navigation, and stopSet removal for the same Elevator are serialized by the same Elevator monitor.
ConcurrentSkipListSet is not needed once the aggregate lock protects the workflow.

**Race 2: stopElevator() vs add-stop methods**

**Problem:**
addStop() checks elevatorState before adding a stop.
stopElevator() changes elevatorState to MAINTENANCE.
Without a shared lock, addStop() can pass the state check just before stopElevator() sets MAINTENANCE, then add a new stop during the maintenance transition.
The final state may still be MAINTENANCE, but the workflow incorrectly accepted a stop during the transition.

**Solution:**
Use the same Elevator aggregate lock.
requestElevator() and enterDestination() hold the Elevator lock while checking state and adding the stop.
stopElevator() holds the Elevator lock while setting MAINTENANCE.
That makes the check-plus-add and stop transition mutually exclusive.

**Race 3: stopElevator() vs movement loop**

**Problem:**
stopElevator() can set direction to IDLE and elevatorState to MAINTENANCE while ElevatorMovementService is moving the elevator.
Without coordination, the movement step can later write direction = UP/DOWN and elevatorState = MOVING after the admin stop.
That leaves the elevator moving even though it was stopped.

**Solution:**
Use the same Elevator aggregate lock.
ElevatorMovementService holds the Elevator monitor while running one movement step.
stopElevator() holds the same Elevator monitor while setting MAINTENANCE.
So MAINTENANCE cannot be overwritten by MOVING for the same Elevator.

**Observer note:**
addDisplay() writes observerList while addStop() and movement notify observers.
No F lock is needed for this because observerList is already CopyOnWriteArraySet from E_Concurrency1.

#### `Display`

**Facade methods:** `[]`
**Fields updated:** `[]`

**Problem:**
Display has final fields and only prints from observer callbacks.
It does not own mutable state updated by facade methods.

**Solution:**
No Display lock is needed.

#### Datastore maps

**Problem:**
Admin methods write datastore maps while user/system/admin methods can read those maps.
This creates map-structure read/write overlap.
The admin duplicate-id contains-plus-put check is still not atomic, but duplicate overwrite is intentionally accepted in this concurrency progression.

**Solution:**
No new F map change is needed because E_Concurrency1 already uses ConcurrentHashMap for buildingMap, elevatorMap, and displayMap.
ConcurrentHashMap protects map structure only.
It does not protect mutable Building or Elevator objects stored inside those maps.
Do not add admin creation locks in F_Concurrency2 because this package is not trying to enforce duplicate-id atomicity.

Cross-method race conditions solved:

```text
Before F_Concurrency2:
E_Concurrency1 handled same-method stop additions, same-method admin collection-structure writes, duplicate observer/elevator id list entries, and duplicate startElevator() calls.
It did not coordinate all methods that mutate the same Elevator aggregate.

Race 1: requestElevator()/enterDestination() vs startElevator()
User methods add stops while the movement loop reads and removes stops.
F_Concurrency2 uses the Elevator aggregate lock for addStop() and movement steps.

Race 2: stopElevator() vs requestElevator()/enterDestination()
A stop can be accepted during the maintenance transition if addStop() and stop() are not mutually exclusive.
F_Concurrency2 uses the Elevator aggregate lock for addStop() and stop().

Race 3: stopElevator() vs startElevator()
Movement can overwrite MAINTENANCE with MOVING if stop and movement state updates interleave.
F_Concurrency2 uses the Elevator aggregate lock for stop() and movement steps.

Not a new F lock: addDisplay() vs notification
Observer registration and notification can overlap, but Elevator.observerList is already CopyOnWriteArraySet.

Not a new F lock: addElevator() vs assignment reads
Building.elevatorList append and iteration can overlap, but Building.elevatorList is already CopyOnWriteArraySet.
```

Concurrency decisions:

```text
1. Which cross-method races exist?
requestElevator()/enterDestination() can overlap with startElevator() on Elevator.stopSet.
stopElevator() can overlap with requestElevator()/enterDestination() on the addStop() state-check-plus-add workflow.
stopElevator() can overlap with startElevator() on Elevator.currentFloor, direction, and elevatorState.
addDisplay() vs observer notification is already safe because observerList is CopyOnWriteArraySet.
addElevator() vs assignment reads is already safe because Building.elevatorList is CopyOnWriteArraySet.
Admin map writes vs facade reads are already safe because E uses ConcurrentHashMap.

2. Which entity/aggregate should be the lock owner?
Elevator is the aggregate that needs F locking.
The lock target is the Elevator object.
It protects stopSet, currentFloor, direction, and elevatorState as one aggregate workflow.
Building does not need a lock because its only mutable collection is already CopyOnWriteArraySet and there is no multi-field invariant.
Display does not need a lock because it has no mutable facade-updated state.

3. Whether locks should be object-level, aggregate-level, or lock-manager-level?
F_Concurrency2 uses aggregate-level locking on the Elevator object for addStop(), movement, and stop workflows.
Facade methods own the external workflow locks for addStop() and stop().
ElevatorMovementService owns the movement-loop lock and keeps it outside the Elevator core entity.
ElevatorMovementService owns ElevatorStartLockManager as the lock-manager-level guard for duplicate long-running start loops by elevator id.
No method-level facade-wide lock is added.
No datastore-level lock is added.
No admin creation locks are added.

4. Which collections need concurrent structures because reads and writes can overlap across methods?
buildingMap, elevatorMap, and displayMap remain ConcurrentHashMap from E_Concurrency1.
Building.elevatorList remains CopyOnWriteArraySet from E_Concurrency1.
Elevator.observerList remains CopyOnWriteArraySet from E_Concurrency1.
Elevator.stopSet remains TreeSet because same-Elevator stopSet access is serialized by the Elevator aggregate lock.
ConcurrentHashMap does not protect mutable Elevator or Building internals.

5. Which methods/entities still do not need concurrency handling and why?
addBuilding(), addElevator(), and addDisplay() do not get admin creation locks because duplicate-id overwrites are accepted and collection/map structure safety is handled by concurrent collections.
assignElevator() does not mutate state; its Building list iteration is safe because the list is CopyOnWriteArraySet, and Elevator state reads are best-effort.
addDisplay() does not lock the Elevator because observerList is CopyOnWriteArraySet.
Building does not need object locking because elevatorList has no multi-field invariant.
Display has no mutable facade-updated state.
Elevator.allowedFloorList is copied in the constructor and not mutated.
Datastore remove methods are not used by facade workflows.
Duplicate stopElevator() calls alone are not a correctness bug; stop participates in F locking because of addStop-vs-stop and start-vs-stop races.
```

Best for:

- Showing that F_Concurrency2 is built directly from E_Concurrency1.
- Handling all real Elevator aggregate races with one lock target.
- Keeping the long-running movement loop out of Elevator and out of the facade.
- Avoiding concurrent collections where aggregate locking is the correct fix.
- Keeping admin creation simple with concurrent collections instead of adding creation locks.

Tradeoff:

- Elevator movement holds the Elevator lock while simulating one floor movement, so add-stop and stop calls wait for that step to finish.
- This is still narrower than locking the whole facade, datastore, building, or all elevators.

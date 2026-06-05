# Approach Comparison

## Existing Packages

`A_basic` demonstrates the base elevator system with buildings, elevators, displays, pickup requests, destination selection, and direct in-facade nearest-elevator assignment.

`B_Strategy` adds assignment and movement strategies so elevator selection and next-stop choice are no longer hardcoded in the facade/model.

`C_Observer` adds elevator observers. Displays subscribe to elevators and are notified when stops are added or the elevator moves.

`D_ExceptionHandling` adds explicit facade parameter validation, required lookup checks, duplicate admin checks, and elevator-owned invalid state checks.

`D_ExceptionHandlingV2` removes explicit argument and lookup validation, keeps duplicate admin checks, and keeps elevator-owned state exceptions.

## Concurrency1

### Goal

`E_Concurrency1` fixes races that happen when multiple threads execute the same facade method concurrently. It does not try to solve all cross-method races.

### Race Conditions Solved

`requestElevator(...)`

- facade method: `requestElevator(String buildingId, int floor, Direction direction)`
- shared object/entity: assigned `Elevator.stopSet`
- bad interleaving: two requests can assign the same elevator and concurrently mutate the same `TreeSet`
- chosen fix: lock on the assigned `Elevator` while calling `elevator.addStop(floor)`
- why this fix is enough for Concurrency1: same-method calls for different elevators do not block each other, and same-elevator stop additions are serialized

`enterDestination(...)`

- facade method: `enterDestination(String elevatorId, int floor)`
- shared object/entity: `Elevator.stopSet`
- bad interleaving: two passengers selecting destinations in the same elevator can concurrently mutate the same `TreeSet`
- chosen fix: lock on the target `Elevator` while calling `elevator.addStop(floor)`
- why this fix is enough for Concurrency1: the unsafe mutable stop set is protected for concurrent executions of this same method

`addBuilding(...)`

- facade method: `addBuilding(String buildingId, String name)`
- shared object/entity: `DataStore.buildingMap`
- bad interleaving: two admins can both pass `containsBuilding(buildingId)` and both call `putBuilding(...)`
- chosen fix: `buildingCreationLock` around duplicate check, object creation, and map put
- why this fix is enough for Concurrency1: same-method duplicate creation and same-method `HashMap` writes are serialized

`addElevator(...)`

- facade method: `addElevator(String buildingId, String elevatorId, int capacity, int currentFloor, List<Integer> allowedFloorList, ElevatorMovementStrategy elevatorMovementStrategy)`
- shared object/entity: `DataStore.elevatorMap`, `Building.elevatorList`
- bad interleaving: two admins can both pass `containsElevator(elevatorId)`, both put an elevator, or both mutate the same building elevator list
- chosen fix: `elevatorCreationLock` around duplicate check and map put, with `synchronized (building)` around `building.addElevator(elevatorId)`
- why this fix is enough for Concurrency1: same-method elevator creation is serialized without locking the whole datastore

`addDisplay(...)`

- facade method: `addDisplay(String elevatorId, String displayId, int floor)`
- shared object/entity: `DataStore.displayMap`, `Elevator.observerList`
- bad interleaving: two admins can both pass `containsDisplay(displayId)`, both put a display, or concurrently append observers to the same elevator
- chosen fix: `displayCreationLock` around duplicate check and map put, with `synchronized (elevator)` around observer registration
- why this fix is enough for Concurrency1: same-method display creation and same-elevator observer registration are serialized

`startElevator(...)`

- facade method: `startElevator(String elevatorId)`
- shared object/entity: elevator running lifecycle for the same elevator id
- bad interleaving: two callers can enter the same elevator's long-running `start()` loop concurrently and both mutate movement state and stops
- chosen fix: `ElevatorStartLockManager` tracks running elevator ids and rejects a duplicate concurrent start
- why this fix is enough for Concurrency1: it prevents duplicate same-elevator start loops without locking the whole elevator for the full loop

### Things Intentionally Not Solved

`E_Concurrency1` intentionally does not solve `addElevator(...)` racing with `assignElevator(...)` or `requestElevator(...)` while a building elevator list is being read.

`E_Concurrency1` intentionally does not solve datastore map reads from other facade methods overlapping with admin writes.

`E_Concurrency1` intentionally does not solve `startElevator(...)` movement racing with `requestElevator(...)`, `enterDestination(...)`, or `stopElevator(...)` on the same elevator aggregate.

`E_Concurrency1` intentionally does not solve `addDisplay(...)` racing with observer notification from the movement loop.

### Collections Changed

No maps or lists are changed to concurrent collections in `E_Concurrency1`.

The same-method races are handled with scoped locks. `HashMap`, `ArrayList`, and `TreeSet` remain in place.

### Locking Strategy

`Elevator` object locks protect same-elevator `stopSet` updates and observer registration.

`Building` object locks protect same-building elevator-list mutation during `addElevator(...)`.

Facade-owned creation locks protect check+put workflows for building, elevator, and display ids.

`ElevatorStartLockManager` protects duplicate concurrent starts by elevator id.

Method-level locking and datastore-level locking are avoided because the races are narrower than the whole facade or whole datastore.

### Demo

`E_Concurrency1.Main` adds a concurrent admin duplicate demo where two admins try to add the same building id.

`E_Concurrency1.Main` also adds a concurrent destination demo where two passengers call `enterDestination(...)` for the same elevator and floor.

## Concurrency2

### Goal

`F_Concurrency2` builds directly on `E_Concurrency1` and fixes additional races where the same mutable entity or aggregate is updated by multiple facade methods.

### Race Conditions Solved

`Building` aggregate

- entity/aggregate: `Building`
- methods involved: `addElevator(...)`, `assignElevator(...)`, `requestElevator(...)`
- bad interleaving: admin `addElevator(...)` can append to `Building.elevatorList` while assignment reads and iterates that list
- chosen fix: `addElevator(...)` already mutates under `synchronized (building)`, and `getElevatorListForBuilding(...)` now copies elevator ids under the same `Building` lock
- why this fix is enough: the building list is protected at its aggregate owner, while elevator assignment runs after a safe snapshot is built

`Elevator` stop and movement aggregate

- entity/aggregate: `Elevator`
- methods involved: `requestElevator(...)`, `enterDestination(...)`, `startElevator(...)`
- bad interleaving: user methods can add stops while the movement loop reads/removes stops from the same `TreeSet`
- chosen fix: `Elevator.addStop(...)` synchronizes on the elevator, and `Elevator.start()` uses short synchronized sections around stop checks, movement steps, stop removal, and observer notification
- why this fix is enough: all `stopSet` reads and writes that matter for movement are serialized on the elevator aggregate

`Elevator` state transition aggregate

- entity/aggregate: `Elevator`
- methods involved: `startElevator(...)`, `stopElevator(...)`, `requestElevator(...)`, `enterDestination(...)`
- bad interleaving: `stopElevator(...)` can set `MAINTENANCE` while movement or add-stop logic overwrites or ignores the state transition
- chosen fix: `Elevator.stop(...)`, `Elevator.addStop(...)`, and the movement loop synchronize on the elevator object
- why this fix is enough: maintenance checks, stop acceptance, movement state updates, and stop transitions use the same aggregate lock

`Elevator` observer aggregate

- entity/aggregate: `Elevator`
- methods involved: `addDisplay(...)`, `requestElevator(...)`, `enterDestination(...)`, `startElevator(...)`
- bad interleaving: display registration can mutate `observerList` while stop addition or movement notification iterates it
- chosen fix: `Elevator.addObserver(...)` and `notifyObservers()` are executed while holding the elevator lock
- why this fix is enough: observer-list mutation and iteration are serialized without introducing `CopyOnWriteArrayList`

Datastore map structure

- entity/aggregate: datastore map structure for buildings and elevators
- methods involved: admin add methods and user/system/admin read methods
- bad interleaving: `addBuilding(...)` or `addElevator(...)` can write map structure while another facade method reads from it
- chosen fix: `buildingMap` and `elevatorMap` are changed to `ConcurrentHashMap`
- why this fix is enough: the concurrent maps protect collection structure only; mutable `Building` and `Elevator` objects still use aggregate locks

### Collections Changed

`buildingMap` is changed to `ConcurrentHashMap` because building writes can overlap with building reads across facade methods.

`elevatorMap` is changed to `ConcurrentHashMap` because elevator writes can overlap with elevator reads across facade methods.

`displayMap` remains `HashMap` because only `addDisplay(...)` writes it and no facade method reads it concurrently.

`stopSet` remains `TreeSet` because elevator aggregate locking protects it.

`observerList` remains `ArrayList` because elevator aggregate locking protects registration and notification.

### Locking Strategy

`Building` is the lock owner for `elevatorList` mutations and snapshots.

`Elevator` is the lock owner for `stopSet`, `currentFloor`, `direction`, `elevatorState`, and `observerList`.

`Elevator.start()` is not synchronized as a whole because it is long-running. Instead, it locks only the movement decision and one movement step at a time.

`ElevatorStartLockManager` remains responsible for rejecting duplicate concurrent starts for the same elevator id.

Datastore-level locking is avoided. Concurrent maps are used only for the map structures that have real cross-method read/write overlap.

### Things Not Needing Concurrency Handling

`assignElevator(...)` does not lock every elevator while reading `currentFloor` because assignment is a best-effort heuristic and the floor can change immediately after selection anyway.

`Display` does not need locking because it is immutable after construction.

`Elevator.allowedFloorList` does not need locking because it is copied in the constructor and not mutated afterward.

Duplicate same-method `stopElevator(...)` calls do not need a special Concurrency1 fix because the final state remains `MAINTENANCE`; one duplicate exception is not itself a concurrency bug.

`displayMap` does not need a concurrent collection in `F_Concurrency2` because there is no facade read/write overlap for it.

Datastore `remove*` methods are not handled because no facade workflow uses them.

### Demo

`F_Concurrency2.Main` keeps the `E_Concurrency1` demos.

It also adds a cross-method movement demo with a dedicated elevator where one thread runs `startElevator(...)`, one passenger adds a stop with `enterDestination(...)`, and an admin calls `stopElevator(...)`. The final state shows the elevator exits in `MAINTENANCE` with no pending stops.
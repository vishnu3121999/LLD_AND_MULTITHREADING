# Approach Comparison

## Existing Packages

`A_basic` demonstrates the first runnable Parking Lot design with parking lots, floors, slots, vehicles, tickets, parking, unparking, and a simple in-facade fee calculation.

`B_Strategy` extracts extensible behavior behind strategies:
- `SlotAssignmentStrategy` assigns an available slot.
- `FeeCalculationStrategy` calculates the parking fee.
- `PaymentStrategy` processes payment methods.

`C_Factory` keeps slot assignment and fee calculation as direct strategies, and adds a factory only for payment strategy selection by payment type.

`D_ExceptionHandling` adds facade/service validations, model-owned state transition exceptions, and demo-boundary exception handling.

`D_ExceptionHandlingV2` keeps duplicate/business runtime exceptions and model-owned state transition exceptions, while removing explicit argument and lookup exception handling.

`E_OrchestrationValidations` adds only orchestration validations needed to prevent invalid partial updates across multi-update facade workflows.

`F_Concurrency1` handles same facade method races with targeted facade locks and only the collection changes needed for same-method writes.

`G_Concurrency2` builds on `F_Concurrency1` and handles cross-method races on shared parking entities and admin-write/user-read collection overlap.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- The system supports one or more parking lots.
- A parking lot has parking floors.
- A parking floor has parking slots.
- Slots have types such as SMALL, MEDIUM, and LARGE.
- Vehicles have types such as CAR, BIKE, and TRUCK.

Action based points:
- Admin Actions:
    - Admin adds parking lots, floors, and slots.
- User Actions:
  - User parks a vehicle and receives a parking ticket.
  - User unparks a vehicle using the parking ticket.
  - User does the payment.
- System Actions:
  - Assign slot for park request & calculate parking fee

Out of Scope:
- Pre-booking

#### Common Misc

Offline or online:
- Online

Extensibility:
- extensible to make this inmemory app to persistence( use IDatastore, InmemoryDatastore)
- Core Entities:
  - SlotType , VehicleType, PaymentTypes
- Behaviour:
  - Slot Assignment , Fee Calculation

History and undo:
- NA

Notifications:
- NA
- If considered manual spot selection, then have to show the available spots on displays at multipel entry points. Then observer applicable. 

Exception handling:
- Missing lot/floor/slot/ticket and no available slot are later-package validations.

Concurrency:
- Simultaneous parking into the same slot is a later concurrency package concern.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- addParkingLot(Admin) , addParkingFloor(Admin) , addParkingSlot(Admin)
- parkVehicle(User) -> findAvailableSlot(System) -> createParkingTicket(System) -> occupySlot(System)
- unparkVehicle(User) -> vacateSlot(System) -> calculateAmount(System) 
- pay(User) -> closeTicket(System)

### Class Diagram

Layers:
- `Main` creates IDs and calls the facade.
- `ParkingLotFacade` owns user/admin/system workflows.
- `DataStore` and `InMemoryDataStore` store maps only.
- Models own only their simple state changes.

Identify Core Entities & Cardinality:
- Lot -> Floor -> Slot
- Vehicle
- Ticket
- Payment

Core entities:
- `ParkingLot(parkingLotId, name, parkingFloorList)` stores floor IDs.
- `ParkingFloor(parkingFloorId, name, parkingSlotList)` stores slot IDs.
- `ParkingSlot(parkingSlotId, number, slotType, slotStatus, vehicleId)` owns occupy/vacate state.
- `Vehicle(vehicleId, registrationNumber, vehicleType)` represents the parked vehicle.
- `ParkingTicket(parkingTicketId, vehicleId, parkingSlotId, entryTime, exitTime, amount, ticketStatus)` connects vehicle and slot for one parking session.
- `Payment`  -> part of extensibility list
  - Option-1:
    - CreditCardPayment ( id, cardNo , cvv , amount , status )
    - UPIPayment ( id, upiId ,amount , status)
  - Option-2:
    - Payment ( id, PaymentType , cardNo , cvv , upiId , amount , status)
  - Options-3:
    - abstract class Payment (id , amount , status)
      - CreditCardPayment ( cardNo , cvv )
      - UPIPayment ( upiId  )
  - Identify methods:
    - processPayment
      - Depends on external API calls - so shouldn’t be put inside the entity, so new class called PaymentProcessor
  - So 3


Method placement:
- Admin,User methods in facade
- `createParkingTicket` , `calculateAmount` - facade
- `closeTicket` - Ticket
- `occupySlot` , `vacateSlot` - Slot
- `findAvailableSlot` - facade as keeping it inside parkinglot means providing datastore as dependency
- On successful `unparkVehicle`, the facade removes the parked vehicle entry so the same `vehicleId` can park again later.

## B_Strategy Design Analysis

### What changes from A_basic

- Slot assignment moves from facade conditionals to `SlotAssignmentStrategy`.
- Fee calculation moves from facade helper logic to `FeeCalculationStrategy`.
- Payment processing moves from `PaymentProcessor` type checks doing the work directly to `PaymentStrategy` implementations.

### Added packages/classes

- `strategy.assignment.SlotAssignmentStrategy`
- `strategy.assignment.FirstAvailableSlotAssignmentStrategy`
- `pricing.FeeCalculationStrategy`
- `pricing.HourlyFeeCalculationStrategy`
- `payment.PaymentStrategy`
- `payment.CreditCardPaymentStrategy`
- `payment.UPIPaymentStrategy`

### Why this is B

The facade still orchestrates the workflow, but behavior that is likely to vary is injected as strategy. No factory is introduced yet; callers wire the strategies explicitly.

## C_Factory Design Analysis

### What changes from B_Strategy

- `PaymentStrategyFactory` is introduced to choose the payment strategy for a payment object.
- `PaymentProcessor` asks the factory for a strategy and then processes the payment.
- Slot assignment and fee calculation remain direct strategies.

### Scope decision

Factory is intentionally limited to payment types in this package. Slot assignment and pricing can get factories later only if there are multiple runtime-selected variants.

## D_ExceptionHandling Design Analysis

### What changes from C_Factory

- Facade user/admin boundary methods validate input parameters with `IllegalArgumentException`.
- Facade/service lookup helpers throw `NoSuchElementException` for missing datastore records.
- Duplicate entity creation throws `RuntimeException`.
- Business failures such as no available slot, amount mismatch, and payment failure throw `RuntimeException`.
- `ParkingSlot` and `ParkingTicket` throw `IllegalStateException` only inside methods that mutate their owned state.
- `Main` catches `RuntimeException` at the demo boundary.

### Ownership

- Facade/service owns argument, lookup, duplicate, and business validations; `PaymentStrategyFactory` owns payment-type validation.
- Models own only state transition validations.
- Datastore remains passive.

## D_ExceptionHandlingV2 Design Analysis

### What changes from D_ExceptionHandling

- Explicit `IllegalArgumentException` parameter checks are removed.
- Explicit `NoSuchElementException` lookup helpers are removed.
- Duplicate and business `RuntimeException` checks remain.
- Model-owned `IllegalStateException` checks remain.

## E_OrchestrationValidations Design Analysis

### What changes from D_ExceptionHandlingV2

- Adds orchestration validation only for facade methods with concrete partial-update risk.
- Adds public read-only `validateCanVacate`, `validateCanRecordExit`, and `validateCanClose` methods to state-owning model classes.
- Mutating model methods still call their own validation methods before changing state.
- Reorders `parkVehicle` so slot occupation happens before datastore writes.
- Keeps datastore classes passive and does not add rollback, transaction abstractions, locks, orchestration services, State pattern, or validation chains.

### Orchestration Analysis

`parkVehicle`
- Updates in order before E: `putVehicle`, `parkingSlot.occupy`, `putParkingTicket`.
- Mutations: vehicle map, slot state, ticket map.
- Throwing updates: `parkingSlot.occupy` can throw `IllegalStateException`.
- Partial-update risk: a stored vehicle can remain without an occupied slot or ticket if slot occupation fails.
- Selected solution: reorder updates. E calls `parkingSlot.occupy` before storing the vehicle and ticket.

`unparkVehicle`
- Updates in order before E: `parkingSlot.vacate`, `parkingTicket.recordExit`, `removeVehicle`.
- Mutations: slot state, ticket exit/amount/status, vehicle map.
- Throwing updates: `parkingSlot.vacate` and `parkingTicket.recordExit` can throw `IllegalStateException`.
- Partial-update risk: a slot can become available while the ticket remains active if the later ticket transition fails.
- Selected solution: call `parkingSlot.validateCanVacate` and `parkingTicket.validateCanRecordExit`, then perform `vacate`, `recordExit`, and vehicle removal.

`pay`
- Updates in order before E: `paymentProcessor.process`, `parkingTicket.close`.
- Mutations: payment status, ticket status.
- Throwing updates: `parkingTicket.close` can throw `IllegalStateException`.
- Partial-update risk: payment can become completed while the ticket remains payment-pending if close fails.
- Selected solution: call `parkingTicket.validateCanClose` before payment processing, then process payment and close the ticket.

### Intentionally Skipped

`findAvailableSlot`
- No updates, so no orchestration validation is needed.

`addParkingLot`
- Single datastore update only, so there is no multi-update partial state to protect.

`addParkingFloor`
- Updates: `putParkingFloor`, then `parkingLot.addParkingFloor`.
- `addParkingFloor` on the model has no state-transition validation and does not throw for a valid parent object in the current design.
- This is an admin workflow and there is no concrete invalid partial-update outcome in this package, so orchestration validation is skipped.

`addParkingSlot`
- Updates: `putParkingSlot`, then `parkingFloor.addParkingSlot`.
- `addParkingSlot` on the model has no state-transition validation and does not throw for a valid parent object in the current design.
- This is an admin workflow and there is no concrete invalid partial-update outcome in this package, so orchestration validation is skipped.

## F_Concurrency1: Same-Method Race Handling

Adds one focused idea on top of `E_OrchestrationValidations`:

```text
Builds on E_OrchestrationValidations.
Case 1 asks only what happens when the same facade method runs concurrently.
No coarse facade-wide lock is used for user workflows.
parkVehicle() synchronizes on the target ParkingLot while selecting and occupying a slot.
Duplicate same-vehicle park requests are intentionally not handled with a dedicated vehicle-id lock because this is a harmless race in this design; the ticket id and vehicle map key are derived from vehicleId.
Duplicate unparkVehicle() calls for the same ticket are intentionally not locked because the final slot/ticket/vehicle state remains correct enough for this package.
pay() synchronizes on the ParkingTicket while checking amount, processing payment, and closing the ticket.
addParkingLot() is intentionally not locked because duplicate same-id lot creation is harmless in this design; parkingLotMap uses ConcurrentHashMap for map structure safety.
addParkingFloor() and addParkingSlot() are intentionally not locked; duplicate global floor/slot ids across different parents are treated as caller/data-quality mistakes outside this package.
All datastore maps use ConcurrentHashMap because same-method workflows can write those map structures concurrently.
ParkingLot.parkingFloorSet and ParkingFloor.parkingSlotSet use CopyOnWriteArraySet so same-parent duplicate appends collapse and concurrent parent-id updates remain structure-safe.
Main keeps the normal demo and adds same-method demos for duplicate addParkingLot() and two parkVehicle() calls competing for one slot.
```

### Case-1 Report

For each facade method:

#### `parkVehicle(String parkingLotId, String vehicleId, String registrationNumber, VehicleType vehicleType)`

**Entities getting updated:** `[ParkingSlot.slotStatus, ParkingSlot.vehicleId, vehicleMap, parkingTicketMap]`

1. **What if the same method is called with the same params simultaneously?**
   Harmless race, so no dedicated concurrency handling is added for duplicate same-vehicle requests. Because the ticket id is derived from `vehicleId`, duplicate writes target the same `vehicleMap` and `parkingTicketMap` keys. The final stored vehicle/ticket state remains coherent enough for this package. 

2. **What if the same method is called with different params simultaneously?**
   If calls target the same parking lot, different vehicles can still select the same slot. The `ParkingLot` lock serializes slot selection and occupation for that lot. If calls target different lots, no slot object overlaps, but both calls can write `vehicleMap` and `parkingTicketMap`; those maps use `ConcurrentHashMap`.

#### `unparkVehicle(String parkingTicketId)`

**Entities getting updated:** `[ParkingSlot.slotStatus, ParkingSlot.vehicleId, ParkingTicket.exitTime, ParkingTicket.amount, ParkingTicket.ticketStatus, vehicleMap]`

1. **What if the same method is called with the same params simultaneously?**
   Harmless race, so no dedicated same-method lock is added. Duplicate calls may both try to vacate the same slot and record exit on the same ticket, or one call may throw after the other has already completed. In either case, the final state remains coherent: slot available, ticket payment-pending, and vehicle removed.

2. **What if the same method is called with different params simultaneously?**
   Valid different tickets update different ticket/slot objects. The only shared structure is `vehicleMap`, and it uses `ConcurrentHashMap` for concurrent removes.

#### `pay(String parkingTicketId, Payment payment)`

**Entities getting updated:** `[Payment.status, ParkingTicket.ticketStatus]`

1. **What if the same method is called with the same params simultaneously?**
   Real race. Both calls can process payment before either closes the ticket. F synchronizes on the `ParkingTicket` and runs amount check, `validateCanClose`, payment processing, and `close` inside the lock.

2. **What if the same method is called with different params simultaneously?**
   Different tickets do not share ticket state. No additional same-method lock is needed. Reusing the same `Payment` object across tickets is outside the current model.

#### `findAvailableSlot(String parkingLotId, SlotType slotType)`

**Entities getting updated:** `[]`

1. **What if the same method is called with the same params simultaneously?**
   Nothing gets updated. No case-1 lock needed.

2. **What if the same method is called with different params simultaneously?**
   Nothing gets updated. Admin-write/user-read overlap is a cross-method concern left for `G_Concurrency2`.

#### `addParkingLot(String parkingLotId, String name)`

**Entities getting updated:** `[parkingLotMap]`

1. **What if the same method is called with the same params simultaneously?**
   Harmless race, so no workflow lock is added. Both admin calls can pass `containsParkingLot` before either writes, but both writes target the same `parkingLotMap` key and there is no parent list update. The final map still has one lot for that id; F uses `ConcurrentHashMap` only for map structure safety.

2. **What if the same method is called with different params simultaneously?**
   Both calls write the same map structure, so `parkingLotMap` uses `ConcurrentHashMap`. No parent entity or parent id list is shared, so no `catalogLock` is needed.

#### `addParkingFloor(String parkingLotId, String parkingFloorId, String name)`

**Entities getting updated:** `[parkingFloorMap, ParkingLot.parkingFloorSet]`

1. **What if the same method is called with the same params simultaneously?**
   Harmless race under the current boundary. Both calls can pass `containsParkingFloor` before either writes, but `parkingFloorMap` uses `ConcurrentHashMap` for structure safety and `ParkingLot.parkingFloorSet` collapses duplicate same-parent ids. 

2. **What if the same method is called with different params simultaneously?**
   Same lot means concurrent adds to `ParkingLot.parkingFloorSet`; different lots still write `parkingFloorMap`. F uses `CopyOnWriteArraySet` for parent ids and `ConcurrentHashMap` for map structure safety. No workflow lock is added.

#### `addParkingSlot(String parkingFloorId, String parkingSlotId, String number, SlotType slotType)`

**Entities getting updated:** `[parkingSlotMap, ParkingFloor.parkingSlotSet]`

1. **What if the same method is called with the same params simultaneously?**
   Harmless race under the current boundary. Both calls can pass `containsParkingSlot` before either writes, but `parkingSlotMap` uses `ConcurrentHashMap` for structure safety and `ParkingFloor.parkingSlotSet` collapses duplicate same-parent ids. 

2. **What if the same method is called with different params simultaneously?**
   Same floor means concurrent adds to `ParkingFloor.parkingSlotSet`; different floors still write `parkingSlotMap`. F uses `CopyOnWriteArraySet` for parent ids and `ConcurrentHashMap` for map structure safety. No workflow lock is added.

Same-method concurrency decisions:

```text
1. Which methods actually need concurrency handling?
parkVehicle() and pay() need workflow locking.
addParkingLot(), addParkingFloor(), and addParkingSlot() need collection-structure safety through ConcurrentHashMap and CopyOnWriteArraySet, not workflow locking.
unparkVehicle() does not get a same-method lock; it relies on ConcurrentHashMap for vehicleMap remove structure safety.
findAvailableSlot() is read-only for case 1.

2. Which shared objects can race?
ParkingLot slot assignment can race in parkVehicle() when different vehicles park in the same lot concurrently.
ParkingTicket can race in duplicate pay().
ParkingSlot and ParkingTicket can race in duplicate unparkVehicle(), but that duplicate case is intentionally skipped as harmless in F_Concurrency1.
parkingLotMap can be written concurrently by addParkingLot(); duplicate same-key writes are harmless, but the map structure still needs ConcurrentHashMap.
parkingFloorMap, parkingSlotMap, ParkingLot.parkingFloorSet, and ParkingFloor.parkingSlotSet can be written concurrently by floor/slot admin add workflows.
vehicleMap and parkingTicketMap can race in user workflows.

3. Whether concurrent collections are really needed, and for which maps/lists only?
All datastore maps use ConcurrentHashMap in F_Concurrency1.
ParkingLot.parkingFloorSet and ParkingFloor.parkingSlotSet use CopyOnWriteArraySet.
ConcurrentHashMap does not protect mutable ParkingLot, ParkingFloor, ParkingSlot, or ParkingTicket objects stored in the maps.

4. Whether locking should be method-level, object-level, aggregate-level, lock-manager-level, or datastore-level?
parkVehicle() uses aggregate-level locking on ParkingLot.
pay() uses object-level locking on ParkingTicket.
Admin add methods are intentionally not locked.
No datastore-level lock is added.

5. Which things do not need concurrency handling and why?
findAvailableSlot() does not mutate state in case 1.
Different-ticket pay() and unparkVehicle() calls do not share ticket state.
Duplicate unparkVehicle() calls are not locked because the final state remains coherent and throwing alone is not treated as a concurrency bug.
Duplicate addParkingLot() calls are not locked because the final map state remains coherent and there is no parent list update.
Duplicate addParkingFloor()/addParkingSlot() calls are not locked because parent sets collapse same-parent duplicate ids; assigning the same global id to different parents is treated as invalid caller input outside this package.
Payment strategies and pricing strategies are stateless in this package.
ParkingLot/ParkingFloor parent-id read overlap with admin writes is structure-safe because the parent collections are CopyOnWriteArraySet.
```

Race conditions solved in `F_Concurrency1`:

```text
parkVehicle():
Concurrent different-vehicle calls in the same lot can select the same available slot.
The ParkingLot lock serializes slot assignment for the lot.
Concurrent same-vehicle calls are intentionally not handled with a dedicated lock because duplicate writes use the same derived vehicle/ticket keys and do not create a serious final-state corruption case in this design.

pay():
Duplicate pay calls can process payment twice.
The ParkingTicket lock makes amount check, state check, payment processing, and ticket close one workflow.

addParkingFloor()/addParkingSlot():
Concurrent duplicate floor/slot admin calls can pass contains checks, but parent sets prevent duplicate same-parent ids and ConcurrentHashMap protects map structure.
The package intentionally does not coordinate the business mistake of assigning the same global floor/slot id to different parents.

addParkingLot():
Concurrent duplicate lot creation is intentionally not locked because it only overwrites the same map key.
ConcurrentHashMap protects parkingLotMap structure.
```

Best for:

- Showing same-method race handling without locking the whole facade.
- Protecting slot assignment at the parking-lot aggregate level.
- Preventing duplicate payment for the same ticket.
- Keeping admin creation lock-free while keeping map and parent-id collection structures safe.

Tradeoff:

- It intentionally does not handle admin-write/user-read overlap or park-vs-unpark shared-slot races; those are handled in `G_Concurrency2`.

## G_Concurrency2: Shared-Entity Race Handling

Adds one focused idea on top of `F_Concurrency1`:

```text
Builds directly on F_Concurrency1.
Keeps ParkingLot lock and pay()'s ParkingTicket lock from F.
Case 2 checks mutable entities touched by multiple facade methods.
parkVehicle() synchronizes on the selected ParkingSlot while occupying it.
unparkVehicle() synchronizes on the same ParkingSlot while validating and vacating it.
unparkVehicle() also synchronizes on the ParkingTicket in G because unparkVehicle() vs pay() is a cross-method ticket lifecycle race.
All datastore maps use ConcurrentHashMap because admin writes can overlap with user/system reads.
ParkingLot.parkingFloorSet and ParkingFloor.parkingSlotSet use CopyOnWriteArraySet for admin add vs slot-assignment iteration.
Main keeps the same-method demo and adds a shared-entity demo with parkVehicle() and unparkVehicle() touching the same slot.
```

### Case-2 Report

For each entity/aggregate from the updated list:

- `parkingLotMap`: `[addParkingLot]`
- `parkingFloorMap`: `[addParkingFloor]`
- `parkingSlotMap`: `[addParkingSlot]`
- `vehicleMap`: `[parkVehicle, unparkVehicle]`
- `parkingTicketMap`: `[parkVehicle]`
- `ParkingLot`: `[addParkingFloor, findAvailableSlot, parkVehicle]`; fields updated: `[parkingFloorSet]`
- `ParkingFloor`: `[addParkingSlot, findAvailableSlot, parkVehicle]`; fields updated: `[parkingSlotSet]`
- `ParkingSlot`: `[parkVehicle, unparkVehicle]`; fields updated: `[slotStatus, vehicleId]`
- `ParkingTicket`: `[unparkVehicle, pay]`; fields updated: `[exitTime, amount, ticketStatus]`
- `Payment`: `[pay]`; fields updated: `[status]`

For each shared entity, what coordination is required, and where is that coordination applied?

#### `ParkingLot`

**Facade methods:** `[addParkingFloor, findAvailableSlot, parkVehicle]`  
**Fields updated:** `[parkingFloorSet]`

**Problem:**
`addParkingFloor()` adds to `ParkingLot.parkingFloorSet` while `findAvailableSlot()` and `parkVehicle()` can iterate it through `getParkingSlots()`.

**Solution:**
Use `CopyOnWriteArraySet` for `ParkingLot.parkingFloorSet`.
No ParkingLot object lock is needed for parent-id iteration safety, though `parkVehicle()` still uses the ParkingLot lock for slot assignment.

#### `ParkingFloor`

**Facade methods:** `[addParkingSlot, findAvailableSlot, parkVehicle]`  
**Fields updated:** `[parkingSlotSet]`

**Problem:**
`addParkingSlot()` adds to `ParkingFloor.parkingSlotSet` while slot assignment can iterate it.

**Solution:**
Use `CopyOnWriteArraySet` for `ParkingFloor.parkingSlotSet`.

#### `ParkingSlot`

**Facade methods:** `[parkVehicle, unparkVehicle]`  
**Fields updated:** `[slotStatus, vehicleId]`

**Problem:**
`parkVehicle()` occupies a slot while `unparkVehicle()` can vacate the same slot.
F_Concurrency1 handles same-method parking through the ParkingLot lock, but it does not coordinate these two different methods on the same slot object.
The concrete harm is a mixed slot state because `ParkingSlot` owns two fields that must change together: `slotStatus` and `vehicleId`.
Without a shared slot lock, `unparkVehicle()` can start `vacate()` and set `slotStatus = AVAILABLE`; then `parkVehicle()` can observe the slot as available and run `occupy(newVehicleId)`, setting `slotStatus = OCCUPIED` and `vehicleId = newVehicleId`; then the first `vacate()` can resume and set `vehicleId = null`.
That leaves an invalid final state: `slotStatus = OCCUPIED` with `vehicleId = null`.

**Solution:**
Use the `ParkingSlot` object as the lock target for slot state transitions.
`parkVehicle()` synchronizes on the selected `ParkingSlot` while calling `occupy()`.
`unparkVehicle()` synchronizes on the same `ParkingSlot` while calling slot precheck and `vacate()`.

#### `ParkingTicket`

**Facade methods:** `[unparkVehicle, pay]`  
**Fields updated:** `[exitTime, amount, ticketStatus]`

**Problem:**
`unparkVehicle()` moves a ticket to payment-pending, and `pay()` closes that same ticket.

**Solution:**
G synchronizes `unparkVehicle()` on the `ParkingTicket`.
`pay()` already synchronizes on the same `ParkingTicket` from F.
That shared ticket lock serializes the cross-method lifecycle transition.

#### `Payment`

**Facade methods:** `[pay]`  
**Fields updated:** `[status]`

**Problem:**
Only `pay()` mutates payment status.

**Solution:**
No separate Payment lock is needed.
Payment processing runs inside the ticket workflow lock.

#### Datastore maps

**Problem:**
F_Concurrency1 intentionally does not handle user/system reads overlapping admin writes.
`findAvailableSlot()` and `parkVehicle()` read parking lot, floor, and slot maps while admin methods can add to those maps.

**Solution:**
Use `ConcurrentHashMap` for all datastore maps in `G_Concurrency2`.
Keep admin add workflows unlocked because duplicate same-id creation overwrites the same map key, and assigning the same global floor/slot id to different parents is outside this package's responsibility.
ConcurrentHashMap does not protect mutable entities stored inside the maps.

Cross-method race conditions solved:

```text
Before G_Concurrency2:
F_Concurrency1 handled parkVehicle() vs parkVehicle(), pay() vs pay(), and same-method admin map/parent-set structure races.
It intentionally skipped duplicate unparkVehicle() and admin workflow locking as harmless or outside this package's data-quality boundary.
It did not handle admin-write/user-read collection overlap, parkVehicle() vs unparkVehicle() on the same ParkingSlot, or unparkVehicle() vs pay() on the same ParkingTicket.

Race 1: addParkingFloor()/addParkingSlot() vs findAvailableSlot()/parkVehicle()
Admin methods add parent ids while slot-assignment code iterates them.
G_Concurrency2 uses CopyOnWriteArraySet for ParkingLot.parkingFloorSet and ParkingFloor.parkingSlotSet.
All datastore maps use ConcurrentHashMap for map-structure safety during read/write overlap.

Race 2: parkVehicle() vs unparkVehicle()
One method occupies a ParkingSlot while the other vacates it.
G_Concurrency2 synchronizes the slot transition on the ParkingSlot object in both workflows.

Race 3: unparkVehicle() vs pay()
pay() can read/check ticket amount while unparkVehicle() is moving the ticket from ACTIVE to PAYMENT_PENDING and setting the amount.
G_Concurrency2 synchronizes unparkVehicle() and pay() on the same ParkingTicket.
```

Concurrency decisions:

```text
1. Which cross-method races exist?
addParkingFloor()/addParkingSlot() can overlap with slot-assignment reads.
parkVehicle() can overlap with unparkVehicle() on the same ParkingSlot.
unparkVehicle() can overlap with pay() on the same ParkingTicket.

2. Which entity/aggregate should be the lock owner?
ParkingSlot owns slotStatus and vehicleId, so it is the lock target for slot state transitions.
ParkingTicket remains the lock target for ticket lifecycle transitions.
ParkingLot remains the aggregate lock for same-method parking slot assignment.

3. Whether locks should be object-level, aggregate-level, or lock-manager-level?
G uses object-level locking on ParkingSlot for park-vs-unpark.
It uses object-level locking on ParkingTicket for unpark-vs-pay.
It keeps aggregate-level locking on ParkingLot from F for parking assignment.
No datastore-level lock is added.

4. Which collections need concurrent structures because reads and writes can overlap across methods?
All datastore maps use ConcurrentHashMap.
ParkingLot.parkingFloorSet and ParkingFloor.parkingSlotSet use CopyOnWriteArraySet.
No concurrent collection is used for ParkingSlot or ParkingTicket internals because those are protected by object locks.

5. Which methods/entities still do not need concurrency handling and why?
Payment has no cross-method updater.
Payment strategies and fee strategies are stateless.
findAvailableSlot() remains lock-free as a read method; collection structure safety comes from ConcurrentHashMap and CopyOnWriteArraySet.
Duplicate admin creation remains intentionally unlocked; same-parent duplicate ids collapse through sets, and same global ids across different parents are treated as invalid caller input outside this package.
```

Best for:

- Showing how `G_Concurrency2` builds directly on `F_Concurrency1`.
- Handling the real shared-slot race without locking the whole datastore.
- Making admin-write/user-read collection structure safe.
- Preserving the existing facade workflow shape.

Tradeoff:

- `CopyOnWriteArraySet` is suitable for this demo because admin additions are infrequent compared with parking reads.
- `findAvailableSlot()` is still a best-effort read; the final state remains protected by the slot transition lock and model validation.

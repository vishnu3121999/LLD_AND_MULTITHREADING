# Approach Comparison

## Existing Packages

`A_basic` demonstrates the first runnable Parking Lot design with parking lots, floors, slots, vehicles, tickets, parking, unparking, and a simple in-facade fee calculation.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- The system supports one or more parking lots.
- A parking lot has parking floors.
- A parking floor has parking slots.
- Slots have types such as COMPACT, BIKE, and LARGE.
- Vehicles have types such as CAR, BIKE, and TRUCK.

Action based points:
- Admin adds parking lots, floors, and slots.
- User parks a vehicle and receives a parking ticket.
- User unparks a vehicle using the parking ticket.
- System finds an available slot and calculates the parking amount.

Misc:
- A_basic assumes valid setup and available slots.
- Duplicate slots, unavailable parking, invalid tickets, and payment handling are intentionally deferred.

#### Common Misc

Offline or online:
- Treat this as an online/API-style system because multiple parking lots and tickets are stored independently.

Extensibility:
- Slot assignment can become Strategy later.
- Pricing can become Strategy later.
- SlotType and VehicleType are enums because A_basic only needs labels.

History and undo:
- Not needed for A_basic.

Notifications:
- Not needed for A_basic.

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
- addParkingLot(Admin) -> create ParkingLot(System) -> putParkingLot(DataStore)
- addParkingFloor(Admin) -> create ParkingFloor(System) -> putParkingFloor(DataStore) -> add floor id to ParkingLot(System)
- addParkingSlot(Admin) -> create ParkingSlot(System) -> putParkingSlot(DataStore) -> add slot id to ParkingFloor(System)
- parkVehicle(User) -> create Vehicle(System) -> findAvailableSlot(System) -> occupy ParkingSlot(System) -> create ParkingTicket(System)
- unparkVehicle(User) -> get ParkingTicket(System) -> vacate ParkingSlot(System) -> calculateAmount(System) -> close ticket(System)

### Class Diagram

Layers:
- `Main` creates IDs and calls the facade.
- `ParkingLotFacade` owns user/admin/system workflows.
- `DataStore` and `InMemoryDataStore` store maps only.
- Models own only their simple state changes.

Core entities:
- `ParkingLot(parkingLotId, name, parkingFloorList)` stores floor IDs.
- `ParkingFloor(parkingFloorId, name, parkingSlotList)` stores slot IDs.
- `ParkingSlot(parkingSlotId, number, slotType, slotStatus, vehicleId)` owns occupy/vacate state.
- `Vehicle(vehicleId, registrationNumber, vehicleType)` represents the parked vehicle.
- `ParkingTicket(parkingTicketId, vehicleId, parkingSlotId, entryTime, exitTime, amount, ticketStatus)` connects vehicle and slot for one parking session.

Method placement:
- `parkVehicle` and `unparkVehicle` belong in the facade because they coordinate multiple entities.
- `findAvailableSlot` is a facade system method in A_basic; Strategy comes later.
- `parkVehicle` and `vacate` belong in `ParkingSlot` because they only mutate slot state.
- `close` belongs in `ParkingTicket` because it only mutates ticket state.

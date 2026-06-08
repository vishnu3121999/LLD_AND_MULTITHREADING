# Approach Comparison

## Existing Packages

`A_basic` demonstrates riders, drivers, vehicles, city-level driver registration, nearest-driver assignment, ride completion, and simple fare calculation.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- The system supports cities.
- A city has riders and drivers.
- A driver has one vehicle and a current location.
- A ride connects rider, driver, pickup location, and drop location.

Action based points:
- Admin adds cities, riders, vehicles, and drivers.
- User requests a ride from pickup to drop.
- User completes the ride.
- System finds the nearest available driver and calculates fare.

Misc:
- A_basic assumes at least one available driver.
- Driver matching strategies, pricing strategies, cancellation, payments, and validations are deferred.

#### Common Misc

Offline or online:
- Treat as online because users, drivers, rides, and vehicles are independently stored.

Extensibility:
- Driver assignment and fare calculation can become Strategy later.
- VehicleType is an enum in A_basic.

History and undo:
- Ride history naturally exists through Ride records, but undo is not needed.

Notifications:
- Driver/rider notifications are future concerns.

Exception handling:
- Missing city, unavailable driver, invalid rider, and invalid ride are later validations.

Concurrency:
- Simultaneous requests assigning the same driver are later concurrency concerns.

### UseCase Diagram

Actors:
- Rider
- Admin
- System

UseCases:
- addCity(Admin) -> create City(System) -> putCity(DataStore)
- addRider(Admin) -> create Rider(System) -> putRider(DataStore) -> add rider id to City(System)
- addVehicle(Admin) -> create Vehicle(System) -> putVehicle(DataStore)
- addDriver(Admin) -> create Driver(System) -> putDriver(DataStore) -> add driver id to City(System)
- requestRide(Rider) -> findNearestDriver(System) -> assign driver(System) -> calculateFare(System) -> create Ride(System)
- completeRide(Rider) -> complete Ride(System) -> mark Driver available(System)

### Class Diagram

Layers:
- `Main` creates IDs and runs the ride flow.
- `UberFacade` owns registration, assignment, and ride completion.
- `DataStore` stores maps only.
- Models own simple state such as driver availability and ride status.

Core entities:
- `City(cityId, name, riderList, driverList)` stores rider and driver IDs.
- `Rider(riderId, name)` represents the passenger.
- `Driver(driverId, name, vehicleId, currentLocation, driverStatus)` owns driver availability.
- `Vehicle(vehicleId, registrationNumber, vehicleType)` stores vehicle metadata.
- `Ride(rideId, riderId, driverId, pickupLocation, dropLocation, rideStatus, fare)` stores one ride.
- `Location(latitude, longitude)` owns simple distance calculation.

Method placement:
- `requestRide` belongs in the facade because it coordinates driver search, fare, driver state, and ride creation.
- `findNearestDriver` is a system method in the facade for A_basic; Strategy comes later.
- `assignRide` and `completeRide` belong in `Driver` because they mutate only driver state.
- `complete` belongs in `Ride` because it mutates only ride status.

# Approach Comparison

## Existing Packages

`A_basic` demonstrates the first runnable Uber-like cab booking design with riders, drivers, cabs, locations, fare estimates, bookings, OTP-based ride start, and ride completion.

Later packages can add validation, exception handling, assignment strategies, pricing strategies, notifications, payment handling, persistence, and concurrency-safe booking acceptance.

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
- `Booking(bookingId, riderId, pickupLocation, destinationLocation, bookingTime, fare, otp, driverId, bookingStatus)` represents one ride lifecycle.

Enums:
- `VehicleType`: `SEDAN`, `GO`, `AUTO`, `BIKE`.
- `BookingStatus`: `RIDE_REQUESTED`, `DRIVER_ASSIGNED`, `RIDE_STARTED`, `RIDE_COMPLETED`.

Method placement:
- `UberFacade.showFareEstimates` belongs in the facade because it coordinates cab lookup and fare calculation.
- `UberFacade.bookRide` belongs in the facade because it creates the system booking and stores it.
- `UberFacade.getNearbyDrivers` belongs in the facade because it maps available cabs to drivers.
- `UberFacade.acceptRide`, `startRide`, and `endRide` belong in the facade because they coordinate booking, driver, cab, and rider state.
- `Booking.assignDriver`, `startRide`, and `completeRide` belong in `Booking` because they mutate booking-owned state.
- `Cab.markUnavailable`, `markAvailable`, and `updateLocation` belong in `Cab` because they mutate cab-owned state.
- `DataStore` methods only get, put, contains, remove, and list entities; no business logic belongs in datastore.

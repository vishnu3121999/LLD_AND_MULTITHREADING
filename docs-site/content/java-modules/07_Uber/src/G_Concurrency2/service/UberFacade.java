package G_Concurrency2.service;

import G_Concurrency2.datastore.DataStore;
import G_Concurrency2.model.Booking;
import G_Concurrency2.model.Cab;
import G_Concurrency2.model.Driver;
import G_Concurrency2.model.FareEstimate;
import G_Concurrency2.model.Location;
import G_Concurrency2.model.Rider;
import G_Concurrency2.model.enums.BookingStatus;
import G_Concurrency2.model.enums.VehicleType;
import G_Concurrency2.observer.DriverNotificationObserver;
import G_Concurrency2.strategy.driver.DriverMatchingStrategy;
import G_Concurrency2.strategy.driver.NearestDriverMatchingStrategy;
import G_Concurrency2.strategy.fare.BaseFareStrategy;
import G_Concurrency2.strategy.fare.FareStrategy;
import G_Concurrency2.strategy.fare.SurgeFareStrategy;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.ThreadLocalRandom;

public class UberFacade {
    private static final double NEARBY_DISTANCE = 5.0;

    private final DataStore dataStore;
    private final DriverMatchingStrategy driverMatchingStrategy;
    private final FareStrategy fareStrategy;
    private final Set<DriverNotificationObserver> driverNotificationObserverSet;

    public UberFacade(DataStore dataStore) {
        this(dataStore, new NearestDriverMatchingStrategy(NEARBY_DISTANCE),
                new SurgeFareStrategy(new BaseFareStrategy()));
    }

    public UberFacade(DataStore dataStore, DriverMatchingStrategy driverMatchingStrategy, FareStrategy fareStrategy) {
        this.dataStore = dataStore;
        this.driverMatchingStrategy = driverMatchingStrategy;
        this.fareStrategy = fareStrategy;
        this.driverNotificationObserverSet = new CopyOnWriteArraySet<>();
    }

    // User methods

    public void updateRiderLocation(String riderId, Location currentLocation) {
        Rider rider = dataStore.getRider(riderId);
        rider.updateLocation(currentLocation);
    }

    public List<FareEstimate> showFareEstimates(Location pickupLocation, Location destinationLocation) {
        List<FareEstimate> fareEstimateList = new ArrayList<>();
        for (VehicleType vehicleType : VehicleType.values()) {
            if (hasNearbyCab(pickupLocation, vehicleType)) {
                double fare = calculateFare(pickupLocation, destinationLocation, vehicleType);
                fareEstimateList.add(new FareEstimate(vehicleType, fare));
            }
        }
        return fareEstimateList;
    }

    public Booking bookRide(String riderId, Location destinationLocation, VehicleType vehicleType) {
        Rider rider = dataStore.getRider(riderId);
        Location pickupLocation = rider.getCurrentLocation();
        if (findNearbyDrivers(pickupLocation, vehicleType).isEmpty()) {
            throw new RuntimeException("No nearby driver found for vehicle type: " + vehicleType);
        }
        double fare = calculateFare(pickupLocation, destinationLocation, vehicleType);
        String bookingId = createBookingId();
        Booking booking = new Booking(bookingId, riderId, pickupLocation, destinationLocation,
                vehicleType, LocalDateTime.now(), fare, generateOtp(), null, BookingStatus.RIDE_REQUESTED);
        dataStore.putBooking(booking.getBookingId(), booking);
        notifyDrivers(booking.getBookingId());
        return booking;
    }

    public List<Driver> getNearbyDrivers(String bookingId) {
        Booking booking = dataStore.getBooking(bookingId);
        VehicleType vehicleType = booking.getVehicleType();
        return findNearbyDrivers(booking.getPickupLocation(), vehicleType);
    }

    public void cancel(String bookingId) {
        Booking booking = dataStore.getBooking(bookingId);
        synchronized (booking) {
            Cab cab = null;
            if (booking.getDriverId() != null) {
                Driver driver = dataStore.getDriver(booking.getDriverId());
                cab = dataStore.getCab(driver.getCabId());
            }
            if (cab != null) {
                booking.cancel();
                cab.markAvailable();
            } else {
                booking.cancel();
            }
        }
    }

    public void acceptRide(String bookingId, String driverId) {
        Booking booking = dataStore.getBooking(bookingId);
        Driver driver = dataStore.getDriver(driverId);
        Cab cab = dataStore.getCab(driver.getCabId());
        VehicleType vehicleType = booking.getVehicleType();
        if (vehicleType != null && cab.getVehicleType() != vehicleType) {
            throw new RuntimeException("Driver cab does not match requested vehicle type");
        }
        synchronized (booking) {
            booking.validateCanAssignDriver();
            cab.validateCanMarkUnavailable();
            booking.assignDriver(driver.getDriverId());
            cab.markUnavailable();
        }
    }

    public boolean startRide(String bookingId, String driverId, String otp) {
        Booking booking = dataStore.getBooking(bookingId);
        synchronized (booking) {
            if (!isAssignedDriver(booking, driverId)) {
                throw new RuntimeException("Driver is not assigned to booking: " + bookingId);
            }
            boolean otpVerified = booking.isOtpMatching(otp);
            if (!otpVerified) {
                throw new RuntimeException("Invalid OTP for booking: " + bookingId);
            }
            booking.startRide();
            return booking.getBookingStatus() == BookingStatus.RIDE_STARTED;
        }
    }

    public void endRide(String bookingId, String driverId) {
        Booking booking = dataStore.getBooking(bookingId);
        Driver driver = dataStore.getDriver(driverId);
        synchronized (booking) {
            if (!isAssignedDriver(booking, driverId)) {
                throw new RuntimeException("Driver is not assigned to booking: " + bookingId);
            }
            Cab cab = dataStore.getCab(driver.getCabId());
            Rider rider = dataStore.getRider(booking.getRiderId());
            booking.validateCanCompleteRide();
            cab.validateCanMarkAvailable();
            booking.completeRide();
            cab.updateLocation(booking.getDestinationLocation());
            cab.markAvailable();
            rider.updateLocation(booking.getDestinationLocation());
        }
    }

    public void addDriverNotificationObserver(DriverNotificationObserver observer) {
        if (observer != null) {
            driverNotificationObserverSet.add(observer);
        }
    }

    public void removeDriverNotificationObserver(DriverNotificationObserver observer) {
        driverNotificationObserverSet.remove(observer);
    }

    // System methods

    public double calculateFare(Location pickupLocation, Location destinationLocation, VehicleType vehicleType) {
        return fareStrategy.calculateFare(pickupLocation, destinationLocation, vehicleType,
                countActiveBookings(vehicleType), countNearbyCabs(pickupLocation, vehicleType));
    }

    public List<Driver> findNearbyDrivers(Location pickupLocation, VehicleType vehicleType) {
        return driverMatchingStrategy.findDrivers(pickupLocation, vehicleType, dataStore);
    }

    public void notifyDrivers(String bookingId) {
        Booking booking = dataStore.getBooking(bookingId);
        for (Driver driver : getNearbyDrivers(bookingId)) {
            for (DriverNotificationObserver observer : driverNotificationObserverSet) {
                observer.onRideRequested(booking, driver);
            }
        }
    }

    // Admin methods

    public void addRider(String riderId, String name, Location currentLocation) {
        if (dataStore.containsRider(riderId)) {
            throw new RuntimeException("Rider already exists: " + riderId);
        }
        Rider rider = new Rider(riderId, name, currentLocation);
        dataStore.putRider(rider.getRiderId(), rider);
    }

    public void addCab(String cabId, VehicleType vehicleType, String registrationNumber, Location currentLocation) {
        if (dataStore.containsCab(cabId)) {
            throw new RuntimeException("Cab already exists: " + cabId);
        }
        Cab cab = new Cab(cabId, vehicleType, registrationNumber, currentLocation);
        dataStore.putCab(cab.getCabId(), cab);
    }

    public void addDriver(String driverId, String name, String cabId) {
        if (dataStore.containsDriver(driverId)) {
            throw new RuntimeException("Driver already exists: " + driverId);
        }
        Driver driver = new Driver(driverId, name, cabId);
        dataStore.putDriver(driver.getDriverId(), driver);
    }

    // Util/helper methods

    private boolean hasNearbyCab(Location pickupLocation, VehicleType vehicleType) {
        return countNearbyCabs(pickupLocation, vehicleType) > 0;
    }

    private int countNearbyCabs(Location pickupLocation, VehicleType vehicleType) {
        int count = 0;
        for (Cab cab : dataStore.getCabList()) {
            if (cab.getVehicleType() == vehicleType
                    && cab.isAvailable()
                    && cab.getCurrentLocation().distanceTo(pickupLocation) <= NEARBY_DISTANCE) {
                count++;
            }
        }
        return count;
    }

    private int countActiveBookings(VehicleType vehicleType) {
        int activeBookingCount = 0;
        for (Booking booking : dataStore.getBookingList()) {
            VehicleType bookingVehicleType = booking.getVehicleType();
            if (bookingVehicleType == vehicleType
                    && booking.getBookingStatus() != BookingStatus.RIDE_COMPLETED
                    && booking.getBookingStatus() != BookingStatus.RIDE_CANCELLED) {
                activeBookingCount++;
            }
        }
        return activeBookingCount;
    }

    private boolean isAssignedDriver(Booking booking, String driverId) {
        return booking.getDriverId() != null && booking.getDriverId().equals(driverId);
    }

    private String createBookingId() {
        return "booking-" + UUID.randomUUID();
    }

    private String generateOtp() {
        return String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
    }
}

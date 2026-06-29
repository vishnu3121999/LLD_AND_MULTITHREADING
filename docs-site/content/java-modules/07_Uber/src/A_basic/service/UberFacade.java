package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Booking;
import A_basic.model.Cab;
import A_basic.model.Driver;
import A_basic.model.FareEstimate;
import A_basic.model.Location;
import A_basic.model.Rider;
import A_basic.model.enums.BookingStatus;
import A_basic.model.enums.VehicleType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

public class UberFacade {
    private static final double NEARBY_DISTANCE = 5.0;

    private final DataStore dataStore;

    public UberFacade(DataStore dataStore) {
        this.dataStore = dataStore;
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
        booking.cancel();
        if (booking.getDriverId() != null) {
            Driver driver = dataStore.getDriver(booking.getDriverId());
            dataStore.getCab(driver.getCabId()).markAvailable();
        }
    }

    public void acceptRide(String bookingId, String driverId) {
        Booking booking = dataStore.getBooking(bookingId);
        Driver driver = dataStore.getDriver(driverId);
        Cab cab = dataStore.getCab(driver.getCabId());
        booking.assignDriver(driver.getDriverId());
        cab.markUnavailable();
    }

    public boolean startRide(String bookingId, String driverId, String otp) {
        Booking booking = dataStore.getBooking(bookingId);
        boolean otpVerified = booking.isOtpMatching(otp);
        if (otpVerified) {
            booking.startRide();
        }
        return booking.getBookingStatus() == BookingStatus.RIDE_STARTED;
    }

    public void endRide(String bookingId, String driverId) {
        Booking booking = dataStore.getBooking(bookingId);
        booking.completeRide();
        Driver driver = dataStore.getDriver(booking.getDriverId());
        Cab cab = dataStore.getCab(driver.getCabId());
        cab.updateLocation(booking.getDestinationLocation());
        cab.markAvailable();
        dataStore.getRider(booking.getRiderId()).updateLocation(booking.getDestinationLocation());
    }

    // System methods

    public double calculateFare(Location pickupLocation, Location destinationLocation, VehicleType vehicleType) {
        double distance = pickupLocation.distanceTo(destinationLocation);
        double fare = distance * ratePerDistance(vehicleType) * surgeMultiplier(pickupLocation, vehicleType);
        return Math.round(fare * 100.0) / 100.0;
    }

    public List<Driver> findNearbyDrivers(Location pickupLocation, VehicleType vehicleType) {
        List<Driver> driverList = new ArrayList<>();
        for (Cab cab : dataStore.getCabList()) {
            if (cab.getVehicleType() == vehicleType
                    && cab.isAvailable()
                    && cab.getCurrentLocation().distanceTo(pickupLocation) <= NEARBY_DISTANCE) {
                driverList.add(findDriverByCab(cab.getCabId()));
            }
        }
        return driverList;
    }

    public void notifyDrivers(String bookingId) {
    }

    // Admin methods

    public void addRider(String riderId, String name, Location currentLocation) {
        Rider rider = new Rider(riderId, name, currentLocation);
        dataStore.putRider(rider.getRiderId(), rider);
    }

    public void addCab(String cabId, VehicleType vehicleType, String registrationNumber, Location currentLocation) {
        Cab cab = new Cab(cabId, vehicleType, registrationNumber, currentLocation);
        dataStore.putCab(cab.getCabId(), cab);
    }

    public void addDriver(String driverId, String name, String cabId) {
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

    private double surgeMultiplier(Location pickupLocation, VehicleType vehicleType) {
        int activeBookingCount = 0;
        for (Booking booking : dataStore.getBookingList()) {
            VehicleType bookingVehicleType = booking.getVehicleType();
            if (bookingVehicleType == vehicleType
                    && booking.getBookingStatus() != BookingStatus.RIDE_COMPLETED
                    && booking.getBookingStatus() != BookingStatus.RIDE_CANCELLED) {
                activeBookingCount++;
            }
        }
        int nearbyCabCount = countNearbyCabs(pickupLocation, vehicleType);
        if (activeBookingCount >= nearbyCabCount) {
            return 1.5;
        }
        return 1.0;
    }

    private Driver findDriverByCab(String cabId) {
        for (Driver driver : dataStore.getDriverList()) {
            if (driver.getCabId().equals(cabId)) {
                return driver;
            }
        }
        return null;
    }

    private double ratePerDistance(VehicleType vehicleType) {
        if (vehicleType == VehicleType.BIKE) {
            return 8.0;
        }
        if (vehicleType == VehicleType.AUTO) {
            return 10.0;
        }
        if (vehicleType == VehicleType.GO) {
            return 12.0;
        }
        return 16.0;
    }

    private String createBookingId() {
        return "booking-" + UUID.randomUUID();
    }

    private String generateOtp() {
        return String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
    }
}

package G_Concurrency2.model;

import G_Concurrency2.model.enums.BookingStatus;
import G_Concurrency2.model.enums.VehicleType;

import java.time.LocalDateTime;

public class Booking {
    private final String bookingId;
    private final String riderId;
    private final Location pickupLocation;
    private final Location destinationLocation;
    private final VehicleType vehicleType;
    private final LocalDateTime bookingTime;
    private final double fare;
    private final String otp;
    private String driverId;
    private BookingStatus bookingStatus;

    public Booking(String bookingId, String riderId, Location pickupLocation, Location destinationLocation,
                   VehicleType vehicleType, LocalDateTime bookingTime, double fare, String otp, String driverId,
                   BookingStatus bookingStatus) {
        this.bookingId = bookingId;
        this.riderId = riderId;
        this.pickupLocation = pickupLocation;
        this.destinationLocation = destinationLocation;
        this.vehicleType = vehicleType;
        this.bookingTime = bookingTime;
        this.fare = fare;
        this.otp = otp;
        this.driverId = driverId;
        this.bookingStatus = bookingStatus;
    }

    public void assignDriver(String driverId) {
        validateCanAssignDriver();
        this.driverId = driverId;
        this.bookingStatus = BookingStatus.DRIVER_ASSIGNED;
    }

    public void validateCanAssignDriver() {
        if (bookingStatus != BookingStatus.RIDE_REQUESTED) {
            throw new IllegalStateException("Driver can only be assigned from RIDE_REQUESTED state: " + bookingId);
        }
    }

    public boolean isOtpMatching(String otp) {
        return this.otp.equals(otp);
    }

    public void startRide() {
        if (bookingStatus != BookingStatus.DRIVER_ASSIGNED) {
            throw new IllegalStateException("Ride can only start from DRIVER_ASSIGNED state: " + bookingId);
        }
        this.bookingStatus = BookingStatus.RIDE_STARTED;
    }

    public void completeRide() {
        validateCanCompleteRide();
        this.bookingStatus = BookingStatus.RIDE_COMPLETED;
    }

    public void validateCanCompleteRide() {
        if (bookingStatus != BookingStatus.RIDE_STARTED) {
            throw new IllegalStateException("Ride can only complete from RIDE_STARTED state: " + bookingId);
        }
    }

    public void cancel() {
        if (bookingStatus != BookingStatus.RIDE_REQUESTED && bookingStatus != BookingStatus.DRIVER_ASSIGNED) {
            throw new IllegalStateException("Ride can only be cancelled before it starts: " + bookingId);
        }
        this.bookingStatus = BookingStatus.RIDE_CANCELLED;
    }

    public String getBookingId() {
        return bookingId;
    }

    public String getRiderId() {
        return riderId;
    }

    public Location getPickupLocation() {
        return pickupLocation;
    }

    public Location getDestinationLocation() {
        return destinationLocation;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }

    public double getFare() {
        return fare;
    }

    public String getOtp() {
        return otp;
    }

    public String getDriverId() {
        return driverId;
    }

    public BookingStatus getBookingStatus() {
        return bookingStatus;
    }

    @Override
    public String toString() {
        return "Booking{" +
                "bookingId='" + bookingId + '\'' +
                ", riderId='" + riderId + '\'' +
                ", pickupLocation=" + pickupLocation +
                ", destinationLocation=" + destinationLocation +
                ", vehicleType=" + vehicleType +
                ", bookingTime=" + bookingTime +
                ", fare=" + fare +
                ", otp='" + otp + '\'' +
                ", driverId='" + driverId + '\'' +
                ", bookingStatus=" + bookingStatus +
                '}';
    }
}

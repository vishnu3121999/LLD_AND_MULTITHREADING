package B_Strategy.model;

import B_Strategy.model.enums.BookingStatus;
import B_Strategy.model.enums.VehicleType;

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
        this.driverId = driverId;
        this.bookingStatus = BookingStatus.DRIVER_ASSIGNED;
    }

    public boolean isOtpMatching(String otp) {
        return this.otp.equals(otp);
    }

    public void startRide() {
        this.bookingStatus = BookingStatus.RIDE_STARTED;
    }

    public void completeRide() {
        this.bookingStatus = BookingStatus.RIDE_COMPLETED;
    }

    public void cancel() {
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

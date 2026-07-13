package model;

import model.enums.BookingStatus;

public class Booking {
    String id;
    String riderId;
    String vehicleId;
    Location src;
    Location dest;
    BookingStatus bookingStatus;
    double fare;
    int otp;
    int failedOTPAttempts;

    public Booking(int otp, String id, String riderId, String vehicleId, Location src, Location dest, BookingStatus bookingStatus, double fare) {
        this.otp = otp;
        this.id = id;
        this.riderId = riderId;
        this.vehicleId = vehicleId;
        this.src = src;
        this.dest = dest;
        this.bookingStatus = bookingStatus;
        this.fare = fare;
    }

    public int getFailedOTPAttempts() {
        return failedOTPAttempts;
    }

    public void setFailedOTPAttempts(int failedOTPAttempts) {
        this.failedOTPAttempts = failedOTPAttempts;
    }

    public int getOtp() {
        return otp;
    }

    public void setOtp(int otp) {
        this.otp = otp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRiderId() {
        return riderId;
    }

    public void setRiderId(String riderId) {
        this.riderId = riderId;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Location getSrc() {
        return src;
    }

    public void setSrc(Location src) {
        this.src = src;
    }

    public Location getDest() {
        return dest;
    }

    public void setDest(Location dest) {
        this.dest = dest;
    }

    public BookingStatus getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(BookingStatus bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public double getFare() {
        return fare;
    }

    public void setFare(double fare) {
        this.fare = fare;
    }
}

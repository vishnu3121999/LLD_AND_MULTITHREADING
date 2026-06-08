package A_basic.model;

import A_basic.model.enums.RideStatus;

public class Ride {
    private final String rideId;
    private final String riderId;
    private final String driverId;
    private final Location pickupLocation;
    private final Location dropLocation;
    private RideStatus rideStatus;
    private final double fare;

    public Ride(String rideId, String riderId, String driverId, Location pickupLocation, Location dropLocation, double fare) {
        this.rideId = rideId;
        this.riderId = riderId;
        this.driverId = driverId;
        this.pickupLocation = pickupLocation;
        this.dropLocation = dropLocation;
        this.fare = fare;
        this.rideStatus = RideStatus.ACCEPTED;
    }

    public void complete() { rideStatus = RideStatus.COMPLETED; }
    @Override public String toString() { return "Ride{" + "rideId='" + rideId + "'" + ", riderId='" + riderId + "'" + ", driverId='" + driverId + "'" + ", pickupLocation=" + pickupLocation + ", dropLocation=" + dropLocation + ", rideStatus=" + rideStatus + ", fare=" + fare + '}'; }
    public String getRideId() { return rideId; }
    public String getRiderId() { return riderId; }
    public String getDriverId() { return driverId; }
    public Location getDropLocation() { return dropLocation; }
    public RideStatus getRideStatus() { return rideStatus; }
    public double getFare() { return fare; }
}

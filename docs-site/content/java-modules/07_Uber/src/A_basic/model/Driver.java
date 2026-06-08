package A_basic.model;

import A_basic.model.enums.DriverStatus;

public class Driver {
    private final String driverId;
    private final String name;
    private final String vehicleId;
    private Location currentLocation;
    private DriverStatus driverStatus;

    public Driver(String driverId, String name, String vehicleId, Location currentLocation) {
        this.driverId = driverId;
        this.name = name;
        this.vehicleId = vehicleId;
        this.currentLocation = currentLocation;
        this.driverStatus = DriverStatus.AVAILABLE;
    }

    public void assignRide() { driverStatus = DriverStatus.ON_RIDE; }
    public void completeRide(Location location) { currentLocation = location; driverStatus = DriverStatus.AVAILABLE; }
    @Override public String toString() { return "Driver{" + "driverId='" + driverId + "'" + ", name='" + name + "'" + ", vehicleId='" + vehicleId + "'" + ", currentLocation=" + currentLocation + ", driverStatus=" + driverStatus + '}'; }
    public String getDriverId() { return driverId; }
    public String getName() { return name; }
    public String getVehicleId() { return vehicleId; }
    public Location getCurrentLocation() { return currentLocation; }
    public DriverStatus getDriverStatus() { return driverStatus; }
}

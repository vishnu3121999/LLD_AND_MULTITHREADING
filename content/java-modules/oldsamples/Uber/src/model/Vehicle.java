package model;

import model.enums.VehicleType;

public class Vehicle {
    String id;
    String driverName;
    VehicleType vehicleType;
    Location location;
    boolean isAvailable;

    public Vehicle(String id, String driverName, VehicleType vehicleType, Location location, boolean isAvailable) {
        this.id = id;
        this.driverName = driverName;
        this.vehicleType = vehicleType;
        this.location = location;
        this.isAvailable = isAvailable;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(VehicleType vehicleType) {
        this.vehicleType = vehicleType;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }
}

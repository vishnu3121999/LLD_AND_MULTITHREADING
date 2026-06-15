package model;

import model.enums.VehicleType;

public class VehicleFare {
    VehicleType vehicleType;
    double fare;

    public VehicleFare(VehicleType vehicleType, double fare) {
        this.vehicleType = vehicleType;
        this.fare = fare;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(VehicleType vehicleType) {
        this.vehicleType = vehicleType;
    }

    public double getFare() {
        return fare;
    }

    public void setFare(double fare) {
        this.fare = fare;
    }
}

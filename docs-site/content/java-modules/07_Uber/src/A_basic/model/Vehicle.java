package A_basic.model;

import A_basic.model.enums.VehicleType;

public class Vehicle {
    private final String vehicleId;
    private final String registrationNumber;
    private final VehicleType vehicleType;

    public Vehicle(String vehicleId, String registrationNumber, VehicleType vehicleType) {
        this.vehicleId = vehicleId;
        this.registrationNumber = registrationNumber;
        this.vehicleType = vehicleType;
    }

    @Override public String toString() { return "Vehicle{" + "vehicleId='" + vehicleId + "'" + ", registrationNumber='" + registrationNumber + "'" + ", vehicleType=" + vehicleType + '}'; }
    public String getVehicleId() { return vehicleId; }
    public String getRegistrationNumber() { return registrationNumber; }
    public VehicleType getVehicleType() { return vehicleType; }
}

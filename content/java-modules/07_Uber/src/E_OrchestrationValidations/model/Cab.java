package E_OrchestrationValidations.model;

import E_OrchestrationValidations.model.enums.VehicleType;

public class Cab {
    private final String cabId;
    private final VehicleType vehicleType;
    private final String registrationNumber;
    private Location currentLocation;
    private boolean available;

    public Cab(String cabId, VehicleType vehicleType, String registrationNumber, Location currentLocation) {
        this.cabId = cabId;
        this.vehicleType = vehicleType;
        this.registrationNumber = registrationNumber;
        this.currentLocation = currentLocation;
        this.available = true;
    }

    public void markUnavailable() {
        validateCanMarkUnavailable();
        this.available = false;
    }

    public void validateCanMarkUnavailable() {
        if (!available) {
            throw new IllegalStateException("Cab is already unavailable: " + cabId);
        }
    }

    public void markAvailable() {
        validateCanMarkAvailable();
        this.available = true;
    }

    public void validateCanMarkAvailable() {
        if (available) {
            throw new IllegalStateException("Cab is already available: " + cabId);
        }
    }

    public void updateLocation(Location currentLocation) {
        this.currentLocation = currentLocation;
    }

    public String getCabId() {
        return cabId;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public Location getCurrentLocation() {
        return currentLocation;
    }

    public boolean isAvailable() {
        return available;
    }

    @Override
    public String toString() {
        return "Cab{" +
                "cabId='" + cabId + '\'' +
                ", vehicleType=" + vehicleType +
                ", registrationNumber='" + registrationNumber + '\'' +
                ", currentLocation=" + currentLocation +
                ", available=" + available +
                '}';
    }
}

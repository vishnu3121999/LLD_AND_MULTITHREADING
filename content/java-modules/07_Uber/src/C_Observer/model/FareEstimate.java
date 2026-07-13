package C_Observer.model;

import C_Observer.model.enums.VehicleType;

public class FareEstimate {
    private final VehicleType vehicleType;
    private final double fare;

    public FareEstimate(VehicleType vehicleType, double fare) {
        this.vehicleType = vehicleType;
        this.fare = fare;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public double getFare() {
        return fare;
    }

    @Override
    public String toString() {
        return "FareEstimate{" +
                "vehicleType=" + vehicleType +
                ", fare=" + fare +
                '}';
    }
}

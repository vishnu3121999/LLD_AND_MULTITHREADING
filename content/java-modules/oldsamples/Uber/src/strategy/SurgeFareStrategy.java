package strategy;

import model.Location;
import model.enums.VehicleType;

public class SurgeFareStrategy implements FareStrategy{
    private final int demandCount;

    public SurgeFareStrategy(int demandCount) {
        this.demandCount = demandCount;
    }

    @Override
    public double calculate(Location src, Location dest, VehicleType vehicleType) {
        double baseRatePerKm = switch (vehicleType) {
            case GO -> 8.0;
            case SEDAN -> 10.0;
            case AUTO -> 6.5;
            case BIKE -> 3.5;
        };
        double distance = src.distTo(dest);
        // demandService.getSurgeMultiplier(from, to);
        double surgeMultiplier = 1 + (demandCount / 10.0); // e.g., 10+ riders = 2x fare
        return baseRatePerKm * distance * surgeMultiplier;
    }
}

package strategy;

import model.Location;
import model.enums.VehicleType;

public class BaseFareStrategy implements FareStrategy{

    @Override
    public double calculate(Location src, Location dest, VehicleType vehicleType) {
        double baseRatePerKm = switch (vehicleType) {
            case GO -> 8.0;
            case SEDAN -> 10.0;
            case AUTO -> 6.5;
            case BIKE -> 3.5;
        };
        double distance = src.distTo(dest);
        return baseRatePerKm * distance;
    }
}

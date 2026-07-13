package strategy;

import model.Location;
import model.enums.VehicleType;

public interface FareStrategy {
    double calculate(Location src, Location dest,VehicleType vehicleType);
}

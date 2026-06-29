package B_Strategy.strategy.fare;

import B_Strategy.model.Location;
import B_Strategy.model.enums.VehicleType;

public interface FareStrategy {
    double calculateFare(Location pickupLocation, Location destinationLocation, VehicleType vehicleType,
                         int activeBookingCount, int nearbyCabCount);
}

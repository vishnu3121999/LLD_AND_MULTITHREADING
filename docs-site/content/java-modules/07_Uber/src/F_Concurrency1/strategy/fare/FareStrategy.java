package F_Concurrency1.strategy.fare;

import F_Concurrency1.model.Location;
import F_Concurrency1.model.enums.VehicleType;

public interface FareStrategy {
    double calculateFare(Location pickupLocation, Location destinationLocation, VehicleType vehicleType,
                         int activeBookingCount, int nearbyCabCount);
}

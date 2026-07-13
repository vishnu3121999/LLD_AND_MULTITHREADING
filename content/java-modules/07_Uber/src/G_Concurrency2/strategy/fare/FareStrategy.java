package G_Concurrency2.strategy.fare;

import G_Concurrency2.model.Location;
import G_Concurrency2.model.enums.VehicleType;

public interface FareStrategy {
    double calculateFare(Location pickupLocation, Location destinationLocation, VehicleType vehicleType,
                         int activeBookingCount, int nearbyCabCount);
}

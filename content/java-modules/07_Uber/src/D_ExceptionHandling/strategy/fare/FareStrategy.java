package D_ExceptionHandling.strategy.fare;

import D_ExceptionHandling.model.Location;
import D_ExceptionHandling.model.enums.VehicleType;

public interface FareStrategy {
    double calculateFare(Location pickupLocation, Location destinationLocation, VehicleType vehicleType,
                         int activeBookingCount, int nearbyCabCount);
}

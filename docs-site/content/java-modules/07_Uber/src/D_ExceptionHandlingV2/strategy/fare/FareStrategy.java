package D_ExceptionHandlingV2.strategy.fare;

import D_ExceptionHandlingV2.model.Location;
import D_ExceptionHandlingV2.model.enums.VehicleType;

public interface FareStrategy {
    double calculateFare(Location pickupLocation, Location destinationLocation, VehicleType vehicleType,
                         int activeBookingCount, int nearbyCabCount);
}

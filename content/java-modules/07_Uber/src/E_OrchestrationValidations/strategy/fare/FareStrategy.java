package E_OrchestrationValidations.strategy.fare;

import E_OrchestrationValidations.model.Location;
import E_OrchestrationValidations.model.enums.VehicleType;

public interface FareStrategy {
    double calculateFare(Location pickupLocation, Location destinationLocation, VehicleType vehicleType,
                         int activeBookingCount, int nearbyCabCount);
}

package E_OrchestrationValidations.strategy.fare;

import E_OrchestrationValidations.model.Location;
import E_OrchestrationValidations.model.enums.VehicleType;

public class BaseFareStrategy implements FareStrategy {
    @Override
    public double calculateFare(Location pickupLocation, Location destinationLocation, VehicleType vehicleType,
                                int activeBookingCount, int nearbyCabCount) {
        return pickupLocation.distanceTo(destinationLocation) * ratePerDistance(vehicleType);
    }

    private double ratePerDistance(VehicleType vehicleType) {
        if (vehicleType == VehicleType.BIKE) {
            return 8.0;
        }
        if (vehicleType == VehicleType.AUTO) {
            return 10.0;
        }
        if (vehicleType == VehicleType.GO) {
            return 12.0;
        }
        return 16.0;
    }
}

package E_OrchestrationValidations.observer;

import E_OrchestrationValidations.model.Booking;
import E_OrchestrationValidations.model.Driver;

public interface DriverNotificationObserver {
    void onRideRequested(Booking booking, Driver driver);
}

package C_Observer.observer;

import C_Observer.model.Booking;
import C_Observer.model.Driver;

public interface DriverNotificationObserver {
    void onRideRequested(Booking booking, Driver driver);
}

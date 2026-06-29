package F_Concurrency1.observer;

import F_Concurrency1.model.Booking;
import F_Concurrency1.model.Driver;

import java.util.Objects;

public class WebSocketDriverNotificationObserver implements DriverNotificationObserver {
    private final String channelPrefix;

    public WebSocketDriverNotificationObserver(String channelPrefix) {
        this.channelPrefix = channelPrefix;
    }

    @Override
    public void onRideRequested(Booking booking, Driver driver) {
        System.out.println("WebSocket event published to " + channelPrefix + "/" + driver.getDriverId()
                + " for booking " + booking.getBookingId());
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) {
            return true;
        }
        if (!(object instanceof WebSocketDriverNotificationObserver)) {
            return false;
        }
        WebSocketDriverNotificationObserver that = (WebSocketDriverNotificationObserver) object;
        return Objects.equals(channelPrefix, that.channelPrefix);
    }

    @Override
    public int hashCode() {
        return Objects.hash(channelPrefix);
    }
}

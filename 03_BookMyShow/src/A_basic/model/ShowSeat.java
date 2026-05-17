package A_basic.model;

public class ShowSeat {
    private final Seat seat;
    private final double price;
    private boolean available;

    public ShowSeat(Seat seat, double price) {
        this.seat = seat;
        this.price = price;
        this.available = true;
    }

    public Seat getSeat() {
        return seat;
    }

    public double getPrice() {
        return price;
    }

    public boolean isAvailable() {
        return available;
    }

    public boolean reserve() {
        if (!available) {
            return false;
        }
        available = false;
        return true;
    }

    public void release() {
        available = true;
    }
}

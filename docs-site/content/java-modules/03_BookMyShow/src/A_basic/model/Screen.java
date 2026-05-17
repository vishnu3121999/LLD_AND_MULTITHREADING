package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Screen {
    private final String screenId;
    private final String name;
    private final List<Seat> seats;

    public Screen(String screenId, String name, List<Seat> seats) {
        this.screenId = screenId;
        this.name = name;
        this.seats = Collections.unmodifiableList(new ArrayList<>(seats));
    }

    public String getScreenId() {
        return screenId;
    }

    public String getName() {
        return name;
    }

    public List<Seat> getSeats() {
        return seats;
    }
}

package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Theatre {
    private final String theatreId;
    private final String name;
    private final String city;
    private final List<Screen> screens;

    public Theatre(String theatreId, String name, String city, List<Screen> screens) {
        this.theatreId = theatreId;
        this.name = name;
        this.city = city;
        this.screens = Collections.unmodifiableList(new ArrayList<>(screens));
    }

    public String getTheatreId() {
        return theatreId;
    }

    public String getName() {
        return name;
    }

    public String getCity() {
        return city;
    }

    public List<Screen> getScreens() {
        return screens;
    }
}

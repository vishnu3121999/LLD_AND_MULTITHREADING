package F_Concurrency.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class City {
    private final String cityId;
    private final String name;
    private final List<String> theaterList;

    public City(String cityId, String name) {
        this.cityId = cityId;
        this.name = name;
        this.theaterList = new ArrayList<>();
    }

    public synchronized void addTheater(String theaterId) {
        theaterList.add(theaterId);
    }

    public String getCityId() {
        return cityId;
    }

    public String getName() {
        return name;
    }

    public synchronized List<String> getTheaterList() {
        return Collections.unmodifiableList(new ArrayList<>(theaterList));
    }
}

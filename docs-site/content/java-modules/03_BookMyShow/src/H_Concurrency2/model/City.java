package H_Concurrency2.model;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class City {
    private final String cityId;
    private final String name;
    private final List<String> theaterList;

    public City(String cityId, String name) {
        this.cityId = cityId;
        this.name = name;
        this.theaterList = new CopyOnWriteArrayList<>();
    }

    public void addTheater(String theaterId) {
        theaterList.add(theaterId);
    }

    public String getCityId() {
        return cityId;
    }

    public String getName() {
        return name;
    }

    public List<String> getTheaterList() {
        return Collections.unmodifiableList(theaterList);
    }
}


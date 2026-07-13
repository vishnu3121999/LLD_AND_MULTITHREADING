package D_COR.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Screen {
    private final String screenId;
    private final String name;
    private final List<String> seatList;
    private final List<String> showList;

    public Screen(String screenId, String name) {
        this.screenId = screenId;
        this.name = name;
        this.seatList = new ArrayList<>();
        this.showList = new ArrayList<>();
    }

    public void addSeat(String seatId) {
        seatList.add(seatId);
    }

    public void addShow(String showId) {
        showList.add(showId);
    }

    public String getScreenId() {
        return screenId;
    }

    public String getName() {
        return name;
    }

    public List<String> getSeatList() {
        return Collections.unmodifiableList(seatList);
    }

    public List<String> getShowList() {
        return Collections.unmodifiableList(showList);
    }
}

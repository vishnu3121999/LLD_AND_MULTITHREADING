package F_Concurrency.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Theater {
    private final String theaterId;
    private final String name;
    private final List<String> screenList;

    public Theater(String theaterId, String name) {
        this.theaterId = theaterId;
        this.name = name;
        this.screenList = new ArrayList<>();
    }

    public synchronized void addScreen(String screenId) {
        screenList.add(screenId);
    }

    public String getTheaterId() {
        return theaterId;
    }

    public String getName() {
        return name;
    }

    public synchronized List<String> getScreenList() {
        return Collections.unmodifiableList(new ArrayList<>(screenList));
    }
}

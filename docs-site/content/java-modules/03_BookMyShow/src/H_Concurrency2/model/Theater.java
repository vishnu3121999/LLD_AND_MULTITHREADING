package H_Concurrency2.model;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class Theater {
    private final String theaterId;
    private final String name;
    private final List<String> screenList;

    public Theater(String theaterId, String name) {
        this.theaterId = theaterId;
        this.name = name;
        this.screenList = new CopyOnWriteArrayList<>();
    }

    public void addScreen(String screenId) {
        screenList.add(screenId);
    }

    public String getTheaterId() {
        return theaterId;
    }

    public String getName() {
        return name;
    }

    public List<String> getScreenList() {
        return Collections.unmodifiableList(screenList);
    }
}


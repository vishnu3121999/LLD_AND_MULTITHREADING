package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class LogApplication {
    private final String logApplicationId;
    private final String name;
    private final List<String> appenderList;
    public LogApplication(String logApplicationId, String name) { this.logApplicationId = logApplicationId; this.name = name; this.appenderList = new ArrayList<>(); }
    public void addAppender(String appenderId) { appenderList.add(appenderId); }
    @Override public String toString() { return "LogApplication{" + "logApplicationId='" + logApplicationId + "'" + ", name='" + name + "'" + ", appenderList=" + appenderList + '}'; }
    public String getLogApplicationId() { return logApplicationId; }
    public String getName() { return name; }
    public List<String> getAppenderList() { return Collections.unmodifiableList(appenderList); }
}

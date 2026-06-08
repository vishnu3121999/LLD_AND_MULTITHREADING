package A_basic.model;

import A_basic.model.enums.AppenderType;
import A_basic.model.enums.LogLevel;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Appender {
    private final String appenderId;
    private final AppenderType appenderType;
    private final LogLevel minLevel;
    private final List<String> logEntryList;
    public Appender(String appenderId, AppenderType appenderType, LogLevel minLevel) { this.appenderId = appenderId; this.appenderType = appenderType; this.minLevel = minLevel; this.logEntryList = new ArrayList<>(); }
    public void append(String logEntryId) { logEntryList.add(logEntryId); }
    public boolean accepts(LogLevel logLevel) { return logLevel.ordinal() >= minLevel.ordinal(); }
    @Override public String toString() { return "Appender{" + "appenderId='" + appenderId + "'" + ", appenderType=" + appenderType + ", minLevel=" + minLevel + ", logEntryList=" + logEntryList + '}'; }
    public String getAppenderId() { return appenderId; }
    public AppenderType getAppenderType() { return appenderType; }
    public LogLevel getMinLevel() { return minLevel; }
    public List<String> getLogEntryList() { return Collections.unmodifiableList(logEntryList); }
}

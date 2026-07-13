package A_basic.model;

import A_basic.model.enums.LogLevel;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class LoggerConfig {
    private final String loggerId;
    private final String name;
    private LogLevel minimumLogLevel;
    private final List<String> logSinkList;
    private final List<String> logEventList;

    public LoggerConfig(String loggerId, String name, LogLevel minimumLogLevel) {
        this.loggerId = loggerId;
        this.name = name;
        this.minimumLogLevel = minimumLogLevel;
        this.logSinkList = new ArrayList<>();
        this.logEventList = new ArrayList<>();
    }

    public String getLoggerId() {
        return loggerId;
    }

    public String getName() {
        return name;
    }

    public LogLevel getMinimumLogLevel() {
        return minimumLogLevel;
    }

    public void updateMinimumLogLevel(LogLevel minimumLogLevel) {
        this.minimumLogLevel = minimumLogLevel;
    }

    public void addLogSink(String logSinkId) {
        logSinkList.add(logSinkId);
    }

    public List<String> getLogSinkList() {
        return Collections.unmodifiableList(logSinkList);
    }

    public void addLogEvent(String logEventId) {
        logEventList.add(logEventId);
    }

    public List<String> getLogEventList() {
        return Collections.unmodifiableList(logEventList);
    }

    @Override
    public String toString() {
        return "LoggerConfig{" +
                "loggerId='" + loggerId + '\'' +
                ", name='" + name + '\'' +
                ", minimumLogLevel=" + minimumLogLevel +
                ", logSinkList=" + logSinkList +
                ", logEventList=" + logEventList +
                '}';
    }
}

package A_basic.model;

import A_basic.model.enums.SinkType;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class LogSink {
    private final String logSinkId;
    private final String name;
    private final SinkType sinkType;
    private final List<String> logEventList;

    public LogSink(String logSinkId, String name, SinkType sinkType) {
        this.logSinkId = logSinkId;
        this.name = name;
        this.sinkType = sinkType;
        this.logEventList = new ArrayList<>();
    }

    public String getLogSinkId() {
        return logSinkId;
    }

    public String getName() {
        return name;
    }

    public SinkType getSinkType() {
        return sinkType;
    }

    public void addLogEvent(String logEventId) {
        logEventList.add(logEventId);
    }

    public List<String> getLogEventList() {
        return Collections.unmodifiableList(logEventList);
    }

    @Override
    public String toString() {
        return "LogSink{" +
                "logSinkId='" + logSinkId + '\'' +
                ", name='" + name + '\'' +
                ", sinkType=" + sinkType +
                ", logEventList=" + logEventList +
                '}';
    }
}

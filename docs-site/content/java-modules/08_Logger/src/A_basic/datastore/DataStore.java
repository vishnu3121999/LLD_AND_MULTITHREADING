package A_basic.datastore;

import A_basic.model.LogEvent;
import A_basic.model.LogSink;
import A_basic.model.LoggerConfig;

public interface DataStore {
    LoggerConfig getLoggerConfig(String key);

    void putLoggerConfig(String key, LoggerConfig value);

    boolean containsLoggerConfig(String key);

    LoggerConfig removeLoggerConfig(String key);

    LogSink getLogSink(String key);

    void putLogSink(String key, LogSink value);

    boolean containsLogSink(String key);

    LogSink removeLogSink(String key);

    LogEvent getLogEvent(String key);

    void putLogEvent(String key, LogEvent value);

    boolean containsLogEvent(String key);

    LogEvent removeLogEvent(String key);
}

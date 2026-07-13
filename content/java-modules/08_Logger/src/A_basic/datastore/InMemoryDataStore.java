package A_basic.datastore;

import A_basic.model.LogEvent;
import A_basic.model.LogSink;
import A_basic.model.LoggerConfig;

import java.util.HashMap;
import java.util.Map;

public class InMemoryDataStore implements DataStore {
    private final Map<String, LoggerConfig> loggerConfigMap;
    private final Map<String, LogSink> logSinkMap;
    private final Map<String, LogEvent> logEventMap;

    public InMemoryDataStore() {
        this.loggerConfigMap = new HashMap<>();
        this.logSinkMap = new HashMap<>();
        this.logEventMap = new HashMap<>();
    }

    @Override
    public LoggerConfig getLoggerConfig(String key) {
        return loggerConfigMap.get(key);
    }

    @Override
    public void putLoggerConfig(String key, LoggerConfig value) {
        loggerConfigMap.put(key, value);
    }

    @Override
    public boolean containsLoggerConfig(String key) {
        return loggerConfigMap.containsKey(key);
    }

    @Override
    public LoggerConfig removeLoggerConfig(String key) {
        return loggerConfigMap.remove(key);
    }

    @Override
    public LogSink getLogSink(String key) {
        return logSinkMap.get(key);
    }

    @Override
    public void putLogSink(String key, LogSink value) {
        logSinkMap.put(key, value);
    }

    @Override
    public boolean containsLogSink(String key) {
        return logSinkMap.containsKey(key);
    }

    @Override
    public LogSink removeLogSink(String key) {
        return logSinkMap.remove(key);
    }

    @Override
    public LogEvent getLogEvent(String key) {
        return logEventMap.get(key);
    }

    @Override
    public void putLogEvent(String key, LogEvent value) {
        logEventMap.put(key, value);
    }

    @Override
    public boolean containsLogEvent(String key) {
        return logEventMap.containsKey(key);
    }

    @Override
    public LogEvent removeLogEvent(String key) {
        return logEventMap.remove(key);
    }
}

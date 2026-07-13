package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.LogEvent;
import A_basic.model.LogSink;
import A_basic.model.LoggerConfig;
import A_basic.model.enums.LogLevel;
import A_basic.model.enums.SinkType;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class LoggerFacade {
    private final DataStore dataStore;

    public LoggerFacade(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    // User methods

    public void debug(String loggerId, String message) {
        log(loggerId, LogLevel.DEBUG, message);
    }

    public void info(String loggerId, String message) {
        log(loggerId, LogLevel.INFO, message);
    }

    public void warn(String loggerId, String message) {
        log(loggerId, LogLevel.WARN, message);
    }

    public void error(String loggerId, String message) {
        log(loggerId, LogLevel.ERROR, message);
    }

    public void log(String loggerId, LogLevel logLevel, String message) {
        LoggerConfig loggerConfig = dataStore.getLoggerConfig(loggerId);
        if (logLevel.getSeverity() >= loggerConfig.getMinimumLogLevel().getSeverity()) {
            LogEvent logEvent = createLogEvent(loggerConfig, logLevel, message);
            writeToSinks(loggerConfig, logEvent);
        }
    }

    public List<LogEvent> getLogs(String loggerId) {
        LoggerConfig loggerConfig = dataStore.getLoggerConfig(loggerId);
        List<LogEvent> logEventList = new ArrayList<>();
        for (String logEventId : loggerConfig.getLogEventList()) {
            logEventList.add(dataStore.getLogEvent(logEventId));
        }
        return logEventList;
    }

    // System methods

    public LogEvent createLogEvent(LoggerConfig loggerConfig, LogLevel logLevel, String message) {
        LogEvent logEvent = new LogEvent(id("logEvent"), logLevel, loggerConfig.getName(), message);
        dataStore.putLogEvent(logEvent.getLogEventId(), logEvent);
        loggerConfig.addLogEvent(logEvent.getLogEventId());
        return logEvent;
    }

    public void writeToSinks(LoggerConfig loggerConfig, LogEvent logEvent) {
        for (String logSinkId : loggerConfig.getLogSinkList()) {
            LogSink logSink = dataStore.getLogSink(logSinkId);
            logSink.addLogEvent(logEvent.getLogEventId());
            if (logSink.getSinkType() == SinkType.CONSOLE) {
                System.out.println(format(logEvent));
            }
        }
    }

    // Admin methods

    public void addLogger(String loggerId, String name, LogLevel minimumLogLevel) {
        LoggerConfig loggerConfig = new LoggerConfig(loggerId, name, minimumLogLevel);
        dataStore.putLoggerConfig(loggerConfig.getLoggerId(), loggerConfig);
    }

    public void addLogSink(String logSinkId, String name, SinkType sinkType) {
        LogSink logSink = new LogSink(logSinkId, name, sinkType);
        dataStore.putLogSink(logSink.getLogSinkId(), logSink);
    }

    public void attachSinkToLogger(String loggerId, String logSinkId) {
        LoggerConfig loggerConfig = dataStore.getLoggerConfig(loggerId);
        loggerConfig.addLogSink(logSinkId);
    }

    public void updateMinimumLogLevel(String loggerId, LogLevel minimumLogLevel) {
        LoggerConfig loggerConfig = dataStore.getLoggerConfig(loggerId);
        loggerConfig.updateMinimumLogLevel(minimumLogLevel);
    }

    // Util/helper methods

    private String format(LogEvent logEvent) {
        return logEvent.getCreatedAt() + " " + logEvent.getLogLevel() + " [" +
                logEvent.getLoggerName() + "] " + logEvent.getMessage();
    }

    private String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }
}

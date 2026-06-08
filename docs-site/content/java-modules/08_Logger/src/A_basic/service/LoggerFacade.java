package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Appender;
import A_basic.model.LogApplication;
import A_basic.model.LogEntry;
import A_basic.model.enums.AppenderType;
import A_basic.model.enums.LogLevel;

public class LoggerFacade {
    private final DataStore dataStore;
    public LoggerFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public String log(String logApplicationId, String logEntryId, LogLevel logLevel, String message, long createdAt) {
        LogEntry logEntry = new LogEntry(logEntryId, logLevel, message, createdAt);
        dataStore.putLogEntry(logEntry.getLogEntryId(), logEntry);
        publish(logApplicationId, logEntry);
        return logEntryId;
    }

    // System methods

    public void publish(String logApplicationId, LogEntry logEntry) {
        LogApplication logApplication = dataStore.getLogApplication(logApplicationId);
        for (String appenderId : logApplication.getAppenderList()) {
            Appender appender = dataStore.getAppender(appenderId);
            if (appender.accepts(logEntry.getLogLevel())) appender.append(logEntry.getLogEntryId());
        }
    }

    // Admin methods

    public void addApplication(String logApplicationId, String name) {
        LogApplication logApplication = new LogApplication(logApplicationId, name);
        dataStore.putLogApplication(logApplication.getLogApplicationId(), logApplication);
    }

    public void addAppender(String logApplicationId, String appenderId, AppenderType appenderType, LogLevel minLevel) {
        Appender appender = new Appender(appenderId, appenderType, minLevel);
        dataStore.putAppender(appender.getAppenderId(), appender);
        dataStore.getLogApplication(logApplicationId).addAppender(appenderId);
    }

    // Util/helper methods
}

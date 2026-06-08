package A_basic.model;

import A_basic.model.enums.LogLevel;

public class LogEntry {
    private final String logEntryId;
    private final LogLevel logLevel;
    private final String message;
    private final long createdAt;
    public LogEntry(String logEntryId, LogLevel logLevel, String message, long createdAt) { this.logEntryId = logEntryId; this.logLevel = logLevel; this.message = message; this.createdAt = createdAt; }
    @Override public String toString() { return "LogEntry{" + "logEntryId='" + logEntryId + "'" + ", logLevel=" + logLevel + ", message='" + message + "'" + ", createdAt=" + createdAt + '}'; }
    public String getLogEntryId() { return logEntryId; }
    public LogLevel getLogLevel() { return logLevel; }
    public String getMessage() { return message; }
    public long getCreatedAt() { return createdAt; }
}

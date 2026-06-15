package loggingframework.appender;

import loggingframework.model.LogEvent;

public interface Appender {
    void append(LogEvent event);
}

package loggingframework.formatter;

import loggingframework.model.LogEvent;

public interface Formatter {
    String format(LogEvent event);
}

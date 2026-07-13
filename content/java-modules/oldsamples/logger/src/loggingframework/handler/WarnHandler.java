package loggingframework.handler;

import loggingframework.appender.Appender;
import loggingframework.model.LogLevel;

import java.util.List;

public class WarnHandler extends LogHandler {
    public WarnHandler(List<Appender> appenders) {
        super(LogLevel.WARN, appenders);
    }
}

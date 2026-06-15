package loggingframework.handler;

import loggingframework.appender.Appender;
import loggingframework.model.LogLevel;

import java.util.List;

public class InfoHandler extends LogHandler {
    public InfoHandler(List<Appender> appenders) {
        super(LogLevel.INFO, appenders);
    }
}

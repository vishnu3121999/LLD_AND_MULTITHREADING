package loggingframework.appender;

import loggingframework.formatter.Formatter;
import loggingframework.model.LogEvent;

public class ConsoleAppender implements Appender {
    private final Formatter formatter;

    public ConsoleAppender(Formatter formatter) {
        this.formatter = formatter;
    }

    @Override
    public void append(LogEvent event) {
        System.out.println(formatter.format(event));
    }
}

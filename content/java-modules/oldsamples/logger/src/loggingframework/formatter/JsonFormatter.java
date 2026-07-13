package loggingframework.formatter;

import loggingframework.model.LogEvent;

public class JsonFormatter implements Formatter {
    @Override
    public String format(LogEvent event) {
        return String.format(
                "{\"timestamp\":\"%s\",\"level\":\"%s\",\"logger\":\"%s\",\"message\":\"%s\"}",
                event.getTimestamp(),
                event.getLevel(),
                escape(event.getLoggerName()),
                escape(event.getMessage())
        );
    }

    private String escape(String input) {
        return input.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}

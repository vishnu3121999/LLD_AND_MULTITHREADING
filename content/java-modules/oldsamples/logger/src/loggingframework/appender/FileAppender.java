package loggingframework.appender;

import loggingframework.formatter.Formatter;
import loggingframework.model.LogEvent;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class FileAppender implements Appender {
    private final String filePath;
    private final Formatter formatter;

    public FileAppender(String filePath, Formatter formatter) {
        this.filePath = filePath;
        this.formatter = formatter;
    }

    @Override
    public synchronized void append(LogEvent event) {
        File file = new File(filePath);
        File parentDirectory = file.getParentFile();
        if (parentDirectory != null && !parentDirectory.exists()) {
            parentDirectory.mkdirs();
        }

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file, true))) {
            writer.write(formatter.format(event));
            writer.newLine();
        } catch (IOException exception) {
            throw new RuntimeException("Failed to write log to file: " + filePath, exception);
        }
    }
}

package E_ExceptionHandling.command;

import java.util.ArrayDeque;
import java.util.Deque;

public class CommandInvoker {
    private final Deque<Command> history;

    public CommandInvoker() {
        this.history = new ArrayDeque<>();
    }

    public boolean execute(Command command) {
        boolean success = command.execute();
        if (success) {
            history.addLast(command);
        }
        return success;
    }

    public boolean undoLast() {
        if (history.isEmpty()) {
            return false;
        }
        // removeLast() will throw NoSuchElementException if empty, so we dont need to throw ourselves
        return history.removeLast().undo();
    }
}



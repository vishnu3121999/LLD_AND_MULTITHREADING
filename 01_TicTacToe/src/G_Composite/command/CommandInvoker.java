package G_Composite.command;

import java.util.ArrayDeque;
import java.util.Deque;

public class CommandInvoker {
    private final Deque<Command> history;

    public CommandInvoker() {
        this.history = new ArrayDeque<>();
    }

    public synchronized boolean execute(Command command) {
        boolean success = command.execute();
        if (success) {
            history.addLast(command);
        }
        return success;
    }

    public synchronized boolean undoLast() {
        if (history.isEmpty()) {
            return false;
        }
        return history.removeLast().undo();
    }
}

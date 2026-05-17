package C_command.command;

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
        return history.removeLast().undo();
    }
}

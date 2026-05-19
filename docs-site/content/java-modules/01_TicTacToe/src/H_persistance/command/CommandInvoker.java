package H_persistance.command;

import H_persistance.model.Move;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

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

    public synchronized List<Move> getMoveHistory() {
        List<Move> moves = new ArrayList<>();
        for (Command command : history) {
            if (command instanceof MoveCommand) {
                moves.add(((MoveCommand) command).getMove());
            }
        }
        return moves;
    }
}

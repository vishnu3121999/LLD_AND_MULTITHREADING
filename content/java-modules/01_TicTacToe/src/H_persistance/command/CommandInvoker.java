package H_persistance.command;

import H_persistance.model.Move;
import H_persistance.model.game.TicTacToeGame;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

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

    public List<Move> getMoveHistory() {
        List<Move> moves = new ArrayList<>();
        for (Command command : history) {
            if (command instanceof MoveCommand) {
                moves.add(((MoveCommand) command).getMove());
            }
        }
        return moves;
    }

    public void restoreMoveHistory(List<Move> moves, TicTacToeGame game) {
        history.clear();
        for (Move move : moves) {
            history.addLast(new MoveCommand(game, move, true));
        }
    }
}

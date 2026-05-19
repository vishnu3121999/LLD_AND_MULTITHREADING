package H_persistance.command;

import H_persistance.model.Move;
import H_persistance.model.game.TicTacToeGame;

public class MoveCommand implements Command {
    private final TicTacToeGame game;
    private final Move move;
    private boolean executed;

    public MoveCommand(TicTacToeGame game, Move move) {
        this.game = game;
        this.move = move;
        this.executed = false;
    }

    @Override
    public boolean execute() {
        executed = game.applyMove(move);
        return executed;
    }

    @Override
    public boolean undo() {
        if (!executed) {
            return false;
        }
        game.undoMove(move);
        executed = false;
        return true;
    }

    public Move getMove() {
        return move;
    }
}




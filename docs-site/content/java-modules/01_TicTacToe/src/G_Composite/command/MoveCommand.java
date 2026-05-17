package G_Composite.command;

import G_Composite.model.Move;
import G_Composite.model.game.TicTacToeGame;

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
}




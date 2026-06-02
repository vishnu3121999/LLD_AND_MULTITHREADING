package K_persistence.validation;

import K_persistence.exception.IlligalMoveException;
import K_persistence.model.GameState;
import K_persistence.model.Move;
import K_persistence.service.ChessGame;

public class GameActiveValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (game.getGameState() != GameState.IN_PROGRESS) {
            throw new IlligalMoveException("Game is not in progress.");
        }
        return validateNext(game, move);
    }
}



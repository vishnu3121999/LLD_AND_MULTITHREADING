package G_exceptionhandling.validation;

import G_exceptionhandling.exception.IlligalMoveException;
import G_exceptionhandling.model.GameState;
import G_exceptionhandling.model.Move;
import G_exceptionhandling.service.ChessGame;

public class GameActiveValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (game.getGameState() != GameState.IN_PROGRESS) {
            throw new IlligalMoveException("Game is not in progress.");
        }
        return validateNext(game, move);
    }
}

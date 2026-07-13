package H_concurrency.validation;

import H_concurrency.exception.IlligalMoveException;
import H_concurrency.model.GameState;
import H_concurrency.model.Move;
import H_concurrency.service.ChessGame;

public class GameActiveValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (game.getGameState() != GameState.IN_PROGRESS) {
            throw new IlligalMoveException("Game is not in progress.");
        }
        return validateNext(game, move);
    }
}


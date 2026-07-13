package H_concurrency.validation;

import H_concurrency.exception.IlligalMoveException;
import H_concurrency.model.Move;
import H_concurrency.service.ChessGame;

public class PlayerTurnValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (!game.isCurrentPlayer(move.getPlayer())) {
            throw new IlligalMoveException("It is not this player's turn.");
        }
        return validateNext(game, move);
    }
}


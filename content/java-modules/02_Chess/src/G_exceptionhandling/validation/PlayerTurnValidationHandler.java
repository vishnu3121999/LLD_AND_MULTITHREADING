package G_exceptionhandling.validation;

import G_exceptionhandling.exception.IlligalMoveException;
import G_exceptionhandling.model.Move;
import G_exceptionhandling.service.ChessGame;

public class PlayerTurnValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (!game.isCurrentPlayer(move.getPlayer())) {
            throw new IlligalMoveException("It is not this player's turn.");
        }
        return validateNext(game, move);
    }
}

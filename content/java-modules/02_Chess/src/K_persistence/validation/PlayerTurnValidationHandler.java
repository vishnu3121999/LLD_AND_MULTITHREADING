package K_persistence.validation;

import K_persistence.exception.IlligalMoveException;
import K_persistence.model.Move;
import K_persistence.service.ChessGame;

public class PlayerTurnValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (!game.isCurrentPlayer(move.getPlayer())) {
            throw new IlligalMoveException("It is not this player's turn.");
        }
        return validateNext(game, move);
    }
}



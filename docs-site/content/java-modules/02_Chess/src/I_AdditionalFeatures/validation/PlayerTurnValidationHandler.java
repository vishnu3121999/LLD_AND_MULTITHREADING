package I_AdditionalFeatures.validation;

import I_AdditionalFeatures.exception.IlligalMoveException;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.service.ChessGame;

public class PlayerTurnValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (!game.isCurrentPlayer(move.getPlayer())) {
            throw new IlligalMoveException("It is not this player's turn.");
        }
        return validateNext(game, move);
    }
}



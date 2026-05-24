package I_AdditionalFeatures.validation;

import I_AdditionalFeatures.exception.IlligalMoveException;
import I_AdditionalFeatures.model.GameState;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.service.ChessGame;

public class GameActiveValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (game.getGameState() != GameState.IN_PROGRESS) {
            throw new IlligalMoveException("Game is not in progress.");
        }
        return validateNext(game, move);
    }
}



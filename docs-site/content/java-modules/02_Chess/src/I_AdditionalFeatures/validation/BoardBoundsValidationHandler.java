package I_AdditionalFeatures.validation;

import I_AdditionalFeatures.exception.IlligalMoveException;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.service.ChessGame;

public class BoardBoundsValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        int boardSize = game.getBoard().getSize();
        if (!move.getFrom().isValid(boardSize) || !move.getTo().isValid(boardSize)) {
            throw new IlligalMoveException("Move positions must be inside the board.");
        }
        return validateNext(game, move);
    }
}




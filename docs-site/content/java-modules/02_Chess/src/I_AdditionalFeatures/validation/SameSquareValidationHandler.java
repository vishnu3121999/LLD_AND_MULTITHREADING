package I_AdditionalFeatures.validation;

import I_AdditionalFeatures.exception.IlligalMoveException;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.service.ChessGame;

public class SameSquareValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (move.getFrom().getRow() == move.getTo().getRow()
                && move.getFrom().getCol() == move.getTo().getCol()) {
            throw new IlligalMoveException("Source and destination cannot be the same square.");
        }
        return validateNext(game, move);
    }
}



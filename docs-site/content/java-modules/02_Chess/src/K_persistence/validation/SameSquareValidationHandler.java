package K_persistence.validation;

import K_persistence.exception.IlligalMoveException;
import K_persistence.model.Move;
import K_persistence.service.ChessGame;

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



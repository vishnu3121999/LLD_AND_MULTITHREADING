package H_concurrency.validation;

import H_concurrency.exception.IlligalMoveException;
import H_concurrency.model.Move;
import H_concurrency.service.ChessGame;

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


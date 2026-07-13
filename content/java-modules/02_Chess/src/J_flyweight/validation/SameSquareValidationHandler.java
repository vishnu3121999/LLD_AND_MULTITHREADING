package J_flyweight.validation;

import J_flyweight.exception.IlligalMoveException;
import J_flyweight.model.Move;
import J_flyweight.service.ChessGame;

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



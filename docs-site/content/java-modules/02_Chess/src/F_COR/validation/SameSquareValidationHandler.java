package F_COR.validation;

import F_COR.model.Move;
import F_COR.service.ChessGame;

public class SameSquareValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (move.getFrom().getRow() == move.getTo().getRow()
                && move.getFrom().getCol() == move.getTo().getCol()) {
            return false;
        }
        return validateNext(game, move);
    }
}

package F_COR.validation;

import F_COR.model.Move;
import F_COR.service.ChessGame;

public class SourcePieceValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (game.getBoard().getPiece(move.getFrom()) == null) {
            return false;
        }
        return validateNext(game, move);
    }
}

package G_exceptionhandling.validation;

import G_exceptionhandling.exception.IlligalMoveException;
import G_exceptionhandling.model.Move;
import G_exceptionhandling.service.ChessGame;

public class SourcePieceValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (game.getBoard().getPiece(move.getFrom()) == null) {
            throw new IlligalMoveException("No piece exists at source position " + move.getFrom() + ".");
        }
        return validateNext(game, move);
    }
}


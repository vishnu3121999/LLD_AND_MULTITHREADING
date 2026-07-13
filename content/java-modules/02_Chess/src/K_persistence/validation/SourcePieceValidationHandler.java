package K_persistence.validation;

import K_persistence.exception.IlligalMoveException;
import K_persistence.model.Move;
import K_persistence.service.ChessGame;

public class SourcePieceValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (game.getBoard().getPiece(move.getFrom()) == null) {
            throw new IlligalMoveException("No piece exists at source position " + move.getFrom() + ".");
        }
        return validateNext(game, move);
    }
}




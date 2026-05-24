package H_concurrency.validation;

import H_concurrency.exception.IlligalMoveException;
import H_concurrency.model.Move;
import H_concurrency.service.ChessGame;

public class SourcePieceValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (game.getBoard().getPiece(move.getFrom()) == null) {
            throw new IlligalMoveException("No piece exists at source position " + move.getFrom() + ".");
        }
        return validateNext(game, move);
    }
}



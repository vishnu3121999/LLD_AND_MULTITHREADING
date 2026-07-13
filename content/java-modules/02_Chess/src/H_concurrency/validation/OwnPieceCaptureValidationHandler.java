package H_concurrency.validation;

import H_concurrency.exception.IlligalMoveException;
import H_concurrency.model.Move;
import H_concurrency.model.Piece;
import H_concurrency.service.ChessGame;

public class OwnPieceCaptureValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        Piece movingPiece = game.getBoard().getPiece(move.getFrom());
        Piece targetPiece = game.getBoard().getPiece(move.getTo());
        if (targetPiece != null && targetPiece.getColor() == movingPiece.getColor()) {
            throw new IlligalMoveException("Player cannot capture own piece.");
        }
        return validateNext(game, move);
    }
}


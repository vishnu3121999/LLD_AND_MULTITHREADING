package K_persistence.validation;

import K_persistence.exception.IlligalMoveException;
import K_persistence.model.Move;
import K_persistence.model.Piece;
import K_persistence.service.ChessGame;

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



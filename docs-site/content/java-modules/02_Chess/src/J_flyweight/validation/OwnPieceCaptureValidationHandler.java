package J_flyweight.validation;

import J_flyweight.exception.IlligalMoveException;
import J_flyweight.model.Move;
import J_flyweight.model.Piece;
import J_flyweight.service.ChessGame;

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



package F_COR.validation;

import F_COR.model.Move;
import F_COR.model.Piece;
import F_COR.service.ChessGame;

public class OwnPieceCaptureValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        Piece movingPiece = game.getBoard().getPiece(move.getFrom());
        Piece targetPiece = game.getBoard().getPiece(move.getTo());
        if (targetPiece != null && targetPiece.getColor() == movingPiece.getColor()) {
            return false;
        }
        return validateNext(game, move);
    }
}

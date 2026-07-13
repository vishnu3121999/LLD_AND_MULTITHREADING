package I_AdditionalFeatures.validation;

import I_AdditionalFeatures.exception.IlligalMoveException;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.model.Piece;
import I_AdditionalFeatures.service.ChessGame;

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



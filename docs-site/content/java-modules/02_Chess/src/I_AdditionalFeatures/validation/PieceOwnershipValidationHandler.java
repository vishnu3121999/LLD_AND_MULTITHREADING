package I_AdditionalFeatures.validation;

import I_AdditionalFeatures.exception.IlligalMoveException;
import I_AdditionalFeatures.model.Color;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.model.Piece;
import I_AdditionalFeatures.service.ChessGame;

public class PieceOwnershipValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        Piece movingPiece = game.getBoard().getPiece(move.getFrom());
        Color playerColor = game.getPlayerColor(move.getPlayer());
        if (playerColor == null || movingPiece.getColor() != playerColor) {
            throw new IlligalMoveException("Player cannot move opponent's piece.");
        }
        return validateNext(game, move);
    }
}



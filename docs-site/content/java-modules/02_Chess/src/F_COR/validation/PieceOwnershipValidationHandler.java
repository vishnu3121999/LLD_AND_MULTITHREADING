package F_COR.validation;

import F_COR.model.Color;
import F_COR.model.Move;
import F_COR.model.Piece;
import F_COR.service.ChessGame;

public class PieceOwnershipValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        Piece movingPiece = game.getBoard().getPiece(move.getFrom());
        Color playerColor = game.getPlayerColor(move.getPlayer());
        if (playerColor == null || movingPiece.getColor() != playerColor) {
            return false;
        }
        return validateNext(game, move);
    }
}

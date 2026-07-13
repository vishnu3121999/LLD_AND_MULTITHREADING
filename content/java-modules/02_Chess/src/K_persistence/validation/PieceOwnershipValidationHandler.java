package K_persistence.validation;

import K_persistence.exception.IlligalMoveException;
import K_persistence.model.Color;
import K_persistence.model.Move;
import K_persistence.model.Piece;
import K_persistence.service.ChessGame;

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



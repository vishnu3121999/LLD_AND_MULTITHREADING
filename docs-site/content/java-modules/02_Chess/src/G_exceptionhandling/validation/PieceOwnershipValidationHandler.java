package G_exceptionhandling.validation;

import G_exceptionhandling.exception.IlligalMoveException;
import G_exceptionhandling.model.Color;
import G_exceptionhandling.model.Move;
import G_exceptionhandling.model.Piece;
import G_exceptionhandling.service.ChessGame;

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

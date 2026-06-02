package J_flyweight.validation;

import J_flyweight.exception.IlligalMoveException;
import J_flyweight.model.Color;
import J_flyweight.model.Move;
import J_flyweight.model.Piece;
import J_flyweight.service.ChessGame;

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



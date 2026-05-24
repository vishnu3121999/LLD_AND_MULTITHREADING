package H_concurrency.validation;

import H_concurrency.exception.IlligalMoveException;
import H_concurrency.model.Color;
import H_concurrency.model.Move;
import H_concurrency.model.Piece;
import H_concurrency.service.ChessGame;

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


package J_flyweight.validation;

import J_flyweight.exception.IlligalMoveException;
import J_flyweight.model.Move;
import J_flyweight.service.ChessGame;

public class BoardBoundsValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        int boardSize = game.getBoard().getSize();
        if (!move.getFrom().isValid(boardSize) || !move.getTo().isValid(boardSize)) {
            throw new IlligalMoveException("Move positions must be inside the board.");
        }
        return validateNext(game, move);
    }
}




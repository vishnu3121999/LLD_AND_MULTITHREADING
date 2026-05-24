package G_exceptionhandling.validation;

import G_exceptionhandling.exception.IlligalMoveException;
import G_exceptionhandling.model.Move;
import G_exceptionhandling.service.ChessGame;

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


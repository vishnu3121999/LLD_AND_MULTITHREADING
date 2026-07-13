package K_persistence.validation;

import K_persistence.exception.IlligalMoveException;
import K_persistence.model.Move;
import K_persistence.service.ChessGame;

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




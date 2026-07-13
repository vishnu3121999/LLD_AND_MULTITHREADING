package H_concurrency.validation;

import H_concurrency.exception.IlligalMoveException;
import H_concurrency.model.Move;
import H_concurrency.service.ChessGame;

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



package J_flyweight.validation;

import J_flyweight.exception.IlligalMoveException;
import J_flyweight.model.GameState;
import J_flyweight.model.Move;
import J_flyweight.service.ChessGame;

public class GameActiveValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (game.getGameState() != GameState.IN_PROGRESS) {
            throw new IlligalMoveException("Game is not in progress.");
        }
        return validateNext(game, move);
    }
}



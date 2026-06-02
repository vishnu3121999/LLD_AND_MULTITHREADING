package J_flyweight.validation;

import J_flyweight.exception.IlligalMoveException;
import J_flyweight.model.Move;
import J_flyweight.service.ChessGame;

public class PlayerTurnValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (!game.isCurrentPlayer(move.getPlayer())) {
            throw new IlligalMoveException("It is not this player's turn.");
        }
        return validateNext(game, move);
    }
}



package J_flyweight.validation;

import J_flyweight.model.Move;
import J_flyweight.service.ChessGame;

public abstract class MoveValidationHandler {
    private MoveValidationHandler nextHandler;

    public MoveValidationHandler setNext(MoveValidationHandler nextHandler) {
        this.nextHandler = nextHandler;
        return nextHandler;
    }

    public abstract boolean validate(ChessGame game, Move move);

    protected boolean validateNext(ChessGame game, Move move) {
        return nextHandler == null || nextHandler.validate(game, move);
    }
}




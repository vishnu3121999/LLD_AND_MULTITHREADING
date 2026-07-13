package G_exceptionhandling.validation;

import G_exceptionhandling.model.Move;
import G_exceptionhandling.service.ChessGame;

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


package F_COR.validation;

import F_COR.model.Move;
import F_COR.service.ChessGame;

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

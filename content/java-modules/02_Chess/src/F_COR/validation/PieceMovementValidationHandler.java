package F_COR.validation;

import F_COR.factory.MovementStrategyFactory;
import F_COR.model.Move;
import F_COR.model.Piece;
import F_COR.movement.MovementStrategy;
import F_COR.service.ChessGame;

public class PieceMovementValidationHandler extends MoveValidationHandler {
    private final MovementStrategyFactory movementStrategyFactory;

    public PieceMovementValidationHandler(MovementStrategyFactory movementStrategyFactory) {
        this.movementStrategyFactory = movementStrategyFactory;
    }

    @Override
    public boolean validate(ChessGame game, Move move) {
        Piece movingPiece = game.getBoard().getPiece(move.getFrom());
        MovementStrategy strategy = movementStrategyFactory.getStrategy(movingPiece.getType());
        if (!strategy.canMove(game.getBoard(), movingPiece, move)) {
            return false;
        }

        return validateNext(game, move);
    }
}

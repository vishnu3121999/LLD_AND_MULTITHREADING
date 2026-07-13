package G_exceptionhandling.validation;

import G_exceptionhandling.exception.IlligalMoveException;
import G_exceptionhandling.factory.MovementStrategyFactory;
import G_exceptionhandling.model.Move;
import G_exceptionhandling.model.Piece;
import G_exceptionhandling.movement.MovementStrategy;
import G_exceptionhandling.service.ChessGame;

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
            throw new IlligalMoveException("Piece cannot move from " + move.getFrom() + " to " + move.getTo() + ".");
        }

        return validateNext(game, move);
    }
}


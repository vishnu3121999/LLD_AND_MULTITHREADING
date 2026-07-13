package H_concurrency.validation;

import H_concurrency.exception.IlligalMoveException;
import H_concurrency.factory.MovementStrategyFactory;
import H_concurrency.model.Move;
import H_concurrency.model.Piece;
import H_concurrency.movement.MovementStrategy;
import H_concurrency.service.ChessGame;

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



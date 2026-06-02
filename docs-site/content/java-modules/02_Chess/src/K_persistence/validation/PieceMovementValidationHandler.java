package K_persistence.validation;

import K_persistence.exception.IlligalMoveException;
import K_persistence.factory.MovementStrategyFactory;
import K_persistence.model.Move;
import K_persistence.model.Piece;
import K_persistence.movement.MovementStrategy;
import K_persistence.service.ChessGame;
import K_persistence.special.SpecialMoveService;

public class PieceMovementValidationHandler extends MoveValidationHandler {
    private final MovementStrategyFactory movementStrategyFactory;
    private final SpecialMoveService specialMoveService;

    public PieceMovementValidationHandler(MovementStrategyFactory movementStrategyFactory,
                                          SpecialMoveService specialMoveService) {
        this.movementStrategyFactory = movementStrategyFactory;
        this.specialMoveService = specialMoveService;
    }

    @Override
    public boolean validate(ChessGame game, Move move) {
        Piece movingPiece = game.getBoard().getPiece(move.getFrom());
        boolean canMove = specialMoveService.isLegalSpecialMove(game, move);
        if (!canMove) {
            MovementStrategy strategy = movementStrategyFactory.getStrategy(movingPiece.getType());
            canMove = strategy.canMove(game.getBoard(), movingPiece, move);
        }

        if (!canMove) {
            throw new IlligalMoveException("Piece cannot move from " + move.getFrom() + " to " + move.getTo() + ".");
        }

        return validateNext(game, move);
    }
}




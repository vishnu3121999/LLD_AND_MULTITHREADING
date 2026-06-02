package J_flyweight.validation;

import J_flyweight.exception.IlligalMoveException;
import J_flyweight.factory.MovementStrategyFactory;
import J_flyweight.model.Move;
import J_flyweight.model.Piece;
import J_flyweight.movement.MovementStrategy;
import J_flyweight.service.ChessGame;
import J_flyweight.special.SpecialMoveService;

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




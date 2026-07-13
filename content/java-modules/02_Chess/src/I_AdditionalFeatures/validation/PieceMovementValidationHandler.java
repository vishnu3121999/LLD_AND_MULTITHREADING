package I_AdditionalFeatures.validation;

import I_AdditionalFeatures.exception.IlligalMoveException;
import I_AdditionalFeatures.factory.MovementStrategyFactory;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.model.Piece;
import I_AdditionalFeatures.movement.MovementStrategy;
import I_AdditionalFeatures.service.ChessGame;
import I_AdditionalFeatures.special.SpecialMoveService;

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




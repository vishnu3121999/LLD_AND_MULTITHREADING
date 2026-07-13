package F_COR.service;

import F_COR.factory.MovementStrategyFactory;
import F_COR.model.Move;
import F_COR.validation.BoardBoundsValidationHandler;
import F_COR.validation.MoveValidationHandler;
import F_COR.validation.OwnPieceCaptureValidationHandler;
import F_COR.validation.PieceMovementValidationHandler;
import F_COR.validation.PieceOwnershipValidationHandler;
import F_COR.validation.SameSquareValidationHandler;
import F_COR.validation.SourcePieceValidationHandler;

public class MoveValidator {
    private final MoveValidationHandler validationChain;

    public MoveValidator(MovementStrategyFactory movementStrategyFactory) {
        BoardBoundsValidationHandler boardBoundsHandler = new BoardBoundsValidationHandler();
        boardBoundsHandler
                .setNext(new SameSquareValidationHandler())
                .setNext(new SourcePieceValidationHandler())
                .setNext(new PieceOwnershipValidationHandler())
                .setNext(new OwnPieceCaptureValidationHandler())
                .setNext(new PieceMovementValidationHandler(movementStrategyFactory));
        this.validationChain = boardBoundsHandler;
    }

    public boolean isValid(ChessGame game, Move move) {
        return validationChain.validate(game, move);
    }
}



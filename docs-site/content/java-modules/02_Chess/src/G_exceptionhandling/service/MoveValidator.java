package G_exceptionhandling.service;

import G_exceptionhandling.factory.MovementStrategyFactory;
import G_exceptionhandling.model.Move;
import G_exceptionhandling.validation.BoardBoundsValidationHandler;
import G_exceptionhandling.validation.GameActiveValidationHandler;
import G_exceptionhandling.validation.MoveValidationHandler;
import G_exceptionhandling.validation.OwnPieceCaptureValidationHandler;
import G_exceptionhandling.validation.PieceMovementValidationHandler;
import G_exceptionhandling.validation.PieceOwnershipValidationHandler;
import G_exceptionhandling.validation.PlayerTurnValidationHandler;
import G_exceptionhandling.validation.SameSquareValidationHandler;
import G_exceptionhandling.validation.SourcePieceValidationHandler;

public class MoveValidator {
    private final MoveValidationHandler validationChain;

    public MoveValidator(MovementStrategyFactory movementStrategyFactory) {
        GameActiveValidationHandler gameActiveHandler = new GameActiveValidationHandler();
        gameActiveHandler
                .setNext(new BoardBoundsValidationHandler())
                .setNext(new SameSquareValidationHandler())
                .setNext(new SourcePieceValidationHandler())
                .setNext(new PlayerTurnValidationHandler())
                .setNext(new PieceOwnershipValidationHandler())
                .setNext(new OwnPieceCaptureValidationHandler())
                .setNext(new PieceMovementValidationHandler(movementStrategyFactory));
        this.validationChain = gameActiveHandler;
    }

    public boolean isValid(ChessGame game, Move move) {
        return validationChain.validate(game, move);
    }
}




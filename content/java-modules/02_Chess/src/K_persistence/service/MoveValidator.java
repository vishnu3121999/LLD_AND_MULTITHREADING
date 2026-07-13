package K_persistence.service;

import K_persistence.factory.MovementStrategyFactory;
import K_persistence.model.Move;
import K_persistence.rules.CheckDetector;
import K_persistence.special.SpecialMoveService;
import K_persistence.validation.BoardBoundsValidationHandler;
import K_persistence.validation.GameActiveValidationHandler;
import K_persistence.validation.KingSafetyValidationHandler;
import K_persistence.validation.MoveValidationHandler;
import K_persistence.validation.OwnPieceCaptureValidationHandler;
import K_persistence.validation.PieceMovementValidationHandler;
import K_persistence.validation.PieceOwnershipValidationHandler;
import K_persistence.validation.PlayerTurnValidationHandler;
import K_persistence.validation.SameSquareValidationHandler;
import K_persistence.validation.SourcePieceValidationHandler;

public class MoveValidator {
    private final MoveValidationHandler validationChain;

    public MoveValidator(MovementStrategyFactory movementStrategyFactory, CheckDetector checkDetector,
                         SpecialMoveService specialMoveService) {
        GameActiveValidationHandler gameActiveHandler = new GameActiveValidationHandler();
        gameActiveHandler
                .setNext(new BoardBoundsValidationHandler())
                .setNext(new SameSquareValidationHandler())
                .setNext(new SourcePieceValidationHandler())
                .setNext(new PlayerTurnValidationHandler())
                .setNext(new PieceOwnershipValidationHandler())
                .setNext(new OwnPieceCaptureValidationHandler())
                .setNext(new PieceMovementValidationHandler(movementStrategyFactory, specialMoveService))
                .setNext(new KingSafetyValidationHandler(checkDetector, specialMoveService));
        this.validationChain = gameActiveHandler;
    }

    public boolean isValid(ChessGame game, Move move) {
        return validationChain.validate(game, move);
    }
}






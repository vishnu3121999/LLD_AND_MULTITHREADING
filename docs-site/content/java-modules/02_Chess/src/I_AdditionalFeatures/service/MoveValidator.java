package I_AdditionalFeatures.service;

import I_AdditionalFeatures.factory.MovementStrategyFactory;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.rules.CheckDetector;
import I_AdditionalFeatures.special.SpecialMoveService;
import I_AdditionalFeatures.validation.BoardBoundsValidationHandler;
import I_AdditionalFeatures.validation.GameActiveValidationHandler;
import I_AdditionalFeatures.validation.KingSafetyValidationHandler;
import I_AdditionalFeatures.validation.MoveValidationHandler;
import I_AdditionalFeatures.validation.OwnPieceCaptureValidationHandler;
import I_AdditionalFeatures.validation.PieceMovementValidationHandler;
import I_AdditionalFeatures.validation.PieceOwnershipValidationHandler;
import I_AdditionalFeatures.validation.PlayerTurnValidationHandler;
import I_AdditionalFeatures.validation.SameSquareValidationHandler;
import I_AdditionalFeatures.validation.SourcePieceValidationHandler;

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






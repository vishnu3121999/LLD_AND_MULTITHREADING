package J_flyweight.service;

import J_flyweight.factory.MovementStrategyFactory;
import J_flyweight.model.Move;
import J_flyweight.rules.CheckDetector;
import J_flyweight.special.SpecialMoveService;
import J_flyweight.validation.BoardBoundsValidationHandler;
import J_flyweight.validation.GameActiveValidationHandler;
import J_flyweight.validation.KingSafetyValidationHandler;
import J_flyweight.validation.MoveValidationHandler;
import J_flyweight.validation.OwnPieceCaptureValidationHandler;
import J_flyweight.validation.PieceMovementValidationHandler;
import J_flyweight.validation.PieceOwnershipValidationHandler;
import J_flyweight.validation.PlayerTurnValidationHandler;
import J_flyweight.validation.SameSquareValidationHandler;
import J_flyweight.validation.SourcePieceValidationHandler;

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






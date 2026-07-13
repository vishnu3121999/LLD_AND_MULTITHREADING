package H_concurrency.service;

import H_concurrency.factory.MovementStrategyFactory;
import H_concurrency.model.Move;
import H_concurrency.validation.BoardBoundsValidationHandler;
import H_concurrency.validation.GameActiveValidationHandler;
import H_concurrency.validation.MoveValidationHandler;
import H_concurrency.validation.OwnPieceCaptureValidationHandler;
import H_concurrency.validation.PieceMovementValidationHandler;
import H_concurrency.validation.PieceOwnershipValidationHandler;
import H_concurrency.validation.PlayerTurnValidationHandler;
import H_concurrency.validation.SameSquareValidationHandler;
import H_concurrency.validation.SourcePieceValidationHandler;

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





package I_AdditionalFeatures.validation;

import I_AdditionalFeatures.exception.IlligalMoveException;
import I_AdditionalFeatures.model.Color;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.model.Piece;
import I_AdditionalFeatures.rules.CheckDetector;
import I_AdditionalFeatures.service.ChessGame;
import I_AdditionalFeatures.special.SpecialMoveService;

public class KingSafetyValidationHandler extends MoveValidationHandler {
    private final CheckDetector checkDetector;
    private final SpecialMoveService specialMoveService;

    public KingSafetyValidationHandler(CheckDetector checkDetector, SpecialMoveService specialMoveService) {
        this.checkDetector = checkDetector;
        this.specialMoveService = specialMoveService;
    }

    @Override
    public boolean validate(ChessGame game, Move move) {
        Piece[][] snapshot = game.getBoard().createSnapshot();
        Piece movingPiece = game.getBoard().getPiece(move.getFrom());
        Color movingColor = movingPiece.getColor();

        specialMoveService.applyMove(game, move, false);
        boolean kingInCheck = checkDetector.isInCheck(game, movingColor);
        game.getBoard().restore(snapshot);

        if (kingInCheck) {
            throw new IlligalMoveException("Move leaves own king in check.");
        }
        return validateNext(game, move);
    }
}

package K_persistence.validation;

import K_persistence.exception.IlligalMoveException;
import K_persistence.model.Color;
import K_persistence.model.Move;
import K_persistence.model.Piece;
import K_persistence.rules.CheckDetector;
import K_persistence.service.ChessGame;
import K_persistence.special.SpecialMoveService;

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

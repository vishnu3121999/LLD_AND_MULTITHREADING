package J_flyweight.validation;

import J_flyweight.exception.IlligalMoveException;
import J_flyweight.model.Color;
import J_flyweight.model.Move;
import J_flyweight.model.Piece;
import J_flyweight.rules.CheckDetector;
import J_flyweight.service.ChessGame;
import J_flyweight.special.SpecialMoveService;

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

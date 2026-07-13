package I_AdditionalFeatures.validation;

import I_AdditionalFeatures.exception.IlligalMoveException;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.service.ChessGame;

public class SourcePieceValidationHandler extends MoveValidationHandler {
    @Override
    public boolean validate(ChessGame game, Move move) {
        if (game.getBoard().getPiece(move.getFrom()) == null) {
            throw new IlligalMoveException("No piece exists at source position " + move.getFrom() + ".");
        }
        return validateNext(game, move);
    }
}




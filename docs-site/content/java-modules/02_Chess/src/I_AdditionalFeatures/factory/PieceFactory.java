package I_AdditionalFeatures.factory;

import I_AdditionalFeatures.model.Color;
import I_AdditionalFeatures.model.Piece;
import I_AdditionalFeatures.model.PieceType;

public class PieceFactory {
    public Piece create(PieceType type, Color color) {
        return new Piece(type, color);
    }
}






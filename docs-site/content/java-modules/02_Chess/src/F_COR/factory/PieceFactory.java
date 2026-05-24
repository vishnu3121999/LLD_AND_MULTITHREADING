package F_COR.factory;

import F_COR.model.Color;
import F_COR.model.Piece;
import F_COR.model.PieceType;

public class PieceFactory {
    public Piece create(PieceType type, Color color) {
        return new Piece(type, color);
    }
}



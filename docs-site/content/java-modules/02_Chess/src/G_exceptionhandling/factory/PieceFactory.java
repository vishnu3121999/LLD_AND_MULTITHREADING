package G_exceptionhandling.factory;

import G_exceptionhandling.model.Color;
import G_exceptionhandling.model.Piece;
import G_exceptionhandling.model.PieceType;

public class PieceFactory {
    public Piece create(PieceType type, Color color) {
        return new Piece(type, color);
    }
}




package E_Observer.factory;

import E_Observer.model.Color;
import E_Observer.model.Piece;
import E_Observer.model.PieceType;

public class PieceFactory {
    public Piece create(PieceType type, Color color) {
        return new Piece(type, color);
    }
}


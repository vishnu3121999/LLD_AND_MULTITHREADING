package D_Memento.factory;

import D_Memento.model.Color;
import D_Memento.model.Piece;
import D_Memento.model.PieceType;

public class PieceFactory {
    public Piece create(PieceType type, Color color) {
        return new Piece(type, color);
    }
}


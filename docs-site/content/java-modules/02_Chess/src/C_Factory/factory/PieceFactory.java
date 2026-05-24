package C_Factory.factory;

import C_Factory.model.Color;
import C_Factory.model.Piece;
import C_Factory.model.PieceType;

public class PieceFactory {
    public Piece create(PieceType type, Color color) {
        return new Piece(type, color);
    }
}

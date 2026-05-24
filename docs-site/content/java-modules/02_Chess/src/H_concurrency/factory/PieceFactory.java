package H_concurrency.factory;

import H_concurrency.model.Color;
import H_concurrency.model.Piece;
import H_concurrency.model.PieceType;

public class PieceFactory {
    public Piece create(PieceType type, Color color) {
        return new Piece(type, color);
    }
}





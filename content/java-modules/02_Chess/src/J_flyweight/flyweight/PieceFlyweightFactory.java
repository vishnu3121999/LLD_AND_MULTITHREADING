package J_flyweight.flyweight;

import J_flyweight.model.Color;
import J_flyweight.model.Piece;
import J_flyweight.model.PieceType;

import java.util.EnumMap;
import java.util.Map;

public final class PieceFlyweightFactory {
    private static final Map<PieceType, Map<Color, Piece>> PIECES = createPieces();

    private PieceFlyweightFactory() {
    }

    public static Piece getPiece(PieceType type, Color color) {
        return PIECES.get(type).get(color);
    }

    private static Map<PieceType, Map<Color, Piece>> createPieces() {
        Map<PieceType, Map<Color, Piece>> pieces = new EnumMap<>(PieceType.class);
        for (PieceType type : PieceType.values()) {
            Map<Color, Piece> piecesByColor = new EnumMap<>(Color.class);
            for (Color color : Color.values()) {
                piecesByColor.put(color, new Piece(type, color));
            }
            pieces.put(type, piecesByColor);
        }
        return pieces;
    }
}

package H_concurrency.model;

public class Piece {
    private final PieceType type;
    private final Color color;

    public Piece(PieceType type, Color color) {
        this.type = type;
        this.color = color;
    }

    public PieceType getType() {
        return type;
    }

    public Color getColor() {
        return color;
    }

    public String symbol() {
        String value = type == PieceType.KNIGHT ? "N" : type.name().substring(0, 1);
        return color == Color.WHITE ? value : value.toLowerCase();
    }
}





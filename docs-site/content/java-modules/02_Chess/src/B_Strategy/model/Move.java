package B_Strategy.model;

public class Move {
    private final Player player;
    private final Position from;
    private final Position to;

    public Move(Player player, Position from, Position to) {
        this.player = player;
        this.from = from;
        this.to = to;
    }

    public Player getPlayer() {
        return player;
    }

    public Position getFrom() {
        return from;
    }

    public Position getTo() {
        return to;
    }

    public int rowDelta() {
        return to.getRow() - from.getRow();
    }

    public int colDelta() {
        return to.getCol() - from.getCol();
    }
}

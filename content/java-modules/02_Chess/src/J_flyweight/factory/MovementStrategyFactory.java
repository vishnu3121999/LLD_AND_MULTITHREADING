package J_flyweight.factory;

import J_flyweight.model.PieceType;
import J_flyweight.movement.KingMovementStrategy;
import J_flyweight.movement.KnightMovementStrategy;
import J_flyweight.movement.LineMovementStrategy;
import J_flyweight.movement.MovementStrategy;
import J_flyweight.movement.PawnMovementStrategy;

public class MovementStrategyFactory {
    public MovementStrategy getStrategy(PieceType type) {
        switch (type) {
            case KING:
                return new KingMovementStrategy();
            case QUEEN:
                return new LineMovementStrategy(true, true);
            case ROOK:
                return new LineMovementStrategy(true, false);
            case BISHOP:
                return new LineMovementStrategy(false, true);
            case KNIGHT:
                return new KnightMovementStrategy();
            case PAWN:
                return new PawnMovementStrategy();
            default:
                throw new IllegalArgumentException("Unsupported piece type: " + type);
        }
    }
}






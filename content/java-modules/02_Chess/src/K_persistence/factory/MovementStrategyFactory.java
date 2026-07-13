package K_persistence.factory;

import K_persistence.model.PieceType;
import K_persistence.movement.KingMovementStrategy;
import K_persistence.movement.KnightMovementStrategy;
import K_persistence.movement.LineMovementStrategy;
import K_persistence.movement.MovementStrategy;
import K_persistence.movement.PawnMovementStrategy;

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






package F_COR.factory;

import F_COR.model.PieceType;
import F_COR.movement.KingMovementStrategy;
import F_COR.movement.KnightMovementStrategy;
import F_COR.movement.LineMovementStrategy;
import F_COR.movement.MovementStrategy;
import F_COR.movement.PawnMovementStrategy;

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



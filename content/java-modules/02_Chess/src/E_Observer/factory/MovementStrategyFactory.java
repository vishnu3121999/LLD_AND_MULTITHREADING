package E_Observer.factory;

import E_Observer.model.PieceType;
import E_Observer.movement.KingMovementStrategy;
import E_Observer.movement.KnightMovementStrategy;
import E_Observer.movement.LineMovementStrategy;
import E_Observer.movement.MovementStrategy;
import E_Observer.movement.PawnMovementStrategy;

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


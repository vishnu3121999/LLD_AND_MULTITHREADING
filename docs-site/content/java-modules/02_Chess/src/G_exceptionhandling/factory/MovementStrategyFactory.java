package G_exceptionhandling.factory;

import G_exceptionhandling.model.PieceType;
import G_exceptionhandling.movement.KingMovementStrategy;
import G_exceptionhandling.movement.KnightMovementStrategy;
import G_exceptionhandling.movement.LineMovementStrategy;
import G_exceptionhandling.movement.MovementStrategy;
import G_exceptionhandling.movement.PawnMovementStrategy;

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




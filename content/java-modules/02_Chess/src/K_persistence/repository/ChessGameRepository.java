package K_persistence.repository;

import K_persistence.entity.ChessGameEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChessGameRepository extends JpaRepository<ChessGameEntity, String> {
}

package H_persistance.repository;

import H_persistance.entity.TicTacToeGameSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicTacToeGameSnapshotRepository extends JpaRepository<TicTacToeGameSnapshot, String> {
}

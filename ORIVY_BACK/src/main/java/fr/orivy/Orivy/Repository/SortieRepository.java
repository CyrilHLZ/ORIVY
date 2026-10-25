package fr.orivy.Orivy.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import fr.orivy.Orivy.Model.Sortie;

public interface SortieRepository extends JpaRepository<Sortie, Long> {
}

package fr.orivy.Orivy.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import fr.orivy.Orivy.Model.Sortie;
import java.util.List;

public interface SortieRepository extends JpaRepository<Sortie, Long> {

    List<Sortie> findByOrganisateurId(Long id);
    List<Sortie> findByParticipantsId(Long id);

}

package fr.orivy.Orivy.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.orivy.Orivy.Model.Promenade;

public interface PromenadeRepository extends JpaRepository<Promenade, Long> {
}
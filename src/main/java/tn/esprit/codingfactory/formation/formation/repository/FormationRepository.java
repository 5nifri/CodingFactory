package tn.esprit.codingfactory.formation.formation.repository;

import tn.esprit.codingfactory.formation.formation.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormationRepository extends JpaRepository<Formation, Long> {
    List<Formation> findByPublishedTrue();
    List<Formation> findByCategoryId(Long categoryId);
}

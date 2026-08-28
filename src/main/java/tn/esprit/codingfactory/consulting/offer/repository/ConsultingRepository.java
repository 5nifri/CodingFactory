// offer/repository/ConsultingRepository.java
package tn.esprit.codingfactory.consulting.offer.repository;

import tn.esprit.codingfactory.consulting.offer.entity.Consulting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultingRepository extends JpaRepository<Consulting, Long> {
}
package tn.esprit.codingfactory.consulting.request.repository;

import tn.esprit.codingfactory.consulting.request.entity.ConsultationRequest;
import tn.esprit.codingfactory.consulting.request.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConsultationRequestRepository extends JpaRepository<ConsultationRequest, Long> {

    @Query("SELECT DISTINCT r FROM ConsultationRequest r JOIN FETCH r.user JOIN FETCH r.consulting WHERE r.user.id = :userId")
    List<ConsultationRequest> findByUserId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT r FROM ConsultationRequest r JOIN FETCH r.user JOIN FETCH r.consulting")
    List<ConsultationRequest> findAllWithDetails();

    List<ConsultationRequest> findByStatus(RequestStatus status);

    @Query("SELECT DISTINCT r FROM ConsultationRequest r JOIN FETCH r.user JOIN FETCH r.consulting WHERE r.consulting.id = :consultingId")
    List<ConsultationRequest> findByConsultingId(@Param("consultingId") Long consultingId);

    boolean existsByConsultingId(Long consultingId);
}

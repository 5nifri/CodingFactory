package tn.esprit.codingfactory.formation.enrollment.repository;

import tn.esprit.codingfactory.formation.enrollment.entity.Enrollment;
import tn.esprit.codingfactory.formation.enrollment.entity.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    boolean existsByStudentIdAndFormationId(Long studentId, Long formationId);

    Optional<Enrollment> findByStudentIdAndFormationId(Long studentId, Long formationId);

    List<Enrollment> findByStudentId(Long studentId);

    List<Enrollment> findByStudentIdAndStatus(Long studentId, EnrollmentStatus status);

    /**
     * Active (non-cancelled) enrollment count per formation, used for
     * "most popular" sorting in the formation catalog search. Returns
     * [formationId, count] pairs rather than a Map directly — JPQL can't
     * project into a Map, so the service layer converts this into a
     * lookup map itself.
     */
    @Query("""
        SELECT e.formation.id, COUNT(e)
        FROM Enrollment e
        WHERE e.status <> tn.esprit.codingfactory.formation.enrollment.entity.EnrollmentStatus.CANCELLED
        GROUP BY e.formation.id
        """)
    List<Object[]> countActiveEnrollmentsGroupedByFormation();
}
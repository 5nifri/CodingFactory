package tn.esprit.codingfactory.formation.enrollment.repository;

import tn.esprit.codingfactory.formation.enrollment.entity.Enrollment;
import tn.esprit.codingfactory.formation.enrollment.entity.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    boolean existsByStudentIdAndFormationId(Long studentId, Long formationId);

    Optional<Enrollment> findByStudentIdAndFormationId(Long studentId, Long formationId);

    List<Enrollment> findByStudentId(Long studentId);

    List<Enrollment> findByStudentIdAndStatus(Long studentId, EnrollmentStatus status);
}
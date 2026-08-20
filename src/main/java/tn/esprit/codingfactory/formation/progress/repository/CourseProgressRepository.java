package tn.esprit.codingfactory.formation.progress.repository;

import tn.esprit.codingfactory.formation.progress.entity.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {

    Optional<CourseProgress> findByEnrollmentIdAndCourseId(Long enrollmentId, Long courseId);

    List<CourseProgress> findByEnrollmentId(Long enrollmentId);

    long countByEnrollmentIdAndCompletedTrue(Long enrollmentId);
}
package tn.esprit.codingfactory.formation.course.repository;

import tn.esprit.codingfactory.formation.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByFormationIdOrderByOrderIndexAsc(Long formationId);

}



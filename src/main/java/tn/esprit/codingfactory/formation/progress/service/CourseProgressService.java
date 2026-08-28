package tn.esprit.codingfactory.formation.progress.service;

import tn.esprit.codingfactory.formation.course.entity.Course;
import tn.esprit.codingfactory.formation.course.repository.CourseRepository;
import tn.esprit.codingfactory.formation.enrollment.entity.Enrollment;
import tn.esprit.codingfactory.formation.enrollment.entity.EnrollmentStatus;
import tn.esprit.codingfactory.formation.enrollment.repository.EnrollmentRepository;
import tn.esprit.codingfactory.formation.progress.dto.ProgressResponse;
import tn.esprit.codingfactory.formation.progress.entity.CourseProgress;
import tn.esprit.codingfactory.formation.progress.repository.CourseProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseProgressService {

    private final CourseProgressRepository progressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public CourseProgress completeCourse(Long studentId, Long courseId) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndFormationId(studentId, course.getFormation().getId())
                .orElseThrow(() -> new RuntimeException("Student is not enrolled in this formation"));

        CourseProgress progress = progressRepository
                .findByEnrollmentIdAndCourseId(enrollment.getId(), courseId)
                .orElseGet(() -> CourseProgress.builder()
                        .enrollment(enrollment)
                        .course(course)
                        .build());

        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        progress.setLastAccessedAt(LocalDateTime.now());

        CourseProgress saved = progressRepository.save(progress);

        // recalculate and possibly mark the enrollment COMPLETED
        calculateAndUpdateProgress(enrollment);

        return saved;
    }

    @Transactional(readOnly = true)
    public double calculateProgress(Long enrollmentId) {

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        int totalCourses = enrollment.getFormation().getCourses().size();
        if (totalCourses == 0) return 0.0;

        long completedCourses = progressRepository
                .countByEnrollmentIdAndCompletedTrue(enrollmentId);

        return Math.round((completedCourses * 10000.0) / totalCourses) / 100.0;
    }

    @Transactional
    public double calculateAndUpdateProgress(Enrollment enrollment) {

        int totalCourses = enrollment.getFormation().getCourses().size();
        if (totalCourses == 0) return 0.0;

        long completedCourses = progressRepository
                .countByEnrollmentIdAndCompletedTrue(enrollment.getId());

        double progress = Math.round((completedCourses * 10000.0) / totalCourses) / 100.0;

        if (completedCourses == totalCourses
                && enrollment.getStatus() != EnrollmentStatus.COMPLETED) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            enrollmentRepository.save(enrollment);
        }

        return progress;
    }

    @Transactional(readOnly = true)
    public double getMyProgress(Long studentId, Long enrollmentId) {

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (!enrollment.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("You cannot access this enrollment");
        }

        return calculateProgress(enrollmentId);
    }

    @Transactional
    public ProgressResponse completeCourseAndGetStatus(Long studentId, Long courseId) {
        CourseProgress progress = completeCourse(studentId, courseId);
        double formationProgress = calculateProgress(progress.getEnrollment().getId());

        return ProgressResponse.builder()
                .enrollmentId(progress.getEnrollment().getId())
                .courseId(progress.getCourse().getId())
                .courseTitle(progress.getCourse().getTitle())
                .completed(progress.getCompleted())
                .formationProgress(formationProgress)
                .build();
    }

    @Transactional(readOnly = true)
    public List<Long> getCompletedCourseIds(Long studentId, Long enrollmentId) {

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (!enrollment.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("You cannot access this enrollment");
        }

        return progressRepository.findByEnrollmentIdAndCompletedTrue(enrollmentId)
                .stream()
                .map(cp -> cp.getCourse().getId())
                .toList();
    }
}
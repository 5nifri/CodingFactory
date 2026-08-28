package tn.esprit.codingfactory.formation.enrollment.service;

import tn.esprit.codingfactory.formation.enrollment.dto.EnrollmentResponse;
import tn.esprit.codingfactory.formation.enrollment.entity.Enrollment;
import tn.esprit.codingfactory.formation.enrollment.entity.EnrollmentStatus;
import tn.esprit.codingfactory.formation.enrollment.repository.EnrollmentRepository;
import tn.esprit.codingfactory.formation.formation.entity.Formation;
import tn.esprit.codingfactory.formation.formation.repository.FormationRepository;
import tn.esprit.codingfactory.formation.progress.service.CourseProgressService;
import tn.esprit.codingfactory.user.entity.Role;
import tn.esprit.codingfactory.user.entity.User;
import tn.esprit.codingfactory.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final FormationRepository formationRepository;
    private final UserRepository userRepository;
    private final CourseProgressService courseProgressService;

    @Transactional
    public EnrollmentResponse enroll(Long studentId, Long formationId) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only students can enroll in formations");
        }

        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found"));

        if (!Boolean.TRUE.equals(formation.getPublished())) {
            throw new RuntimeException("This formation is not available");
        }

        Optional<Enrollment> existing =
                enrollmentRepository.findByStudentIdAndFormationId(studentId, formationId);

        if (existing.isPresent()) {
            Enrollment enrollment = existing.get();

            if (enrollment.getStatus() == EnrollmentStatus.ACTIVE) {
                throw new RuntimeException("Already enrolled in this formation");
            }

            // Re-activate a previously cancelled enrollment
            enrollment.setStatus(EnrollmentStatus.ACTIVE);
            return toResponse(enrollmentRepository.save(enrollment));
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .formation(formation)
                .status(EnrollmentStatus.ACTIVE)
                .build();

        return toResponse(enrollmentRepository.save(enrollment));
    }

    @Transactional
    public void unenroll(Long studentId, Long formationId) {
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndFormationId(studentId, formationId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (enrollment.getStatus() != EnrollmentStatus.ACTIVE) {
            throw new RuntimeException("This enrollment is not active");
        }

        enrollment.setStatus(EnrollmentStatus.CANCELLED);
        enrollmentRepository.save(enrollment);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .toList();
    }

    private EnrollmentResponse toResponse(Enrollment e) {
        double progress = courseProgressService.calculateProgress(e.getId());

        return EnrollmentResponse.builder()
                .id(e.getId())
                .formationId(e.getFormation().getId())
                .formationTitle(e.getFormation().getTitle())
                .enrolledAt(e.getEnrolledAt())
                .status(e.getStatus())
                .progress(progress)
                .build();
    }
}
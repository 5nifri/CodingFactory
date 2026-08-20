package tn.esprit.codingfactory.formation.enrollment.service;

import tn.esprit.codingfactory.formation.enrollment.entity.Enrollment;
import tn.esprit.codingfactory.formation.enrollment.entity.EnrollmentStatus;
import tn.esprit.codingfactory.formation.enrollment.repository.EnrollmentRepository;
import tn.esprit.codingfactory.formation.formation.entity.Formation;
import tn.esprit.codingfactory.formation.formation.repository.FormationRepository;
import tn.esprit.codingfactory.user.entity.Role;
import tn.esprit.codingfactory.user.entity.User;
import tn.esprit.codingfactory.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final FormationRepository formationRepository;
    private final UserRepository userRepository;

    @Transactional
    public Enrollment enroll(Long studentId, Long formationId) {

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

        if (enrollmentRepository.existsByStudentIdAndFormationId(studentId, formationId)) {
            throw new RuntimeException("Already enrolled in this formation");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .formation(formation)
                .status(EnrollmentStatus.ACTIVE)
                .build();

        return enrollmentRepository.save(enrollment);
    }

    @Transactional(readOnly = true)
    public List<Enrollment> getMyEnrollments(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }
}
package tn.esprit.codingfactory.formation.enrollment.controller;

import tn.esprit.codingfactory.formation.enrollment.dto.EnrollmentResponse;
import tn.esprit.codingfactory.formation.enrollment.service.EnrollmentService;
import tn.esprit.codingfactory.user.entity.User;
import tn.esprit.codingfactory.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;

    @PostMapping("/formation/{formationId}")
    public ResponseEntity<EnrollmentResponse> enroll(
            @PathVariable Long formationId,
            Authentication authentication
    ) {
        User student = currentUser(authentication);
        return ResponseEntity.ok(enrollmentService.enroll(student.getId(), formationId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments(Authentication authentication) {
        User student = currentUser(authentication);
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(student.getId()));
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
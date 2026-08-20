package tn.esprit.codingfactory.formation.progress.controller;

import tn.esprit.codingfactory.formation.progress.entity.CourseProgress;
import tn.esprit.codingfactory.formation.progress.service.CourseProgressService;
import tn.esprit.codingfactory.user.entity.User;
import tn.esprit.codingfactory.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class CourseProgressController {

    private final CourseProgressService progressService;
    private final UserRepository userRepository;

    @PostMapping("/courses/{courseId}/complete")
    public ResponseEntity<CourseProgress> completeCourse(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        User student = currentUser(authentication);
        return ResponseEntity.ok(progressService.completeCourse(student.getId(), courseId));
    }

    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<Double> getProgress(
            @PathVariable Long enrollmentId,
            Authentication authentication
    ) {
        User student = currentUser(authentication);
        return ResponseEntity.ok(progressService.getMyProgress(student.getId(), enrollmentId));
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
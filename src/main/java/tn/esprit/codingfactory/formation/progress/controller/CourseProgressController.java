package tn.esprit.codingfactory.formation.progress.controller;

import tn.esprit.codingfactory.formation.progress.dto.ProgressResponse;
import tn.esprit.codingfactory.formation.progress.service.CourseProgressService;
import tn.esprit.codingfactory.user.entity.User;
import tn.esprit.codingfactory.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class CourseProgressController {

    private final CourseProgressService progressService;
    private final UserRepository userRepository;

    @PostMapping("/courses/{courseId}/complete")
    public ResponseEntity<ProgressResponse> completeCourse(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        User student = currentUser(authentication);
        return ResponseEntity.ok(progressService.completeCourseAndGetStatus(student.getId(), courseId));
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

    @GetMapping("/enrollment/{enrollmentId}/completed")
    public ResponseEntity<List<Long>> getCompletedCourseIds(
            @PathVariable Long enrollmentId,
            Authentication authentication
    ) {
        User student = currentUser(authentication);
        return ResponseEntity.ok(
                progressService.getCompletedCourseIds(student.getId(), enrollmentId)
        );
    }
}
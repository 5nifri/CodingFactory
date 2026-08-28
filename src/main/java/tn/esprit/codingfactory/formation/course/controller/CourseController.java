// course/controller/CourseController.java
package tn.esprit.codingfactory.formation.course.controller;

import tn.esprit.codingfactory.formation.course.dto.CourseRequest;
import tn.esprit.codingfactory.formation.course.dto.CourseResponse;
import tn.esprit.codingfactory.formation.course.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/api/formations/{formationId}/courses")
    public ResponseEntity<List<CourseResponse>> getByFormation(@PathVariable Long formationId) {
        return ResponseEntity.ok(courseService.getByFormation(formationId));
    }

    @PostMapping("/api/formations/{formationId}/courses")
    public ResponseEntity<CourseResponse> create(@PathVariable Long formationId, @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.create(formationId, request));
    }

    @PutMapping("/api/courses/{courseId}")
    public ResponseEntity<CourseResponse> update(@PathVariable Long courseId, @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.update(courseId, request));
    }

    @DeleteMapping("/api/courses/{courseId}")
    public ResponseEntity<Void> delete(@PathVariable Long courseId) {
        courseService.delete(courseId);
        return ResponseEntity.noContent().build();
    }


}
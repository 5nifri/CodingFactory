package tn.esprit.codingfactory.formation.course.service;

import org.springframework.http.HttpStatus;
import tn.esprit.codingfactory.common.exception.ApiException;
import tn.esprit.codingfactory.formation.course.dto.CourseRequest;
import tn.esprit.codingfactory.formation.course.dto.CourseResponse;
import tn.esprit.codingfactory.formation.course.entity.Course;
import tn.esprit.codingfactory.formation.course.repository.CourseRepository;
import tn.esprit.codingfactory.formation.formation.entity.Formation;
import tn.esprit.codingfactory.formation.formation.repository.FormationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final FormationRepository formationRepository;

    @Transactional
    public CourseResponse create(Long formationId, CourseRequest request) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new ApiException("Formation not found", HttpStatus.NOT_FOUND));

        // Compute next order index
        Integer maxOrder = courseRepository.findByFormationIdOrderByOrderIndexAsc(formationId)
                .stream()
                .map(Course::getOrderIndex)
                .max(Integer::compareTo)
                .orElse(0);
        int nextOrder = maxOrder + 1;

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .orderIndex(nextOrder)   // override with computed value
                .videoUrl(request.getVideoUrl())
                .materialUrl(request.getMaterialUrl())
                .duration(request.getDuration())
                .formation(formation)
                .build();

        return toResponse(courseRepository.save(course));
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getByFormation(Long formationId) {
        return courseRepository.findByFormationIdOrderByOrderIndexAsc(formationId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CourseResponse update(Long courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException("Course not found", HttpStatus.NOT_FOUND));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        // Do NOT change orderIndex – keep the existing one
        // course.setOrderIndex(request.getOrderIndex());  // remove this line
        course.setVideoUrl(request.getVideoUrl());
        course.setMaterialUrl(request.getMaterialUrl());
        course.setDuration(request.getDuration());

        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public void delete(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException("Course not found", HttpStatus.NOT_FOUND));

        Long formationId = course.getFormation().getId();
        courseRepository.delete(course);

        // Reorder remaining courses of the same formation
        List<Course> remaining = courseRepository.findByFormationIdOrderByOrderIndexAsc(formationId);
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setOrderIndex(i + 1);
        }
        courseRepository.saveAll(remaining);
    }

    private CourseResponse toResponse(Course c) {
        return CourseResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .orderIndex(c.getOrderIndex())
                .videoUrl(c.getVideoUrl())
                .materialUrl(c.getMaterialUrl())
                .duration(c.getDuration())
                .build();
    }

    @Transactional
    public void reorder(Long formationId, List<Long> courseIds) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new ApiException("Formation not found", HttpStatus.NOT_FOUND));

        List<Course> courses = courseRepository.findByFormationIdOrderByOrderIndexAsc(formationId);

        for (int i = 0; i < courseIds.size(); i++) {
            Long courseId = courseIds.get(i);
            Course course = courses.stream()
                    .filter(c -> c.getId().equals(courseId))
                    .findFirst()
                    .orElseThrow(() -> new ApiException("Course not found: " + courseId, HttpStatus.NOT_FOUND));
            course.setOrderIndex(i + 1);
        }


        courseRepository.saveAll(courses);
    }

    @Transactional(readOnly = true)
    public CourseResponse getById(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException("Course not found", HttpStatus.NOT_FOUND));
        return toResponse(course);
    }

}
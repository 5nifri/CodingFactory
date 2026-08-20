package tn.esprit.codingfactory.formation.course.service;

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
                .orElseThrow(() -> new RuntimeException("Formation not found"));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .orderIndex(request.getOrderIndex())
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
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setOrderIndex(request.getOrderIndex());
        course.setVideoUrl(request.getVideoUrl());
        course.setMaterialUrl(request.getMaterialUrl());
        course.setDuration(request.getDuration());

        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public void delete(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        courseRepository.delete(course);
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
}
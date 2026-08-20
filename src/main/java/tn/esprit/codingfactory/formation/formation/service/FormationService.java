package tn.esprit.codingfactory.formation.formation.service;

import tn.esprit.codingfactory.formation.category.entity.Category;
import tn.esprit.codingfactory.formation.category.repository.CategoryRepository;
import tn.esprit.codingfactory.formation.formation.dto.FormationRequest;
import tn.esprit.codingfactory.formation.formation.dto.FormationResponse;
import tn.esprit.codingfactory.formation.formation.entity.Formation;
import tn.esprit.codingfactory.formation.formation.repository.FormationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FormationService {

    private final FormationRepository formationRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public FormationResponse create(FormationRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Formation formation = Formation.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .duration(request.getDuration())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .published(request.getPublished() != null ? request.getPublished() : false)
                .category(category)
                .build();

        return toResponse(formationRepository.save(formation));
    }

    @Transactional(readOnly = true)
    public List<FormationResponse> getAllPublished() {
        return formationRepository.findByPublishedTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FormationResponse> getAllForAdmin() {
        return formationRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FormationResponse getById(Long id) {
        return toResponse(formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation not found")));
    }

    @Transactional
    public FormationResponse update(Long id, FormationRequest request) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        formation.setTitle(request.getTitle());
        formation.setDescription(request.getDescription());
        formation.setDuration(request.getDuration());
        formation.setPrice(request.getPrice());
        formation.setImageUrl(request.getImageUrl());
        if (request.getPublished() != null) {
            formation.setPublished(request.getPublished());
        }
        formation.setCategory(category);

        return toResponse(formationRepository.save(formation));
    }

    @Transactional
    public void delete(Long id) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation not found"));
        formationRepository.delete(formation);
    }

    private FormationResponse toResponse(Formation f) {
        return FormationResponse.builder()
                .id(f.getId())
                .title(f.getTitle())
                .description(f.getDescription())
                .duration(f.getDuration())
                .price(f.getPrice())
                .imageUrl(f.getImageUrl())
                .published(f.getPublished())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .categoryId(f.getCategory().getId())
                .categoryName(f.getCategory().getName())
                .totalCourses(f.getCourses().size())
                .build();
    }
}
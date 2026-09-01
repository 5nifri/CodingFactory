package tn.esprit.codingfactory.formation.formation.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.codingfactory.formation.category.entity.Category;
import tn.esprit.codingfactory.formation.enrollment.repository.EnrollmentRepository;
import tn.esprit.codingfactory.formation.formation.dto.FormationPageResponse;
import tn.esprit.codingfactory.formation.formation.dto.FormationResponse;
import tn.esprit.codingfactory.formation.formation.entity.Formation;
import tn.esprit.codingfactory.formation.formation.repository.FormationRepository;
import tn.esprit.codingfactory.formation.formation.repository.FormationSpecifications;
import tn.esprit.codingfactory.ml.dto.MLCategoryScore;
import tn.esprit.codingfactory.ml.dto.MLPredictResponse;
import tn.esprit.codingfactory.ml.entity.MLCategoryCode;
import tn.esprit.codingfactory.ml.service.MLRecommendationService;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FormationSearchService {

    private final FormationRepository formationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final MLRecommendationService recommendationService;

    public enum SortMode {
        RECENT, POPULAR, RECOMMENDED
    }

    /**
     * Full catalog search: text search + category filter + sort mode +
     * pagination. "recent" is sorted at the DB level; "popular" and
     * "recommended" require in-memory sorting since they depend on
     * aggregate enrollment counts / per-student ML scores that aren't
     * plain formation columns — see class-level note in the repository.
     *
     * studentId is null for guests or when the caller has no
     * authenticated student context; RECOMMENDED silently falls back to
     * RECENT in that case (there's no per-student signal to sort by).
     */
    public FormationPageResponse search(
            String searchText,
            Long categoryId,
            SortMode sortMode,
            int page,
            int size,
            Long studentId
    ) {
        List<Formation> matching = formationRepository.findAll(
                FormationSpecifications.search(searchText, categoryId)
        );

        List<Formation> sorted = switch (sortMode) {
            case RECENT -> sortByRecent(matching);
            case POPULAR -> sortByPopularity(matching);
            case RECOMMENDED -> sortByRecommended(matching, studentId);
        };

        int totalElements = sorted.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);
        List<Formation> pageContent = sorted.subList(fromIndex, toIndex);

        List<FormationResponse> responses = pageContent.stream()
                .map(this::toResponse)
                .toList();

        return FormationPageResponse.builder()
                .formations(responses)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .build();
    }

    private List<Formation> sortByRecent(List<Formation> formations) {
        return formations.stream()
                .sorted(Comparator.comparing(Formation::getCreatedAt).reversed())
                .toList();
    }

    private List<Formation> sortByPopularity(List<Formation> formations) {
        Map<Long, Long> countsByFormationId = new HashMap<>();
        for (Object[] row : enrollmentRepository.countActiveEnrollmentsGroupedByFormation()) {
            Long formationId = (Long) row[0];
            Long count = (Long) row[1];
            countsByFormationId.put(formationId, count);
        }

        return formations.stream()
                .sorted(Comparator.comparing(
                        (Formation f) -> countsByFormationId.getOrDefault(f.getId(), 0L)
                ).reversed())
                .toList();
    }

    private List<Formation> sortByRecommended(List<Formation> formations, Long studentId) {
        if (studentId == null) {
            log.info("RECOMMENDED sort requested with no student context, falling back to RECENT");
            return sortByRecent(formations);
        }

        MLPredictResponse mlResponse;
        try {
            mlResponse = recommendationService.getRawPrediction(studentId);
        } catch (Exception e) {
            log.warn("ML prediction unavailable for recommended sort, falling back to RECENT: {}", e.getMessage());
            return sortByRecent(formations);
        }

        if (mlResponse == null || !mlResponse.isAvailable() || mlResponse.getRecommendations().isEmpty()) {
            return sortByRecent(formations);
        }

        // category code -> score, so we can rank each formation by its
        // own category's predicted score
        Map<MLCategoryCode, Double> scoreByCategory = new HashMap<>();
        for (MLCategoryScore score : mlResponse.getRecommendations()) {
            try {
                scoreByCategory.put(MLCategoryCode.valueOf(score.getCategory()), score.getScore());
            } catch (IllegalArgumentException e) {
                log.warn("Unknown ML category in recommended sort: {}", score.getCategory());
            }
        }

        return formations.stream()
                .sorted(Comparator.comparing(
                        (Formation f) -> scoreOf(f, scoreByCategory)
                ).reversed())
                .toList();
    }

    private double scoreOf(Formation formation, Map<MLCategoryCode, Double> scoreByCategory) {
        Category category = formation.getCategory();
        if (category == null || category.getMlCategoryCode() == null) {
            return 0.0;
        }
        return scoreByCategory.getOrDefault(category.getMlCategoryCode(), 0.0);
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
package tn.esprit.codingfactory.ml.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import tn.esprit.codingfactory.formation.category.entity.Category;
import tn.esprit.codingfactory.formation.category.repository.CategoryRepository;
import tn.esprit.codingfactory.formation.enrollment.entity.Enrollment;
import tn.esprit.codingfactory.formation.enrollment.entity.EnrollmentStatus;
import tn.esprit.codingfactory.formation.enrollment.repository.EnrollmentRepository;
import tn.esprit.codingfactory.formation.formation.entity.Formation;
import tn.esprit.codingfactory.ml.dto.*;
import tn.esprit.codingfactory.ml.entity.MLCategoryCode;
import tn.esprit.codingfactory.user.entity.User;
import tn.esprit.codingfactory.user.repository.UserRepository;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MLRecommendationService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CategoryRepository categoryRepository;

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    private RestClient restClient() {
        return RestClient.builder().baseUrl(mlServiceUrl).build();
    }

    public RecommendationResponse getRecommendations(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Set<MLCategoryCode> interestFlags = buildBlendedInterestFlags(student);

        if (interestFlags.isEmpty()) {
            // No signal at all: neither registered interests nor enrollment
            // history give us anything to work with. Do not call the ML
            // service — mirrors the cold-start guard in FastAPI itself,
            // and avoids a pointless network call.
            return RecommendationResponse.builder().available(false).build();
        }

        MLPredictResponse mlResponse = callMLService(interestFlags);

        if (mlResponse == null || !mlResponse.isAvailable() || mlResponse.getRecommendations().isEmpty()) {
            return RecommendationResponse.builder().available(false).build();
        }

        List<RecommendedFormationDTO> formations = resolveFormations(mlResponse.getRecommendations());

        return RecommendationResponse.builder()
                .available(!formations.isEmpty())
                .formations(formations)
                .build();
    }

    /**
     * Exposes the raw, unresolved ML prediction (category + score pairs,
     * before mapping to Formation records) for callers that need to rank
     * by score themselves rather than get a ready-made formation list —
     * e.g. FormationSearchService's "recommended" catalog sort.
     * Returns null on cold-start (no interest signal) or if the ML
     * service call fails, same fail-soft contract as getRecommendations().
     */
    public MLPredictResponse getRawPrediction(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Set<MLCategoryCode> interestFlags = buildBlendedInterestFlags(student);

        if (interestFlags.isEmpty()) {
            return null;
        }

        return callMLService(interestFlags);
    }

    private MLPredictResponse callMLService(Set<MLCategoryCode> interestFlags) {
        MLPredictRequest request = toPredictRequest(interestFlags);

        try {
            return restClient()
                    .post()
                    .uri("/predict")
                    .body(request)
                    .retrieve()
                    .body(MLPredictResponse.class);
        } catch (RestClientException e) {
            // ML service down/unreachable: fail soft, not hard. Callers
            // should not break just because the Python service is offline.
            log.warn("ML service call failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Union of registered interests and categories the student has
     * actively enrolled in (any status except CANCELLED). Enrollment
     * history is treated as at least as strong a signal as a stated
     * interest, so it's a simple set union rather than a weighted blend.
     */
    private Set<MLCategoryCode> buildBlendedInterestFlags(User student) {
        Set<MLCategoryCode> flags = EnumSet.noneOf(MLCategoryCode.class);

        if (student.getInterests() != null) {
            flags.addAll(student.getInterests());
        }

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        for (Enrollment enrollment : enrollments) {
            if (enrollment.getStatus() == EnrollmentStatus.CANCELLED) {
                continue;
            }
            Formation formation = enrollment.getFormation();
            if (formation == null || formation.getCategory() == null) {
                continue;
            }
            MLCategoryCode code = formation.getCategory().getMlCategoryCode();
            if (code != null) {
                flags.add(code);
            }
        }

        return flags;
    }

    private MLPredictRequest toPredictRequest(Set<MLCategoryCode> flags) {
        return MLPredictRequest.builder()
                .interest_development(flags.contains(MLCategoryCode.DEVELOPMENT))
                .interest_mobile(flags.contains(MLCategoryCode.MOBILE))
                .interest_data_science(flags.contains(MLCategoryCode.DATA_SCIENCE))
                .interest_ai(flags.contains(MLCategoryCode.AI))
                .interest_devops(flags.contains(MLCategoryCode.DEVOPS))
                .interest_cybersecurity(flags.contains(MLCategoryCode.CYBERSECURITY))
                .interest_erp(flags.contains(MLCategoryCode.ERP))
                .build();
    }

    /**
     * Resolves each ML-predicted category (with its confidence score) into
     * actual published Formations, via any Category rows mapped to that
     * code. Categories with no mlCategoryCode mapping, or with zero
     * published formations, are silently skipped rather than surfaced as
     * an error — this is expected while the admin is still setting up
     * category mappings (see Category.mlCategoryCode).
     *
     * Formations are capped at 3 per predicted category to keep the
     * recommendation section compact, ordered by the category's score
     * (highest-confidence category's formations shown first).
     */
    private List<RecommendedFormationDTO> resolveFormations(List<MLCategoryScore> scores) {
        return scores.stream()
                .flatMap(score -> resolveForCategory(score).stream())
                .collect(Collectors.toList());
    }

    private List<RecommendedFormationDTO> resolveForCategory(MLCategoryScore score) {
        MLCategoryCode code;
        try {
            code = MLCategoryCode.valueOf(score.getCategory());
        } catch (IllegalArgumentException e) {
            log.warn("ML service returned unknown category code: {}", score.getCategory());
            return List.of();
        }

        List<Category> matchingCategories = categoryRepository.findByMlCategoryCode(code);

        return matchingCategories.stream()
                .flatMap(category -> category.getFormations().stream())
                .filter(Formation::getPublished)
                .limit(3)
                .map(formation -> RecommendedFormationDTO.builder()
                        .formationId(formation.getId())
                        .title(formation.getTitle())
                        .imageUrl(formation.getImageUrl())
                        .categoryName(formation.getCategory().getName())
                        .matchScore(score.getScore())
                        .build())
                .collect(Collectors.toList());
    }
}
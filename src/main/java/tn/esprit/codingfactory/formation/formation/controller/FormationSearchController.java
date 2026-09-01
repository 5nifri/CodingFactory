package tn.esprit.codingfactory.formation.formation.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.codingfactory.formation.formation.dto.FormationPageResponse;
import tn.esprit.codingfactory.formation.formation.service.FormationSearchService;
import tn.esprit.codingfactory.user.entity.User;
import tn.esprit.codingfactory.user.repository.UserRepository;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
public class FormationSearchController {

    private final FormationSearchService formationSearchService;
    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<FormationPageResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "RECENT") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            Authentication authentication
    ) {
        FormationSearchService.SortMode sortMode = parseSortMode(sort);
        Long studentId = resolveStudentId(authentication);

        FormationPageResponse response = formationSearchService.search(
                q, categoryId, sortMode, page, size, studentId
        );

        return ResponseEntity.ok(response);
    }

    private FormationSearchService.SortMode parseSortMode(String sort) {
        try {
            return FormationSearchService.SortMode.valueOf(sort.toUpperCase());
        } catch (IllegalArgumentException e) {
            return FormationSearchService.SortMode.RECENT;
        }
    }

    /**
     * This endpoint is public (guests can browse/search), so
     * Authentication may be null or anonymous. Returns null in that
     * case — FormationSearchService treats a null studentId as "no
     * personalization available" and falls back to RECENT for the
     * RECOMMENDED sort mode.
     */
    private Long resolveStudentId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElse(null);
    }
}
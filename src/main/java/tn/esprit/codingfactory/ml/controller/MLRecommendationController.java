package tn.esprit.codingfactory.ml.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.codingfactory.ml.dto.RecommendationResponse;
import tn.esprit.codingfactory.ml.service.MLRecommendationService;
import tn.esprit.codingfactory.user.entity.User;
import tn.esprit.codingfactory.user.repository.UserRepository;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class MLRecommendationController {

    private final MLRecommendationService recommendationService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<RecommendationResponse> getMyRecommendations(Authentication authentication) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(recommendationService.getRecommendations(currentUser.getId()));
    }
}

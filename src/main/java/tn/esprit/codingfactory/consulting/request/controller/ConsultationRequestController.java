// request/controller/ConsultationRequestController.java
package tn.esprit.codingfactory.consulting.request.controller;

import tn.esprit.codingfactory.common.exception.ApiException;
import tn.esprit.codingfactory.consulting.request.dto.ConsultationRequestCreate;
import tn.esprit.codingfactory.consulting.request.dto.ConsultationRequestResponse;
import tn.esprit.codingfactory.consulting.request.dto.StatusUpdateRequest;
import tn.esprit.codingfactory.consulting.request.service.ConsultationRequestService;
import tn.esprit.codingfactory.user.entity.User;
import tn.esprit.codingfactory.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consulting-requests")
@RequiredArgsConstructor
public class ConsultationRequestController {

    private final ConsultationRequestService requestService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ConsultationRequestResponse> create(
            @Valid @RequestBody ConsultationRequestCreate dto,
            Authentication authentication
    ) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(requestService.create(user.getId(), dto));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ConsultationRequestResponse>> getMyRequests(Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(requestService.getMyRequests(user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<ConsultationRequestResponse>> getAll() {
        return ResponseEntity.ok(requestService.getAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ConsultationRequestResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest dto
    ) {
        return ResponseEntity.ok(requestService.updateStatus(id, dto.getStatus()));
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }
}
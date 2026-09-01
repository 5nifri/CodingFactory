// offer/controller/ConsultingOfferController.java
package tn.esprit.codingfactory.consulting.offer.controller;

import tn.esprit.codingfactory.consulting.offer.dto.ConsultingRequest;
import tn.esprit.codingfactory.consulting.offer.dto.ConsultingResponse;
import tn.esprit.codingfactory.consulting.offer.dto.ImageSuggestion;
import tn.esprit.codingfactory.consulting.offer.service.ConsultingOfferService;
import tn.esprit.codingfactory.consulting.offer.service.PexelsImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consulting")
@RequiredArgsConstructor
public class ConsultingOfferController {

    private final ConsultingOfferService consultingOfferService;
    private final PexelsImageService pexelsImageService;

    @GetMapping
    public ResponseEntity<List<ConsultingResponse>> getAll() {
        return ResponseEntity.ok(consultingOfferService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(consultingOfferService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ConsultingResponse> create(@Valid @RequestBody ConsultingRequest request) {
        return ResponseEntity.ok(consultingOfferService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConsultingResponse> update(@PathVariable Long id, @Valid @RequestBody ConsultingRequest request) {
        return ResponseEntity.ok(consultingOfferService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        consultingOfferService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Searches free stock photos (via Pexels) matching the given query, so
     * the admin can pick a relevant image for an offer without sourcing one
     * manually. Typically called with a query built from the offer's title
     * (and optionally category).
     */
    @GetMapping("/image-suggestions")
    public ResponseEntity<List<ImageSuggestion>> suggestImages(@RequestParam String query) {
        return ResponseEntity.ok(pexelsImageService.search(query, 6));
    }
}
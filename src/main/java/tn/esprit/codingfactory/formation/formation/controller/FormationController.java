// formation/controller/FormationController.java
package tn.esprit.codingfactory.formation.formation.controller;

import tn.esprit.codingfactory.formation.formation.dto.FormationRequest;
import tn.esprit.codingfactory.formation.formation.dto.FormationResponse;
import tn.esprit.codingfactory.formation.formation.service.FormationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
public class FormationController {

    private final FormationService formationService;

    @GetMapping
    public ResponseEntity<List<FormationResponse>> getAll() {
        return ResponseEntity.ok(formationService.getAllPublished());
    }

    @GetMapping("/admin")
    public ResponseEntity<List<FormationResponse>> getAllForAdmin() {
        return ResponseEntity.ok(formationService.getAllForAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(formationService.getById(id));
    }

    @PostMapping
    public ResponseEntity<FormationResponse> create(@Valid @RequestBody FormationRequest request) {
        return ResponseEntity.ok(formationService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormationResponse> update(@PathVariable Long id, @Valid @RequestBody FormationRequest request) {
        return ResponseEntity.ok(formationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        formationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
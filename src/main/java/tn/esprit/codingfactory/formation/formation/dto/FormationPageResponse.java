package tn.esprit.codingfactory.formation.formation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormationPageResponse {
    private List<FormationResponse> formations;
    private int page;          // current page, 0-indexed
    private int size;          // page size (9)
    private long totalElements;
    private int totalPages;
}
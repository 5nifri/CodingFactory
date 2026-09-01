package tn.esprit.codingfactory.ml.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedFormationDTO {
    private Long formationId;
    private String title;
    private String imageUrl;
    private String categoryName;   // the admin-facing Category.name, not the ML code
    private double matchScore;     // the ML confidence score for the category this formation belongs to
}

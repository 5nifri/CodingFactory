package tn.esprit.codingfactory.ml.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {

    /**
     * False when the student has no usable interest signal (no registered
     * interests AND no enrollment history) or the ML service is unreachable.
     * The frontend should hide the recommendation section entirely in
     * this case rather than showing an empty/error state.
     */
    private boolean available;

    @Builder.Default
    private List<RecommendedFormationDTO> formations = new ArrayList<>();
}

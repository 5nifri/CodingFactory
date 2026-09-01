package tn.esprit.codingfactory.ml.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Mirrors FastAPI's PredictResponse exactly (ml-service/src/main.py).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MLPredictResponse {
    private boolean available;

    @Builder.Default
    private List<MLCategoryScore> recommendations = new ArrayList<>();
}

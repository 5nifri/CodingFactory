package tn.esprit.codingfactory.ml.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Mirrors FastAPI's PredictRequest exactly (ml-service/src/main.py).
 * Field names must match the model's trained feature names.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MLPredictRequest {

    @Builder.Default
    private boolean interest_development = false;

    @Builder.Default
    private boolean interest_mobile = false;

    @Builder.Default
    private boolean interest_data_science = false;

    @Builder.Default
    private boolean interest_ai = false;

    @Builder.Default
    private boolean interest_devops = false;

    @Builder.Default
    private boolean interest_cybersecurity = false;

    @Builder.Default
    private boolean interest_erp = false;
}

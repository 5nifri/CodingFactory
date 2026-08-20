// formation/dto/FormationRequest.java
package tn.esprit.codingfactory.formation.formation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FormationRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String duration;

    @NotNull
    @Positive
    private BigDecimal price;

    private String imageUrl;

    private Boolean published;

    @NotNull
    private Long categoryId;
}
package tn.esprit.codingfactory.consulting.offer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConsultingRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private String category;

    private String image;

    private String icon;
}
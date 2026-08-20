// category/dto/CategoryRequest.java
package tn.esprit.codingfactory.formation.category.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoryRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;
}
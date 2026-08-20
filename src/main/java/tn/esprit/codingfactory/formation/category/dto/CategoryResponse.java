// category/dto/CategoryResponse.java
package tn.esprit.codingfactory.formation.category.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
}
// formation/dto/FormationResponse.java
package tn.esprit.codingfactory.formation.formation.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FormationResponse {
    private Long id;
    private String title;
    private String description;
    private String duration;
    private BigDecimal price;
    private String imageUrl;
    private Boolean published;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long categoryId;
    private String categoryName;
    private int totalCourses;
}
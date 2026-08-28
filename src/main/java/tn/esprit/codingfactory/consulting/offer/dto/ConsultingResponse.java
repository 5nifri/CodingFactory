// offer/dto/ConsultingResponse.java
package tn.esprit.codingfactory.consulting.offer.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConsultingResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
}
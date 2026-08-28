// request/dto/ConsultationRequestCreate.java  (what the user sends)
package tn.esprit.codingfactory.consulting.request.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConsultationRequestCreate {

    @NotNull
    private Long consultingId;

    @NotBlank
    private String message;
}
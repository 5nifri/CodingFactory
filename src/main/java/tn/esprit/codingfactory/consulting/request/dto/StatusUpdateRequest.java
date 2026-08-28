// request/dto/StatusUpdateRequest.java  (admin updates status)
package tn.esprit.codingfactory.consulting.request.dto;

import tn.esprit.codingfactory.consulting.request.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StatusUpdateRequest {

    @NotNull
    private RequestStatus status;
}
// request/dto/ConsultationRequestResponse.java
package tn.esprit.codingfactory.consulting.request.dto;

import tn.esprit.codingfactory.consulting.request.entity.RequestStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConsultationRequestResponse {
    private Long id;
    private Long consultingId;
    private String consultingTitle;
    private String userEmail;
    private String userFullName;
    private String message;
    private RequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
package tn.esprit.codingfactory.formation.enrollment.dto;

import tn.esprit.codingfactory.formation.enrollment.entity.EnrollmentStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EnrollmentResponse {
    private Long id;
    private Long formationId;
    private String formationTitle;
    private LocalDateTime enrolledAt;
    private EnrollmentStatus status;
    private double progress;
}
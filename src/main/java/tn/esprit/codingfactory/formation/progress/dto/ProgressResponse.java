package tn.esprit.codingfactory.formation.progress.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProgressResponse {
    private Long enrollmentId;
    private Long courseId;
    private String courseTitle;
    private boolean completed;
    private double formationProgress;
}
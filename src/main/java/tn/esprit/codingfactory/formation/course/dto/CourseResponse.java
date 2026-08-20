package tn.esprit.codingfactory.formation.course.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private Integer orderIndex;
    private String videoUrl;
    private String materialUrl;
    private String duration;
}
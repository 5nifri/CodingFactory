package tn.esprit.codingfactory.formation.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private Integer orderIndex;

    private String videoUrl;
    private String materialUrl;
    private String duration;
}
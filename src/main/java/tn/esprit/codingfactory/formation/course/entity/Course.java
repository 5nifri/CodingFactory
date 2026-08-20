package tn.esprit.codingfactory.formation.course.entity;

import tn.esprit.codingfactory.formation.formation.entity.Formation;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer orderIndex;

    @Column(length = 500)
    private String videoUrl;

    @Column(length = 500)
    private String materialUrl;

    @Column(length = 50)
    private String duration;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "formation_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_course_formation")
    )
    private Formation formation;
}

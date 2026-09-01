package tn.esprit.codingfactory.consulting.offer.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "consulting_offers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Consulting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String category;

    @Column(length = 500)
    private String image;

    @Column(length = 100)
    private String icon;

    @OneToMany(mappedBy = "consulting", fetch = FetchType.LAZY)
    @Builder.Default
    private List<tn.esprit.codingfactory.consulting.request.entity.ConsultationRequest> requests = new ArrayList<>();
}
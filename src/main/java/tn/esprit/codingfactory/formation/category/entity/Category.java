package tn.esprit.codingfactory.formation.category.entity;

import tn.esprit.codingfactory.formation.formation.entity.Formation;
import tn.esprit.codingfactory.ml.entity.MLCategoryCode;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "categories",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_category_name", columnNames = "name")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    /**
     * Optional link to the fixed ML prediction vocabulary. Null means this
     * category is not (yet) mapped to an ML label — formations under it
     * simply won't be surfaced by ML-based recommendations until an admin
     * sets this field. Multiple Category rows may share the same code
     * (e.g. an admin could have both "Web Development" and "Backend
     * Development" both mapped to DEVELOPMENT).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "ml_category_code", length = 30)
    private MLCategoryCode mlCategoryCode;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Formation> formations = new ArrayList<>();
}

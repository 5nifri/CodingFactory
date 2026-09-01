package tn.esprit.codingfactory.user.entity;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.codingfactory.ml.entity.MLCategoryCode;
import tn.esprit.codingfactory.user.entity.Role;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean enabled = true;

    /**
     * Interests selected at registration (multi-select checkboxes), used as
     * the base input signal for ML formation recommendations. Optional —
     * a student may register with none selected, in which case
     * MLRecommendationService falls back to enrollment-history-derived
     * interest, or returns "no recommendation available" if both are empty.
     * See MLRecommendationService for how this blends with enrollment history.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "user_interests",
            joinColumns = @JoinColumn(name = "user_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "interest", length = 30)
    @Builder.Default
    private Set<MLCategoryCode> interests = new HashSet<>();
}

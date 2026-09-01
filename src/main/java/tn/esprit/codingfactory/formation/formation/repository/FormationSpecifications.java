package tn.esprit.codingfactory.formation.formation.repository;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import tn.esprit.codingfactory.formation.formation.entity.Formation;

import java.util.ArrayList;
import java.util.List;

public class FormationSpecifications {

    private FormationSpecifications() {}

    /**
     * Builds the WHERE clause for catalog search: always restricted to
     * published formations, optionally filtered by a case-insensitive
     * title/description text match and/or a specific category.
     */
    public static Specification<Formation> search(String searchText, Long categoryId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isTrue(root.get("published")));

            if (searchText != null && !searchText.isBlank()) {
                String pattern = "%" + searchText.toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descriptionMatch = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(titleMatch, descriptionMatch));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
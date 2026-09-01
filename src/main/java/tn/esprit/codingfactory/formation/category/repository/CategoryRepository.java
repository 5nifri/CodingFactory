package tn.esprit.codingfactory.formation.category.repository;

import tn.esprit.codingfactory.formation.category.entity.Category;
import tn.esprit.codingfactory.ml.entity.MLCategoryCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);

    // Multiple Category rows can map to the same ML code (see Category.mlCategoryCode),
    // so this returns a list rather than a single Optional.
    List<Category> findByMlCategoryCode(MLCategoryCode mlCategoryCode);
}

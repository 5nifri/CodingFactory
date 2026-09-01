package tn.esprit.codingfactory.ml.entity;

/**
 * The fixed, closed set of category labels the trained ML model can predict.
 *
 * This is intentionally separate from formation.category.entity.Category,
 * which is a free-form, admin-managed lookup table (name/description an
 * admin can create/rename at will). MLCategoryCode is a stable vocabulary
 * baked into the trained Decision Tree (ml-service/models/formation_recommender.pkl)
 * and the dataset that produced it — it must NOT be changed here without
 * retraining the model, since the model's output strings must match these
 * enum names exactly.
 *
 * A Category row is linked to the ML system by setting its mlCategoryCode
 * to one of these values (see Category.mlCategoryCode). This lets an admin
 * freely name/rename/reorganize categories in the UI while the ML mapping
 * stays stable underneath.
 */
public enum MLCategoryCode {
    DEVELOPMENT,
    MOBILE,
    DATA_SCIENCE,
    AI,
    DEVOPS,
    CYBERSECURITY,
    ERP
}

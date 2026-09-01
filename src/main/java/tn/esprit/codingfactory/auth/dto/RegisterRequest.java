package tn.esprit.codingfactory.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import tn.esprit.codingfactory.ml.entity.MLCategoryCode;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;

    /**
     * Optional multi-select interests, shown as checkboxes at registration.
     * Feeds the ML recommendation model as the base interest signal.
     * May be empty/null if the student skips this step.
     */
    private Set<MLCategoryCode> interests = new HashSet<>();
}

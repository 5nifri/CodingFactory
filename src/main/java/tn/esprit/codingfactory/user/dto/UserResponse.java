package tn.esprit.codingfactory.user.dto;

import lombok.*;
import tn.esprit.codingfactory.ml.entity.MLCategoryCode;
import tn.esprit.codingfactory.user.entity.Role;

import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private boolean enabled;
    private Set<MLCategoryCode> interests;
}
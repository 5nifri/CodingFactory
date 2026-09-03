package tn.esprit.codingfactory.user.dto;

import lombok.*;
import tn.esprit.codingfactory.user.entity.Role;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserUpdateRequest {
    private Role role;
    private Boolean enabled;
}
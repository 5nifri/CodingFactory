package tn.esprit.codingfactory.auth.dto;

import tn.esprit.codingfactory.user.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private Long userId;
    private String email;
    private Role role;
}

package tn.esprit.codingfactory.auth.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/api/auth/**").permitAll()

                        // Public catalog browsing
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/formations", "/api/formations/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/formations/*/courses").permitAll()

                        // Admin management
                        .requestMatchers(HttpMethod.GET, "/api/formations/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/categories/**", "/api/formations/**", "/api/formations/*/courses").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**", "/api/formations/**", "/api/courses/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**", "/api/formations/**", "/api/courses/**").hasRole("ADMIN")

                        // Enrollment / progress
                        .requestMatchers(HttpMethod.POST, "/api/enrollments/**").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST, "/api/progress/**").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/progress/**").hasRole("STUDENT")

                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
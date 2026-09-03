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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // ==================== AUTH ====================
                        .requestMatchers("/api/auth/**").permitAll()

                        // ==================== FORMATIONS & CATEGORIES ====================
                        .requestMatchers(HttpMethod.GET, "/api/formations/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/formations", "/api/formations/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/formations/*/courses").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/categories/**", "/api/formations/**", "/api/formations/*/courses").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**", "/api/formations/**", "/api/courses/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**", "/api/formations/**", "/api/courses/**").hasRole("ADMIN")

                        // ==================== ENROLLMENT / PROGRESS ====================
                        .requestMatchers(HttpMethod.POST, "/api/enrollments/**").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST, "/api/progress/**").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/progress/**").hasRole("STUDENT")

                        // ==================== CONSULTING ====================
                        .requestMatchers(HttpMethod.GET, "/api/consulting").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/consulting/{id}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/consulting").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/consulting/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/consulting/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/consulting-requests").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/consulting-requests/my").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/consulting-requests").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/consulting-requests/**").hasRole("ADMIN")

                        // ==================== USER MANAGEMENT ====================
                        .requestMatchers(HttpMethod.GET, "/api/users", "/api/users/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")

                        // ==================== FILES ====================
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/files/upload/**").hasRole("ADMIN")

                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/formations/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/recommendations/**").authenticated()

                        // ==================== DEFAULT ====================
                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200", "http://localhost:4201"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
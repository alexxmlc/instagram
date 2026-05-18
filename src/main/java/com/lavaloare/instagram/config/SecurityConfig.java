package com.lavaloare.instagram.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.lavaloare.instagram.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration  
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain mySecurityRules(HttpSecurity http) throws Exception{
        
        http
                .csrf(csrf -> csrf.disable())
                .cors(withDefaults())
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    // PUBLIC
                    .requestMatchers(HttpMethod.POST, "/api/users", "/api/users/login").permitAll()
                    .requestMatchers("/error").permitAll()

                    // MODERATOR ONLY 
                    .requestMatchers("/api/mod/**").hasRole("MODERATOR")

                    // AUTHENTICATED
                    .anyRequest().authenticated()
                );
            
        return http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class).build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // allows any port
        configuration.setAllowedOriginPatterns(List.of("*")); 
        
        // allow all standard methods and headers so JSON POST requests don't fail preflight
        configuration.setAllowedMethods(List.of("*")); 
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); 
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); 
        return source;
    }
}
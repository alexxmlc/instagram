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

@Configuration  // Tells spring this class contains setup rules
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    //HttpSecurity methods throw  checked exceptions
    public SecurityFilterChain mySecurityRules(HttpSecurity http) throws Exception{
        
        http
                .csrf(csrf -> csrf.disable())
                .cors(withDefaults())
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    // PUBLIC
                    .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/users/login").permitAll()
                    .requestMatchers("/error").permitAll()

                    // AUTHENICATED
                    .requestMatchers(HttpMethod.GET, "/api/users/{username}").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                    .requestMatchers(HttpMethod.PATCH, "/api/users/me").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/users/me/avatar").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/posts").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/posts").authenticated()
                    .requestMatchers(HttpMethod.PATCH, "/api/posts/{postId}").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/posts/{postId}").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/comments/post/{postId}").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/comments/post/{postId}").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/comments/{commentId}").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/comments/{commentId}").authenticated()
                    .anyRequest().authenticated()
                );
            
        return http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class).build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // tell it  who is allowed to connect (the Vite React app)
        configuration.setAllowedOrigins(List.of("http://localhost:5174", "http://127.0.0.1:5174")); 
        // allow these specific types of requests
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // allow the Authorization header for jwt
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // apply it to all endpoints
        return source;
    }
}

package com.lavaloare.instagram.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

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
                .authorizeHttpRequests(auth -> auth
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
                    .anyRequest().authenticated()
                );
            
        return http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class).build();
    }
}

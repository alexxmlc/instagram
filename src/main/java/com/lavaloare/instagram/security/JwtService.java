package com.lavaloare.instagram.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.lavaloare.instagram.model.User;

import io.jsonwebtoken.Jwts;


@Service
public class JwtService {

    @Value("${security.jwt.secret}")
    private String secretKey;

    @Value("${security.jwt.expiration}")
    private long jwtExpiration;

    // JWT doesn't know String, it knows SecretKey
    // so the String key is transformed into a SecretKey obj
    private SecretKey getSignInKey(){
        byte[] keyBytes = secretKey.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return io.jsonwebtoken.security.Keys.hmacShaKeyFor(keyBytes);
    }

    // generates the token needed user actions
    public String generateToken(User user){
        return io.jsonwebtoken.Jwts.builder()
                .subject(user.getUsername())    // owner of the token
                .issuedAt(new java.util.Date(System.currentTimeMillis()))   // start time
                .expiration(new java.util.Date(System.currentTimeMillis() + jwtExpiration)) // end time 
                .signWith(getSignInKey())   // hashes the header + payload + secretKey together 
                                            // resulting in a unique token based on the secret key
                .compact(); // JSON object -> web-safe string format(bunch of letters)  
    }

    public String extractUsername(String token){
        return io.jsonwebtoken.Jwts.parser()
                .verifyWith(getSignInKey()) // validates the token
                .build()    // ready to be used    
                .parseSignedClaims(token)   // verifies the token agains the secret key 
                                            // and checks for expiration date
                .getPayload()   // contains the name, creation and expiration
                .getSubject();  // gets the name
        
        // IMPORTANT: The payload is encoded, not encrypted so whoever has access
        // to your token can get the info inside the payload
    }

    public boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }

    // same as extract username but this time it extracts the expiration date
    public Date extractExpiration(String token){
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
    }

    public boolean isTokenValid(String token, UserDetails userDetails){
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }
}

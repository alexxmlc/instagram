package com.lavaloare.instagram.exception;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice   // Safety net for all controllers
public class GlobalExceptionHandler {
    
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> userNotFOundException(){
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "User not found");

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }
}

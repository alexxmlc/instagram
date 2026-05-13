package com.lavaloare.instagram.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class LoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // wrap request and response so they don't get consumed
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request, 1024 * 1024);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        // forward the request to the controller
        filterChain.doFilter(wrappedRequest, wrappedResponse);

        // print the response
        System.out.println("\n=======================================================");
        System.out.println("🛫 REQUEST: " + request.getMethod() + " " + request.getRequestURI());
        
        // print only if JSON (we have picture upload)
        if (request.getContentType() != null) {
            String requestBody = new String(wrappedRequest.getContentAsByteArray(), StandardCharsets.UTF_8);
            System.out.println("Body: " + (requestBody.isEmpty() ? "[Empty]" : requestBody));
        } else {
            System.out.println("Body: [Not a JSON]");
        }

        System.out.println("-------------------------------------------------------");
        System.out.println("🛬 RESPONSE: Status " + response.getStatus());

        if (response.getContentType() != null ) {
            String responseBody = new String(wrappedResponse.getContentAsByteArray(), StandardCharsets.UTF_8);
            System.out.println("Body: " + (responseBody.isEmpty() ? "[Empty]" : responseBody));
        } else {
            System.out.println("Body: [Not a JSON]");
        }
        System.out.println("=======================================================\n");

        wrappedResponse.copyBodyToResponse();
    }
}
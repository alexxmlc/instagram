package com.lavaloare.instagram.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.lavaloare.instagram.model.User;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // --- Twilio Variables ---
    @Value("${twilio.account.sid}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    // This runs automatically when Spring Boot starts up to initialize Twilio
    @PostConstruct
    public void initTwilio() {
        Twilio.init(twilioAccountSid, twilioAuthToken);
    }

    public void sendBanNotification(User user) {
        String emailSubject = "Account Banned";
        String emailBody = "Hello " + user.getUsername() + ",\n\nYour account has been permanently banned from the site due to inappropriate behavior.";
        
        // Send Email
        sendEmail(user.getEmail(), emailSubject, emailBody);
        
        System.out.println("DEBUG: The phone number Java sees is -> " + user.getPhoneNumber());

        // Send SMS
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty()) {
            String smsMessage = "Your Instagram-clone account has been banned due to bad behavior.";
            sendSms(user.getPhoneNumber(), smsMessage);
        } else {
            System.out.println("DEBUG: SMS skipped because phone number is null or empty!");
        }
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            System.out.println("SUCCESS: Real email sent to " + to);
        } catch (MailException e) {
            System.err.println("FAILED to send email: " + e.getMessage());
        }
    }

    private void sendSms(String toPhoneNumber, String text) {
        try {
            Message message = Message.creator(
                    new PhoneNumber(toPhoneNumber),     // To number
                    new PhoneNumber(twilioPhoneNumber), // From number
                    text                                // SMS body
            ).create();
            
            System.out.println("SUCCESS: Real SMS sent! Twilio Message SID: " + message.getSid());
        } catch (Exception e) {
            System.err.println("FAILED to send SMS: " + e.getMessage());
        }
    }
}
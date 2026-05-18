package com.lavaloare.instagram.service;

import org.springframework.stereotype.Service;

import com.lavaloare.instagram.model.User;

@Service
public class NotificationService {

    public void sendBanNotification(User user) {
        String emailSubject = "Account Banned";
        String emailBody = "Hello " + user.getUsername() + ",\n\nYour account has been permanently banned from the site due to inappropriate behavior.";
        sendEmail(user.getEmail(), emailSubject, emailBody);
        
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty()) {
            String smsMessage = "Your Instagram-clone account has been banned due to bad behavior.";
            sendSms(user.getPhoneNumber(), smsMessage);
        }
    }

    private void sendEmail(String to, String subject, String body) {
        System.out.println("\n========== EMAIL NOTIFICATION ==========");
        System.out.println("TO: " + to);
        System.out.println("SUBJECT: " + subject);
        System.out.println("BODY: \n" + body);
        System.out.println("========================================\n");
    }

    private void sendSms(String phoneNumber, String message) {
        System.out.println("\n=========== SMS NOTIFICATION ===========");
        System.out.println("TO: " + phoneNumber);
        System.out.println("MESSAGE: " + message);
        System.out.println("========================================\n");
    }
}
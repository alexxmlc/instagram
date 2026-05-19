package com.lavaloare.instagram;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.mail.username=test",
    "spring.mail.password=test",
    "twilio.account.sid=test",
    "twilio.auth.token=test",
    "twilio.phone.number=test",
    "cloudinary.cloud-name=test",
    "cloudinary.api-key=test",
    "cloudinary.api-secret=test"
})
class InstagramApplicationTests {

	@Test
	void contextLoads() {
	}

}

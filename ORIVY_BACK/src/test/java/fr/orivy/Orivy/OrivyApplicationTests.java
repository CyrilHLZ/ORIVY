package fr.orivy.Orivy;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;


// Profil "test" : base H2 en mémoire, jamais la vraie base PostgreSQL de .env
@SpringBootTest(classes = OrivyApplication.class)
@ActiveProfiles("test")
class OrivyApplicationTests {

	@Test
	void contextLoads() {
	}

}

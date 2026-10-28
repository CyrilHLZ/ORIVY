package fr.orivy.Orivy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class OrivyApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrivyApplication.class, args);
	}

}

package fr.orivy.Orivy.Configuration;

import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${orivy.dossier-uploads}")
    private String dossierUploads;

    // Adresses du front autorisées (application.properties) : en dev, n'importe quel port de localhost
    // (Vite prend 5174 si 5173 est déjà occupé) ; en prod, la vraie adresse du site
    @Value("${orivy.cors.origines}")
    private String[] origines;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(origines)
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*");
    }

    // /api/fichiers/avatars/x.jpg → fichier uploads/avatars/x.jpg sur le disque
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/api/fichiers/**")
                .addResourceLocations(Path.of(dossierUploads).toAbsolutePath().toUri().toString());
    }
}

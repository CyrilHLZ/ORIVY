# =====================================================================
# Image Docker du back ORIVY (Spring Boot)
# Deux étapes : 1) Maven construit le .jar  2) on ne garde que Java + le .jar (image légère)
# =====================================================================

# ---- 1. Construction ----
FROM eclipse-temurin:21-jdk AS construction
WORKDIR /src
# D'abord le pom seul : les dépendances sont téléchargées une fois, puis gardées en cache par Docker
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline
# Puis le code, et le .jar (les tests tournent à part : voir le workflow GitHub)
COPY src src
RUN ./mvnw -q package -DskipTests

# ---- 2. Exécution ----
FROM eclipse-temurin:21-jre
WORKDIR /app
# Un utilisateur sans droits : si l'application était piratée, l'attaquant n'aurait pas les droits root
RUN useradd --system --uid 1001 orivy && mkdir -p /app/uploads && chown orivy /app/uploads
USER orivy
COPY --from=construction /src/target/*.jar orivy.jar
EXPOSE 8081
# Profil prod : console H2 coupée, CORS limité au vrai domaine (application-prod.properties)
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-jar", "/app/orivy.jar"]

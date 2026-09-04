# --- Étape 1 : build avec Maven Wrapper ---
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copier le wrapper Maven et le pom d'abord (pour profiter du cache Docker)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

# Copier le code source et builder
COPY src src
RUN ./mvnw clean package -DskipTests -B

# --- Étape 2 : image finale légère ---
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
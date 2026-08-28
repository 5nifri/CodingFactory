package tn.esprit.codingfactory.file.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir;

    public FileStorageService(
            @Value("${app.upload.dir:uploads}") String uploadDir
    ) {
        this.uploadDir = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.uploadDir.resolve("courses"));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String storeCourseFile(MultipartFile file, String type) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new RuntimeException("Invalid file name");
        }

        String extension = originalFilename
                .substring(originalFilename.lastIndexOf(".") + 1)
                .toLowerCase();

        if ("video".equalsIgnoreCase(type)) {
            validateVideoExtension(extension);
        } else if ("material".equalsIgnoreCase(type)) {
            validateMaterialExtension(extension);
        } else {
            throw new RuntimeException("Invalid file type. Use 'video' or 'material'");
        }

        String filename = UUID.randomUUID() + "." + extension;

        Path targetLocation = uploadDir
                .resolve("courses")
                .resolve(filename)
                .normalize();

        // Security check
        if (!targetLocation.startsWith(uploadDir.resolve("courses"))) {
            throw new RuntimeException("Invalid file path");
        }

        try {
            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException e) {
            throw new RuntimeException("Could not store file", e);
        }

        return "/uploads/courses/" + filename;
    }

    private void validateVideoExtension(String extension) {

        if (!extension.matches("mp4|webm|mov|avi|mkv")) {
            throw new RuntimeException(
                    "Invalid video format. Allowed: mp4, webm, mov, avi, mkv"
            );
        }
    }

    private void validateMaterialExtension(String extension) {

        if (!extension.matches("pdf")) {
            throw new RuntimeException(
                    "Invalid material format. Only PDF files are allowed"
            );
        }
    }
}

package tn.esprit.codingfactory.file.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.codingfactory.common.exception.ApiException;

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
            throw new ApiException("File is empty", HttpStatus.BAD_REQUEST);
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new ApiException("Invalid file name", HttpStatus.BAD_REQUEST);
        }

        String extension = originalFilename
                .substring(originalFilename.lastIndexOf(".") + 1)
                .toLowerCase();

        if ("video".equalsIgnoreCase(type)) {
            validateVideoExtension(extension);
        } else if ("material".equalsIgnoreCase(type)) {
            validateMaterialExtension(extension);
        } else {
            throw new ApiException("Invalid file type. Use 'video' or 'material'", HttpStatus.BAD_REQUEST);
        }

        String filename = UUID.randomUUID() + "." + extension;

        Path targetLocation = uploadDir
                .resolve("courses")
                .resolve(filename)
                .normalize();

        // Security check
        if (!targetLocation.startsWith(uploadDir.resolve("courses"))) {
            throw new ApiException("Invalid file path", HttpStatus.BAD_REQUEST);
        }

        try {
            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException e) {
            throw new ApiException("Could not store file", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return "/uploads/courses/" + filename;
    }

    private void validateVideoExtension(String extension) {
        if (!extension.matches("mp4|webm|mov|avi|mkv")) {
            throw new ApiException(
                    "Invalid video format. Allowed: mp4, webm, mov, avi, mkv",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    private void validateMaterialExtension(String extension) {
        if (!extension.matches("pdf")) {
            throw new ApiException("Invalid material format. Only PDF files are allowed", HttpStatus.BAD_REQUEST);
        }
    }
}
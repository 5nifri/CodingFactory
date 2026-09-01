package tn.esprit.codingfactory.file.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.codingfactory.file.service.FileStorageService;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload/courses")
    public ResponseEntity<Map<String, String>> uploadCourseFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type
    ) {

        String fileUrl = fileStorageService.storeCourseFile(file, type);

        return ResponseEntity.ok(
                Map.of(
                        "url", fileUrl,
                        "type", type
                )
        );
    }

    @PostMapping("/upload/formations")
    public ResponseEntity<Map<String, String>> uploadFormationImage(
            @RequestParam("file") MultipartFile file
    ) {

        String fileUrl = fileStorageService.storeFormationImage(file);

        return ResponseEntity.ok(
                Map.of("url", fileUrl)
        );
    }
}

package tn.esprit.codingfactory.admin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.codingfactory.admin.dto.StatsResponse;
import tn.esprit.codingfactory.consulting.offer.repository.ConsultingRepository;
import tn.esprit.codingfactory.consulting.request.repository.ConsultationRequestRepository;
import tn.esprit.codingfactory.formation.category.repository.CategoryRepository;
import tn.esprit.codingfactory.formation.course.repository.CourseRepository;
import tn.esprit.codingfactory.formation.formation.repository.FormationRepository;
import tn.esprit.codingfactory.user.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserRepository userRepository;
    private final FormationRepository formationRepository;
    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final ConsultingRepository consultingRepository;
    private final ConsultationRequestRepository consultationRequestRepository;

    public StatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalFormations = formationRepository.count();
        long totalCourses = courseRepository.count();
        long totalCategories = categoryRepository.count();
        long totalConsultingOffers = consultingRepository.count();
        long totalConsultingRequests = consultationRequestRepository.count();

        // Formations per category
        Map<String, Long> formationsByCategory = formationRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        f -> f.getCategory().getName(),
                        Collectors.counting()
                ));

        // Consulting requests by status
        Map<String, Long> requestsByStatus = consultationRequestRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        r -> r.getStatus().name(),
                        Collectors.counting()
                ));

        // Recent users (last 5)
        List<StatsResponse.RecentUser> recentUsers = userRepository.findTop5ByOrderByIdDesc()
                .stream()
                .map(u -> StatsResponse.RecentUser.builder()
                        .id(u.getId())
                        .fullName(u.getFirstName() + " " + u.getLastName())
                        .email(u.getEmail())
                        .role(u.getRole().name())
                        .enabled(u.isEnabled())
                        .build()
                )
                .toList();

        // Recent consulting requests (last 5)
        List<StatsResponse.RecentRequest> recentRequests = consultationRequestRepository.findTop5ByOrderByIdDesc()
                .stream()
                .map(r -> StatsResponse.RecentRequest.builder()
                        .id(r.getId())
                        .userFullName(r.getUser().getFirstName() + " " + r.getUser().getLastName())
                        .consultingTitle(r.getConsulting().getTitle())
                        .status(r.getStatus().name())
                        .createdAt(r.getCreatedAt())
                        .build()
                )
                .toList();

        return StatsResponse.builder()
                .totalUsers(totalUsers)
                .totalFormations(totalFormations)
                .totalCourses(totalCourses)
                .totalCategories(totalCategories)
                .totalConsultingOffers(totalConsultingOffers)
                .totalConsultingRequests(totalConsultingRequests)
                .formationsByCategory(formationsByCategory)
                .requestsByStatus(requestsByStatus)
                .recentUsers(recentUsers)
                .recentRequests(recentRequests)
                .build();
    }
}
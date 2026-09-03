package tn.esprit.codingfactory.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class StatsResponse {
    private long totalUsers;
    private long totalFormations;
    private long totalCourses;
    private long totalCategories;
    private long totalConsultingOffers;
    private long totalConsultingRequests;
    private Map<String, Long> formationsByCategory;
    private Map<String, Long> requestsByStatus;
    private List<RecentUser> recentUsers;
    private List<RecentRequest> recentRequests;

    @Data
    @Builder
    public static class RecentUser {
        private Long id;
        private String fullName;
        private String email;
        private String role;
        private boolean enabled;
    }

    @Data
    @Builder
    public static class RecentRequest {
        private Long id;
        private String userFullName;
        private String consultingTitle;
        private String status;
        private LocalDateTime createdAt;
    }
}
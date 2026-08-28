// request/service/ConsultationRequestService.java
package tn.esprit.codingfactory.consulting.request.service;

import tn.esprit.codingfactory.common.exception.ApiException;
import tn.esprit.codingfactory.consulting.offer.entity.Consulting;
import tn.esprit.codingfactory.consulting.offer.repository.ConsultingRepository;
import tn.esprit.codingfactory.consulting.request.dto.ConsultationRequestCreate;
import tn.esprit.codingfactory.consulting.request.dto.ConsultationRequestResponse;
import tn.esprit.codingfactory.consulting.request.entity.ConsultationRequest;
import tn.esprit.codingfactory.consulting.request.entity.RequestStatus;
import tn.esprit.codingfactory.consulting.request.repository.ConsultationRequestRepository;
import tn.esprit.codingfactory.user.entity.User;
import tn.esprit.codingfactory.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultationRequestService {

    private final ConsultationRequestRepository requestRepository;
    private final ConsultingRepository consultingRepository;
    private final UserRepository userRepository;

    @Transactional
    public ConsultationRequestResponse create(Long userId, ConsultationRequestCreate dto) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Consulting consulting = consultingRepository.findById(dto.getConsultingId())
                .orElseThrow(() -> new ApiException("Consulting offer not found", HttpStatus.NOT_FOUND));

        ConsultationRequest request = ConsultationRequest.builder()
                .user(user)
                .consulting(consulting)
                .message(dto.getMessage())
                .status(RequestStatus.PENDING)
                .build();

        return toResponse(requestRepository.save(request));
    }

    @Transactional(readOnly = true)
    public List<ConsultationRequestResponse> getMyRequests(Long userId) {
        return requestRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ConsultationRequestResponse> getAll() {
        return requestRepository.findAllWithDetails().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ConsultationRequestResponse updateStatus(Long requestId, RequestStatus newStatus) {
        ConsultationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException("Request not found", HttpStatus.NOT_FOUND));
        request.setStatus(newStatus);
        return toResponse(requestRepository.save(request));
    }

    private ConsultationRequestResponse toResponse(ConsultationRequest r) {
        return ConsultationRequestResponse.builder()
                .id(r.getId())
                .consultingId(r.getConsulting().getId())
                .consultingTitle(r.getConsulting().getTitle())
                .userEmail(r.getUser().getEmail())
                .userFullName(r.getUser().getFirstName() + " " + r.getUser().getLastName())
                .message(r.getMessage())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
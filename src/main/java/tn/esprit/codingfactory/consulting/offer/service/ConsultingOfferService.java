// offer/service/ConsultingOfferService.java
package tn.esprit.codingfactory.consulting.offer.service;

import tn.esprit.codingfactory.common.exception.ApiException;
import tn.esprit.codingfactory.consulting.offer.dto.ConsultingRequest;
import tn.esprit.codingfactory.consulting.offer.dto.ConsultingResponse;
import tn.esprit.codingfactory.consulting.offer.entity.Consulting;
import tn.esprit.codingfactory.consulting.offer.repository.ConsultingRepository;
import tn.esprit.codingfactory.consulting.request.repository.ConsultationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultingOfferService {

    private final ConsultingRepository consultingRepository;
    private final ConsultationRequestRepository requestRepository;

    @Transactional
    public ConsultingResponse create(ConsultingRequest request) {
        Consulting consulting = Consulting.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .image(request.getImage())
                .icon(request.getIcon())
                .build();
        return toResponse(consultingRepository.save(consulting));
    }

    @Transactional(readOnly = true)
    public List<ConsultingResponse> getAll() {
        return consultingRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConsultingResponse getById(Long id) {
        return toResponse(consultingRepository.findById(id)
                .orElseThrow(() -> new ApiException("Consulting offer not found", HttpStatus.NOT_FOUND)));
    }

    @Transactional
    public ConsultingResponse update(Long id, ConsultingRequest request) {
        Consulting consulting = consultingRepository.findById(id)
                .orElseThrow(() -> new ApiException("Consulting offer not found", HttpStatus.NOT_FOUND));
        consulting.setTitle(request.getTitle());
        consulting.setDescription(request.getDescription());
        consulting.setCategory(request.getCategory());
        consulting.setImage(request.getImage());
        consulting.setIcon(request.getIcon());
        return toResponse(consultingRepository.save(consulting));
    }

    @Transactional
    public void delete(Long id) {
        if (!consultingRepository.existsById(id)) {
            throw new ApiException("Consulting offer not found", HttpStatus.NOT_FOUND);
        }
        if (requestRepository.existsByConsultingId(id)) {
            throw new ApiException("Cannot delete an offer that has existing consultation requests", HttpStatus.CONFLICT);
        }
        consultingRepository.deleteById(id);
    }

    private ConsultingResponse toResponse(Consulting c) {

        return ConsultingResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .category(c.getCategory())
                .image(c.getImage())
                .icon(c.getIcon())
                .build();
    }
}
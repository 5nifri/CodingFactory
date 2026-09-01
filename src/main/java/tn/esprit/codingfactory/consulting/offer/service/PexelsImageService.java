package tn.esprit.codingfactory.consulting.offer.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import tn.esprit.codingfactory.common.exception.ApiException;
import tn.esprit.codingfactory.consulting.offer.dto.ImageSuggestion;

import java.util.Collections;
import java.util.List;

/**
 * Searches the free Pexels stock-photo API (https://www.pexels.com/api/) for
 * images matching a text query, so the admin can pick a relevant photo for a
 * consulting offer without needing to source one manually.
 *
 * Requires a free Pexels API key set as `pexels.api.key` (see
 * application.properties / environment variable). Signing up costs nothing
 * and does not require a credit card.
 */
@Service
public class PexelsImageService {

    private static final String SEARCH_URL = "https://api.pexels.com/v1/search";

    @Value("${pexels.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<ImageSuggestion> search(String query, int perPage) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new ApiException(
                    "Aucune clé Pexels configurée. Ajoutez pexels.api.key dans application.properties " +
                            "(clé gratuite sur https://www.pexels.com/api/).",
                    HttpStatus.SERVICE_UNAVAILABLE
            );
        }

        if (query == null || query.isBlank()) {
            throw new ApiException("Le paramètre 'query' est requis", HttpStatus.BAD_REQUEST);
        }

        String url = UriComponentsBuilder.fromUriString(SEARCH_URL)
                .queryParam("query", query)
                .queryParam("per_page", perPage)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", apiKey);

        try {
            var response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    PexelsSearchResponse.class
            );

            PexelsSearchResponse body = response.getBody();
            if (body == null || body.getPhotos() == null) {
                return Collections.emptyList();
            }

            return body.getPhotos().stream()
                    .map(p -> ImageSuggestion.builder()
                            .url(p.getSrc() != null ? p.getSrc().getLarge() : null)
                            .thumbnailUrl(p.getSrc() != null ? p.getSrc().getMedium() : null)
                            .photographer(p.getPhotographer())
                            .photographerUrl(p.getPhotographerUrl())
                            .build())
                    .toList();

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException("Impossible de contacter le service d'images (Pexels)", HttpStatus.BAD_GATEWAY);
        }
    }

    @Getter @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class PexelsSearchResponse {
        private List<PexelsPhoto> photos;
    }

    @Getter @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class PexelsPhoto {
        private String photographer;

        @JsonProperty("photographer_url")
        private String photographerUrl;

        private PexelsPhotoSrc src;
    }

    @Getter @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class PexelsPhotoSrc {
        private String large;
        private String medium;
    }
}
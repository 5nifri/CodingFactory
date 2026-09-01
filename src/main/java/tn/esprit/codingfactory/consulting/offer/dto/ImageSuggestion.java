package tn.esprit.codingfactory.consulting.offer.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ImageSuggestion {

    private String url;

    private String thumbnailUrl;

    private String photographer;

    private String photographerUrl;
}

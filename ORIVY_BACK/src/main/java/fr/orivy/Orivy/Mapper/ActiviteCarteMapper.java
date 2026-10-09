package fr.orivy.Orivy.Mapper;

import org.springframework.stereotype.Component;

import fr.orivy.Orivy.DTO.ActiviteCarteDto;
import fr.orivy.Orivy.Model.ActiviteCarte;

@Component
public class ActiviteCarteMapper {

    public ActiviteCarteDto toDto(ActiviteCarte activite) {
        return new ActiviteCarteDto(
                activite.getId(),
                activite.getNom(),
                activite.getDescription(),
                activite.getCategorie(),
                activite.getDateDebut(),
                activite.getLieu(),
                activite.getLatitude(),
                activite.getLongitude(),
                activite.getImageUrl());
    }

    public ActiviteCarte toEntity(ActiviteCarteDto dto) {
        return new ActiviteCarte(
                dto.nom(),
                dto.description(),
                dto.categorie(),
                dto.dateDebut(),
                dto.lieu(),
                dto.latitude(),
                dto.longitude(),
                dto.imageUrl());
    }

    public void updateEntity(ActiviteCarte activite, ActiviteCarteDto dto) {
        activite.setNom(dto.nom());
        activite.setDescription(dto.description());
        activite.setCategorie(dto.categorie());
        activite.setDateDebut(dto.dateDebut());
        activite.setLieu(dto.lieu());
        activite.setLatitude(dto.latitude());
        activite.setLongitude(dto.longitude());
        activite.setImageUrl(dto.imageUrl());
    }
}
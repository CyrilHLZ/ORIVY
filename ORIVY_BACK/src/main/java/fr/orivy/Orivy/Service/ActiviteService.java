package fr.orivy.Orivy.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.DTO.ActiviteCarteDto;
import fr.orivy.Orivy.Mapper.ActiviteCarteMapper;
import fr.orivy.Orivy.Model.ActiviteCarte;
import fr.orivy.Orivy.Repository.ActiviteCarteRepository;

@Service
public class ActiviteService {

    private final ActiviteCarteRepository activiteRepository;
    private final ActiviteCarteMapper activiteMapper;

    public ActiviteService(ActiviteCarteRepository activiteRepository,
            ActiviteCarteMapper activiteMapper) {
        this.activiteRepository = activiteRepository;
        this.activiteMapper = activiteMapper;
    }

    public List<ActiviteCarteDto> getAllActivites() {
        return activiteRepository.findAll().stream()
                .map(activiteMapper::toDto)
                .toList();
    }

    public ActiviteCarteDto creerActivite(ActiviteCarteDto dto) {
        return activiteMapper.toDto(activiteRepository.save(activiteMapper.toEntity(dto)));
    }

    public ActiviteCarteDto getActivite(Long id) {
        return activiteMapper.toDto(trouverActivite(id));
    }

    public ActiviteCarteDto modifierActivite(Long id, ActiviteCarteDto dto) {
        ActiviteCarte activiteExistante = trouverActivite(id);
        activiteMapper.updateEntity(activiteExistante, dto);
        return activiteMapper.toDto(activiteRepository.save(activiteExistante));
    }

    public void supprimerActivite(Long id) {
        activiteRepository.delete(trouverActivite(id));
    }

    public List<ActiviteCarteDto> rechercherActivites(String motCle) {
        return activiteRepository.findByNomContainingIgnoreCase(motCle).stream()
                .map(activiteMapper::toDto)
                .toList();
    }

    public List<ActiviteCarteDto> filtrerParCategorie(String categorie) {
        return activiteRepository.findByCategorieIgnoreCase(categorie).stream()
                .map(activiteMapper::toDto)
                .toList();
    }

    public List<ActiviteCarteDto> filtrerParLieu(String lieu) {
        return activiteRepository.findByLieuContainingIgnoreCase(lieu).stream()
                .map(activiteMapper::toDto)
                .toList();
    }

    public List<ActiviteCarteDto> filtrerParDate(LocalDateTime debut, LocalDateTime fin) {
        if (debut.isAfter(fin)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de début doit être antérieure à la date de fin");
        }
        return activiteRepository.findByDateDebutBetween(debut, fin).stream()
            .map(activiteMapper::toDto)
            .toList();
    }

    private ActiviteCarte trouverActivite(Long id) {
        return activiteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Activité introuvable"));
    }
}
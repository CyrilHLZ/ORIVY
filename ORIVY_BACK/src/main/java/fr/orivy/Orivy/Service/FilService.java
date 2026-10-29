package fr.orivy.Orivy.Service;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import fr.orivy.Orivy.Model.PhotoSortie;
import fr.orivy.Orivy.Repository.AbonnementRepository;
import fr.orivy.Orivy.Repository.PhotoSortieRepository;

@Service
public class FilService {

    private static final int PAR_PAGE = 10;

    private final PhotoSortieRepository photoSortieRepository;
    private final AbonnementRepository abonnementRepository;

    public FilService(PhotoSortieRepository photoSortieRepository, AbonnementRepository abonnementRepository) {
        this.photoSortieRepository = photoSortieRepository;
        this.abonnementRepository = abonnementRepository;
    }

    public List<PhotoSortie> pourToi(int page) {
        return photoSortieRepository.findAllByOrderByDateAjoutDesc(PageRequest.of(page, PAR_PAGE));
    }

    public List<PhotoSortie> abonnements(Long moi, int page) {
        List<Long> suivis = abonnementRepository.findByAbonneId(moi).stream()
                .map((a) -> a.getSuivi().getId()).toList();
        if (suivis.isEmpty()) return List.of();   // « IN () » vide : on évite la requête
        Pageable pageable = PageRequest.of(page, PAR_PAGE);
        return photoSortieRepository.findByAuteurIdInOrderByDateAjoutDesc(suivis, pageable);
    }
}

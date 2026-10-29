package fr.orivy.Orivy.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fr.orivy.Orivy.Model.Sortie;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.SortieRepository;

@Service
public class RappelService {

    private final SortieRepository sortieRepository;
    private final NotificationService notificationService;

    public RappelService(SortieRepository sortieRepository, NotificationService notificationService) {
        this.sortieRepository = sortieRepository;
        this.notificationService = notificationService;
    }

    // Tous les jours à 18 h : on prévient les membres des sorties de demain
    @Scheduled(cron = "0 0 18 * * *")
    @Transactional
    public void rappelerSortiesDeDemain() {
        LocalDate demain = LocalDate.now().plusDays(1);
        List<Sortie> sorties = sortieRepository.findByDateDebutBetween(demain.atStartOfDay(), demain.atTime(23, 59, 59));
        for (Sortie sortie : sorties) {
            String heure = sortie.getDateDebut().toLocalTime().format(DateTimeFormatter.ofPattern("H'h'mm"));
            String texte = "Demain à " + heure + " : « " + sortie.getNom() + " » à " + sortie.getLieu() + ". À demain !";
            Set<Utilisateur> concernes = new HashSet<>(sortie.getParticipants());
            if (sortie.getOrganisateur() != null) concernes.add(sortie.getOrganisateur());
            for (Utilisateur membre : concernes) {
                notificationService.notifier(membre, "rappel", texte, "/sorties/" + sortie.getId());
            }
        }
    }
}


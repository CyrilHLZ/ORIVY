const versIcs = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');   // 20300601T100000Z

export const telechargerIcs = (sortie) => {
    const debut = new Date(sortie.dateDebut);
    const fin = new Date(debut.getTime() + 2 * 60 * 60 * 1000);
    const contenu = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ORIVY//FR',
        'BEGIN:VEVENT',
        `UID:sortie-${sortie.id}@orivy`,
        `DTSTAMP:${versIcs(new Date())}`,
        `DTSTART:${versIcs(debut)}`,
        `DTEND:${versIcs(fin)}`,
        `SUMMARY:${sortie.nom}`,
        `LOCATION:${sortie.lieu ?? ''}`,
        `URL:${window.location.origin}/sorties/${sortie.id}`,
        'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const lien = document.createElement('a');
    lien.href = URL.createObjectURL(new Blob([contenu], { type: 'text/calendar' }));
    lien.download = `${sortie.nom}.ics`;
    lien.click();
    URL.revokeObjectURL(lien.href);
};

-- V4 : l'admin garde la main sur les lieux importés
-- masque        : lieu importé supprimé par l'admin ; l'import ne le fait pas revenir
-- photo_choisie : photo changée ou retirée par l'admin ; l'import ne la remplace plus
ALTER TABLE point_interet ADD COLUMN masque        BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE point_interet ADD COLUMN photo_choisie BOOLEAN NOT NULL DEFAULT FALSE;

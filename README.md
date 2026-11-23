# LifeOS

Persönliche Trainings-, Zyklus- und Ernährungs-App als einzelne statische Seite (`index.html`),
gehostet über GitHub Pages. Daten liegen im `localStorage` des Browsers (`lifeos-v1`) und werden
bei Anmeldung über Supabase (Tabelle `lifeos_data`, RPC `lifeos_save_if_version`) synchronisiert.

## Lokal starten

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## Aufbau

- `index.html` – gesamte App (HTML, CSS, JavaScript)
- `assets/exercises/` – Übungsfotos (Unlicense, Quellen in `sources.json`)
- `assets/anatomy/muscle-model.js` – Vektor-Muskelkarten (MIT)

## Hinweise für die Weiterentwicklung

- Die App ist über viele Iterationen gewachsen: Spätere `<script>`-/`<style>`-Blöcke erweitern
  frühere Funktionen (z. B. `renderAll`, `renderProgress`) durch Umhüllen bzw. überschreiben CSS.
  Neue Änderungen möglichst direkt an der ursprünglichen Funktion vornehmen, statt einen weiteren
  Patch-Block anzuhängen.
- Der Supabase-Schlüssel im Code ist ein *publishable* Key und darf öffentlich sein – die
  Sicherheit hängt vollständig an den Row-Level-Security-Regeln der Tabelle `lifeos_data`
  (nur `auth.uid() = user_id` darf lesen/schreiben).

## Als App installieren

LifeOS ist eine installierbare Web-App (PWA): `manifest.webmanifest`, App-Icons in `assets/icons/`
und ein Service Worker (`sw.js`), der die App offline startbar macht. Die Seite selbst wird immer
zuerst aus dem Netz geladen, Updates kommen also sofort an.

- **Android (Chrome):** Seite öffnen → Menü ⋮ → „App installieren“ / „Zum Startbildschirm hinzufügen“.
- **iPhone (Safari):** Seite öffnen → Teilen-Symbol → „Zum Home-Bildschirm“.

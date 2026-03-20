# language: de
Funktionalität: Vollständiger Retro Flow

  Szenario: Kompletter Retrospektive-Zyklus von Phase 1 bis Phase 4
    Gegeben sei ich bin auf der Startseite im Test-Modus
    Wenn ich eine neue Session namens "BDD Test Session" erstelle
    Und ich eine Karte "Wir haben gute Unit Tests" in der Kategorie "liked" schreibe
    Und ich den Blur deaktiviere
    Und ich für die Karte "Wir haben gute Unit Tests" vote
    Und ich den Gewinner ermittle und mit "Ursachenforschung" starte
    Dann sollte die Sidebar den Anker "Wir haben gute Unit Tests" zeigen

    Wenn ich die Ursache "Gute Vorbereitung" eingebe
    Und ich für die Ursache "Gute Vorbereitung" vote
    Und ich den Ursachen-Gewinner ermittle und mit "Lösung finden" starte
    Dann sollte die Sidebar Anker und Ursache "Gute Vorbereitung" zeigen

    Wenn ich die Lösung "Checkliste aktualisieren" eingebe
    Und ich für die Lösung "Checkliste aktualisieren" vote
    Und ich "Massnahme sichern & Nächstes Thema" klicke
    Dann sollte ich wieder in Phase 1 sein
  Szenario: Mehrere Kategorie-Gewinner zeigen Drill-Down Buttons
    Gegeben sei ich bin auf der Startseite im Test-Modus
    Wenn ich eine neue Session namens "Multi Winner Session" erstelle
    Und ich eine Karte "Gutes Teamwork" in der Kategorie "liked" schreibe
    Und ich eine Karte "Bessere Doku" in der Kategorie "longed" schreibe
    Und ich den Blur deaktiviere
    Und ich für die Karte "Gutes Teamwork" vote
    Und ich für die Karte "Bessere Doku" vote
    Dann sollten beide Karten "Gutes Teamwork" und "Bessere Doku" einen Drill-Down Button zeigen

  Szenario: Fehlerszenario: Join mit falschem Code
    Gegeben sei ich bin auf der Startseite im Test-Modus
    Wenn ich "FALSCH" als Session Code eingebe und beitrete
    Dann sollte ich eine Fehlermeldung mit "Session-ID nicht gefunden!" sehen

  Szenario: Zwei Themen nacheinander bearbeiten
    Gegeben sei ich bin auf der Startseite im Test-Modus
    Wenn ich eine neue Session namens "Sequential Drilling Session" erstelle
    Und ich eine Karte "Thema A" in der Kategorie "liked" schreibe
    Und ich eine Karte "Thema B" in der Kategorie "learned" schreibe
    Und ich für die Karte "Thema A" vote
    Und ich den Gewinner ermittle und mit "Ursachenforschung" starte
    Und ich die Ursache "Ursache A" eingebe
    Und ich für die Ursache "Ursache A" vote
    Und ich den Ursachen-Gewinner ermittle und mit "Lösung finden" starte
    Und ich die Lösung "Massnahme A" eingebe
    Und ich für die Lösung "Massnahme A" vote
    Und ich "Massnahme sichern & Nächstes Thema" klicke
    Dann sollte ich wieder in Phase 1 sein
    Und die Karte "Thema A" sollte einen "DRILLED" Indikator zeigen
    Wenn ich für die Karte "Thema A" den Vote entferne
    Und ich für die Karte "Thema B" vote
    Und ich den Gewinner ermittle und mit "Ursachenforschung" starte
    Und ich die Ursache "Ursache B" eingebe
    Und ich für die Ursache "Ursache B" vote
    Und ich den Ursachen-Gewinner ermittle und mit "Lösung finden" starte
    Und ich die Lösung "Massnahme B" eingebe
    Und ich für die Lösung "Massnahme B" vote
    Und ich "Massnahme sichern & Nächstes Thema" klicke
    Und ich zu Phase 4 wechsle
    Dann sollte das Eingabefeld nicht mehr sichtbar sein
    Und ich die Retro abschliesse
    Dann sollte die Tabelle in Phase 4 sowohl "Massnahme A" als auch "Massnahme B" enthalten

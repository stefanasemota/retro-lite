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

    Wenn ich die Lösung "Review-Prozess beibehalten" eingebe
    Und ich für die Lösung "Review-Prozess beibehalten" vote
    Und ich den Lösungs-Gewinner ermittle und mit "Massnahme festlegen" starte
    Dann sollte die Sidebar den vollen Kontext-Pfad ⚓ 🔍 💡 zeigen

    Wenn ich die Massnahme "Checkliste aktualisieren" eingebe
    Und ich für die Massnahme "Checkliste aktualisieren" vote
    Dann sollte die Karte "Checkliste aktualisieren" als finaler Winner markiert sein

  Szenario: Mehrere Kategorie-Gewinner zeigen Drill-Down Buttons
    Gegeben sei ich bin auf der Startseite im Test-Modus
    Wenn ich eine neue Session namens "Multi Winner Session" erstelle
    Und ich eine Karte "Gutes Teamwork" in der Kategorie "liked" schreibe
    Und ich eine Karte "Bessere Doku" in der Kategorie "longed" schreibe
    Und ich den Blur deaktiviere
    Und ich für die Karte "Gutes Teamwork" vote
    Und ich für die Karte "Bessere Doku" vote
    Dann sollten beide Karten "Gutes Teamwork" und "Bessere Doku" einen Drill-Down Button zeigen

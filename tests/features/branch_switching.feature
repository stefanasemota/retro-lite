# language: de
Funktionalität: Branch-Navigation und Kontext-Sync

  Szenario: Wechsel zwischen zwei parallelen Drill-Downs
    Gegeben sei ich bin auf der Startseite im Test-Modus
    Wenn ich eine neue Session namens "Branch Test Session" erstelle
    Und ich eine Karte "Thema A" in der Kategorie "liked" schreibe
    Und ich eine Karte "Thema B" in der Kategorie "liked" schreibe
    Und ich den Blur deaktiviere
    Und ich für die Karte "Thema A" vote
    Und ich den Gewinner ermittle und mit "Ursachenforschung" starte
    Dann sollte der Context-Header "⚓ Thema A" zeigen
    
    Wenn ich zurück zu Phase 1 springe
    Und ich für die Karte "Thema A" vote
    Und ich für die Karte "Thema B" vote
    Und ich den Gewinner ermittle und mit "Ursachenforschung" starte
    Dann sollte der Context-Header "⚓ Thema B" zeigen
    
    Wenn ich im Control Tower den Branch "Thema A" anklicke
    Dann sollte der Context-Header "⚓ Thema A" zeigen

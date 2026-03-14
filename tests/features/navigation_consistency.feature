# language: de
Funktionalität: Navigations-Konsistenz

  Szenario: Konsistenz beim Wechsel von Phase 2 zurück zu Phase 1
    Gegeben sei ich bin auf der Startseite im Test-Modus
    Wenn ich eine neue Session namens "Consistency Session" erstelle
    Und ich eine Karte "Unit Tests verbessern" in der Kategorie "liked" schreibe
    Und ich den Blur deaktiviere
    Und ich für die Karte "Unit Tests verbessern" vote
    Dann sollte die Karte "Unit Tests verbessern" 1 Stimme zeigen
    
    Wenn ich den Gewinner ermittle und mit "Ursachenforschung" starte
    Dann sollte der Context-Header "⚓ Unit Tests verbessern" zeigen
    
    Wenn ich zurück zu Phase 1 springe
    Dann sollte die Karte "Unit Tests verbessern" 1 Stimme zeigen
    Und die Karte "Unit Tests verbessern" sollte einen "Drilled" Indikator zeigen
    Und der Context-Header sollte "4L Übersicht" und "1 Branches aktiv" zeigen

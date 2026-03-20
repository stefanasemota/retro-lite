Feature: Voting Logic and Tie Handling

  Scenario: Mehrere Gewinner in einer Kategorie anzeigen
    Given ich bin in einer aktiven Retro-Session in Phase 1
    And es existieren zwei Karten "Problem A" und "Problem B" in der Kategorie "Lacked"
    When ich für "Problem A" 2 Stimmen abgebe
    And ich für "Problem B" 2 Stimmen abgebe
    Then sollte die Karte "Problem A" den Button "Ursachenforschung starten" zeigen
    And sollte die Karte "Problem B" den Button "Ursachenforschung starten" zeigen

# Feature: Synchronized Facilitator Timer
# As a host, I want to run a shared countdown timer visible to all participants
# so that time-boxed discussions stay on schedule.

Feature: Synchronized Facilitator Timer

  Background:
    Given I am the host of a "Team A" retrospective session
    And all participants have joined the session

  # ── BDD Scenario 1: Host starts the timer ───────────────────────────────────
  Scenario: Host starts a 5-minute timer and all participants see the countdown
    Given I set the timer input to "05:00"
    When I click the "Start" button
    Then the timer display should show "00:05:00"
    And all participants should see the same countdown begin from "00:05:00"
    And the timer display should turn green with a pulsing indicator

  # ── BDD Scenario 2: Timer reaches zero and pulses red ───────────────────────
  Scenario: Timer expires and pulses red
    Given the host has started a timer from "00:00:05" (5 seconds)
    When 5 seconds have elapsed
    Then the timer display should show "00:00:00"
    And the timer display should pulse red to signal time is up

  # ── BDD Scenario 3: Host pauses and resumes the timer ───────────────────────
  Scenario: Host pauses the timer mid-countdown
    Given the host has started a timer from "05:00"
    When the host clicks "Pause" (the Stop button while running)
    Then the timer should stop decrementing
    And the current remaining time should be preserved
    When the host clicks "Start" again
    Then the countdown should resume from the preserved time

  # ── BDD Scenario 4: Host resets the timer ───────────────────────────────────
  Scenario: Host resets the timer to the input value
    Given the host has started a timer from "05:00"
    When the host clicks the "Reset" button
    Then the timer should return to "00:05:00" (the value in the input field)
    And the timer should stop running

  # ── BDD Scenario 5: Non-host cannot see timer controls ──────────────────────
  Scenario: Participant sees timer display but not controls
    Given I am a participant (not the host)
    And the host has started a timer
    Then I should see the timer display showing the countdown
    But I should NOT see the Start, Stop, or Reset buttons

  # ── BDD Scenario 6: Timer survives page refresh (drift-free) ────────────────
  Scenario: Participant refreshes page while timer is running
    Given the host has started a timer from "10:00"
    And 30 seconds have elapsed
    When a participant refreshes their browser tab
    Then the timer should display approximately "00:09:30"
    And NOT "00:10:00" (proving it reads from the server endTime, not a local counter)

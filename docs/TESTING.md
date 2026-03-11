# Testing Strategy - Retro-Lite v2

## 🎯 Philosophy
We combine **Pure Logic Unit Testing** with **Behavior-Driven Development (BDD)** to ensure both mathematical correctness and a seamless user experience.

---

## 🛠️ Tooling

### 1. Unit Testing
- **Vitest**: Blazing fast unit test runner.
- **JSDOM**: Browser environment simulation for UI logic.

### 2. BDD / E2E Testing
- **Cucumber**: Gherkin-based scenario definitions.
- **Playwright**: Browser automation for end-to-end flows.
- **Vite Plugin**: Seamless integration of Cucumber steps into the Vitest pipeline.

---

## 🏃 Running Tests

### Unit Tests
```bash
npm test
```

### BDD Tests (Cucumber)
BDD tests run as part of the Vitest suite or can be triggered via:
```bash
npx vitest run tests/features
```

---

## 🧪 Test Coverage

### 1. Core Logic (Unit)
Located in `tests/unit/logic.test.js`:
- **Winner Identification**: Highest votes win, FIFO tie-breaking (older wins).
- **Navigation History**: Clean registry, no double-entries.
- **Phase Mapping**: Depth of `drillPath` determines Phase (1-4).

### 2. Retro Flow (BDD)
Located in `tests/features/full_retro_flow.feature` & `tests/steps/retro_flow.steps.ts`:
- **Scrum Master Flow**: Session creation and view management.
- **Participant Flow**: Joining and entry submission.
- **Interaction**: Voting, blurring/unblurring, and drilling into deeper phases.

---

## 🔐 Authentication Mocking (`testMode`)
To facilitate automated testing without real Firebase Auth interactions, the app supports a `?testMode=true` flag.

- **URL Parameter**: `?testMode=true&role=admin|participant`
- **Logic**: Bypasses Google Sign-In and sets a mock user.
  - **Admin**: `Stephan Admin`
  - **Participant**: `Michael Participant`

---

## 🏗️ Writing New Tests

### Unit Tests
Add `.test.js` files to `tests/unit/`.

### BDD Tests
1. Create a `.feature` file in `tests/features/`.
2. Implement steps in `tests/steps/`.
3. Use `data-testid` attributes in the UI for stable selectors.

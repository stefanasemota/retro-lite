# Testing Strategy - Retro-Lite v2

## Philosophy
We prioritize **Pure Logic Testing** to ensure that the mathematical core of the application (Winners, Phases, History) is 100% reliable and independent of the UI or Database.

## Tooling
- **Vitest**: Modern, blazing fast test runner.
- **JSDOM**: Simulates a browser environment for UI-related unit tests.

## Running Tests
To execute the test suite once:
```bash
npm test
```

## Test Coverage

### 1. Winner Identification (`getWinner`)
- Verifies that the highest vote count wins.
- Ensures **FIFO stability**: If votes are tied, the older entry (smaller timestamp) wins.

### 2. Navigation Logic (`updateHistory`)
- Ensures that the history registry remains clean and contains no duplicate IDs.

### 3. Phase Mapping (`calculateCurrentPhase`)
- Guards the correlation between the `drillPath` depth and the application phase (1-4).

## Writing New Tests
All unit tests should be placed in `tests/unit/`. Example:
```javascript
import { describe, it, expect } from 'vitest';
import { someFunction } from '../../src/components';

describe('Function Name', () => {
  it('should work', () => {
    // expect(...)
  });
});
```

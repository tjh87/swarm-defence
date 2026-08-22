import { Scenario } from '../types';
import { SCENARIOS } from './scenarios';
import { FAMOUS_SCENARIOS } from './famousScenarios';

const CUSTOM_SCENARIOS_STORAGE_KEY = 'cyber_defense_custom_scenarios_v1';

export function getCustomScenariosFromStorage(): Scenario[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SCENARIOS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(s => ({ ...s, isCustom: true }));
    }
    return [];
  } catch (err) {
    console.error('Failed to load custom scenarios from localStorage', err);
    return [];
  }
}

export function saveCustomScenario(scenario: Scenario): Scenario[] {
  try {
    const existing = getCustomScenariosFromStorage();
    const updated = [
      ...existing.filter(s => s.id !== scenario.id),
      { ...scenario, isCustom: true }
    ];
    localStorage.setItem(CUSTOM_SCENARIOS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save custom scenario', err);
    return [];
  }
}

export function deleteCustomScenario(scenarioId: string): Scenario[] {
  try {
    const existing = getCustomScenariosFromStorage();
    const updated = existing.filter(s => s.id !== scenarioId);
    localStorage.setItem(CUSTOM_SCENARIOS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete custom scenario', err);
    return [];
  }
}

export function getAllScenarios(customList?: Scenario[]): Scenario[] {
  const custom = customList || getCustomScenariosFromStorage();
  // Ensure no duplicate IDs
  const knownIds = new Set<string>();
  const all: Scenario[] = [];

  // 1. Famous Historical Scenarios First (Prominent!)
  for (const s of FAMOUS_SCENARIOS) {
    if (!knownIds.has(s.id)) {
      knownIds.add(s.id);
      all.push(s);
    }
  }

  // 2. Custom User-Created Scenarios
  for (const s of custom) {
    if (!knownIds.has(s.id)) {
      knownIds.add(s.id);
      all.push(s);
    }
  }

  // 3. Base Standard Scenarios
  for (const s of SCENARIOS) {
    if (!knownIds.has(s.id)) {
      knownIds.add(s.id);
      all.push(s);
    }
  }

  return all;
}

export function exportCustomScenariosToJson(): string {
  const custom = getCustomScenariosFromStorage();
  return JSON.stringify(custom, null, 2);
}

export function importCustomScenariosFromJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const scenariosArray: Scenario[] = Array.isArray(parsed) ? parsed : [parsed];

    if (scenariosArray.length === 0 || !scenariosArray[0].name) {
      return { success: false, count: 0, error: 'Invalid scenario JSON schema. Expected Scenario array or object.' };
    }

    const existing = getCustomScenariosFromStorage();
    const existingMap = new Map(existing.map(s => [s.id, s]));

    for (const item of scenariosArray) {
      const sanitizedId = item.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      existingMap.set(sanitizedId, {
        ...item,
        id: sanitizedId,
        isCustom: true
      });
    }

    const updated = Array.from(existingMap.values());
    localStorage.setItem(CUSTOM_SCENARIOS_STORAGE_KEY, JSON.stringify(updated));

    return { success: true, count: scenariosArray.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'JSON parse error' };
  }
}

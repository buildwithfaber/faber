// Runs against the Firestore emulator: `npm run test:rules`.
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';

const USER_ID = 'alice';
const inOneDay = () => Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000);

function validMatch(overrides: Record<string, unknown> = {}) {
  return {
    creatorId: USER_ID,
    startsAt: inOneDay(),
    location: 'Padel Club Mitte',
    maxPlayers: 4,
    createdAt: serverTimestamp(),
    ...overrides,
  };
}

let env: RulesTestEnvironment;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-padel-app',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

describe('matches/{matchId}', () => {
  it('lets a signed-in user create a match with their own user id', async () => {
    const db = env.authenticatedContext(USER_ID).firestore();
    await assertSucceeds(addDoc(collection(db, 'matches'), validMatch()));
  });

  it('accepts the smallest allowed player count', async () => {
    const db = env.authenticatedContext(USER_ID).firestore();
    await assertSucceeds(addDoc(collection(db, 'matches'), validMatch({ maxPlayers: 2 })));
  });

  it('rejects a match created by a signed-out user', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(addDoc(collection(db, 'matches'), validMatch()));
  });

  it("rejects a match created in another user's name", async () => {
    const db = env.authenticatedContext(USER_ID).firestore();
    await assertFails(addDoc(collection(db, 'matches'), validMatch({ creatorId: 'bob' })));
  });

  for (const field of ['creatorId', 'startsAt', 'location', 'maxPlayers', 'createdAt']) {
    it(`rejects a match without ${field}`, async () => {
      const db = env.authenticatedContext(USER_ID).firestore();
      const data = validMatch();
      delete (data as Record<string, unknown>)[field];
      await assertFails(addDoc(collection(db, 'matches'), data));
    });
  }

  const invalidValues: [string, Record<string, unknown>][] = [
    ['an empty location', { location: '   ' }],
    ['a location over 100 characters', { location: 'x'.repeat(101) }],
    ['too few players', { maxPlayers: 1 }],
    ['too many players', { maxPlayers: 5 }],
    ['a non-integer player count', { maxPlayers: 2.5 }],
    ['a start time in the past', { startsAt: Timestamp.fromMillis(Date.now() - 60_000) }],
    ['a client-chosen createdAt', { createdAt: Timestamp.now() }],
    ['unexpected fields', { players: [USER_ID] }],
  ];
  for (const [description, overrides] of invalidValues) {
    it(`rejects a match with ${description}`, async () => {
      const db = env.authenticatedContext(USER_ID).firestore();
      await assertFails(addDoc(collection(db, 'matches'), validMatch(overrides)));
    });
  }

  it('lets signed-in users read matches, but not signed-out users', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'matches/m1'), validMatch());
    });
    await assertSucceeds(getDoc(doc(env.authenticatedContext('bob').firestore(), 'matches/m1')));
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'matches/m1')));
  });

  it('does not allow updating or deleting matches', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'matches/m1'), validMatch());
    });
    const db = env.authenticatedContext(USER_ID).firestore();
    await assertFails(updateDoc(doc(db, 'matches/m1'), { location: 'Anderer Club' }));
    await assertFails(deleteDoc(doc(db, 'matches/m1')));
  });
});

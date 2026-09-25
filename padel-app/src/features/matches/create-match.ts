import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';

import type { ValidMatch } from './validation';

export const MATCHES_COLLECTION = 'matches';

/**
 * Stores a new match owned by the currently signed-in user and returns its document id.
 * Firestore security rules enforce the same constraints server-side (see firestore.rules).
 */
export async function createMatch(match: ValidMatch): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Du musst angemeldet sein, um ein Match zu erstellen.');
  }

  const ref = await addDoc(collection(db, MATCHES_COLLECTION), {
    creatorId: user.uid,
    startsAt: Timestamp.fromDate(match.startsAt),
    location: match.location,
    maxPlayers: match.maxPlayers,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

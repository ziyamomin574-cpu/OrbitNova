import { db } from './index.ts';

export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoUrl?: string) {
  await db.execute(
    `INSERT INTO app_users (uid, email, display_name, photo_url)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE email = VALUES(email), display_name = VALUES(display_name), photo_url = VALUES(photo_url)`,
    [uid, email, displayName || null, photoUrl || null],
  );
  const [rows] = await db.execute(
    'SELECT id, uid, email, display_name AS displayName, photo_url AS photoUrl, created_at AS createdAt FROM app_users WHERE uid = ? LIMIT 1',
    [uid],
  );
  return (rows as any[])[0] || null;
}

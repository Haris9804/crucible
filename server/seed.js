// First-run seed. Populates admin creds, keys, and the two starter CTFs only
// when their collections are empty. Teams and results always start empty.
import { getDb } from './db.js';
import { hashPassword } from './auth.js';

// Flags are embedded in each CTF document (flagNum / answers / hints are native arrays).
const SEED_CTFS = [
  {
    _id: '10001',
    name: 'METAsploit 0.2v',
    slug: 'ctf1',
    status: 'Active',
    instructions: ['Updated systems.', 'Updated tools.', 'Follow legal guide lines.'],
    flags: [
      { flagNum: 1, name: 'Machine IP', answers: ['192.168.1.11'], points: 25, status: 'Active',
        hints: ['Flag Format: 192.168.*.*', 'Use nmap tool', 'More than 20 ports are in open state'] },
      { flagNum: 2, name: 'Which service is running on 1524', answers: ['bindshell'], points: 25, status: 'Active',
        hints: ['Flag Format: bi*****ll'] },
      { flagNum: 3, name: 'Simple 234', answers: ['vsFTP234'], points: 25, status: 'Active',
        hints: ['Flag Format: v*****34', 'Answer in Flag1.txt', 'Check Port 21', 'Check for "anonymous" login', 'Passive mode to get Flag'] },
      { flagNum: 4, name: 'Direct Root Shell', answers: ['root@meta-shell'], points: 25, status: 'Active',
        hints: ['Flag Format: r***@****-****l', 'Search for interesting folder in /home', 'A root shell vulnerability', 'I heard "Network Cat" is a good weapon'] },
      { flagNum: 5, name: 'Specify only the exploit used', answers: ['multi/samba/usermap_script'], points: 50, status: 'Active',
        hints: ['Flag Format: mu***/*****/*******_****pt', 'Use msfconsole', 'Find the script that works', 'Enter the same exploit', 'Ask AI'] },
    ],
  },
  {
    _id: '10002',
    name: 'Cyber Tyfoon',
    slug: 'ctf2',
    status: 'Active',
    instructions: ['Find the hidden flag in the website.', 'Use source code analysis.'],
    flags: [
      { flagNum: 1, name: 'How many open ports?', answers: ['2'], points: 10, status: 'Active',
        hints: ['Use nmap'] },
      { flagNum: 2, name: 'Which tool used for directory enumeration?', answers: ['gobuster', 'dirbuster'], points: 30, status: 'Active',
        hints: ['Answer: go******', 'Web page directory enumeration tool'] },
      { flagNum: 3, name: 'Enter useful URL found', answers: ['http://192.168.1.10/admin/'], points: 30, status: 'Active',
        hints: ['Answer: http://192.********/ad***/', 'URL of the page with login credentials'] },
      { flagNum: 4, name: 'Enter the final flag', answers: ['W3b_@dm|n_1o9in_Succe$$'], points: 30, status: 'Active',
        hints: ['Answer: W3b********ce$$', 'SQLi'] },
    ],
  },
];

export async function seedIfEmpty() {
  const db = getDb();

  if ((await db.collection('admin').countDocuments()) === 0) {
    // Seeded Active so registration/passkey-login work out of the box; the
    // admin can deactivate either key from the dashboard.
    await db.collection('admin').insertOne({ _id: 'admin', username: 'admin', passwordHash: hashPassword('admin123') });
  }

  if ((await db.collection('appKeys').countDocuments()) === 0) {
    await db.collection('appKeys').insertMany([
      { _id: 'master', value: 'CTF-MK-87626', status: 'Active' },
      { _id: 'pass', value: 'PK89661', status: 'Active' },
    ]);
  }

  if ((await db.collection('ctfs').countDocuments()) === 0) {
    await db.collection('ctfs').insertMany(SEED_CTFS);
  }
}

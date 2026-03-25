import 'dotenv/config';
import { sign } from 'jsonwebtoken';

type Role = 'admin' | 'manager' | 'mentor' | 'student';

const [eventId, roleArg] = process.argv.slice(2);
const role = roleArg as Role;

if (!eventId || !role || !['admin', 'manager', 'mentor', 'student'].includes(role)) {
  console.error('Usage: yarn generate-token <event-id> <admin|manager|mentor|student>');
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET || 'local-dev-secret';
const jwtAudience = process.env.JWT_AUDIENCE || 'showcase';

const payloadByRole: Record<Role, Record<string, unknown>> = {
  admin: {
    a: true,
    e: eventId,
  },
  manager: {
    a: false,
    u: 'event-manager',
    e: eventId,
    jvr: true,
  },
  mentor: {
    a: false,
    u: 'alice-mentor',
    e: eventId,
  },
  student: {
    a: false,
    u: 'ava-student',
    e: eventId,
  },
};

const tokenPayload = payloadByRole[role];
const token = sign(tokenPayload, jwtSecret, {
  audience: jwtAudience,
  algorithm: 'HS256',
  expiresIn: '7d',
});

console.log(token);

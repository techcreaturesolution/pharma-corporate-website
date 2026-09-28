/**
 * Creates (or resets the password of) an admin account without any public endpoint.
 *
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='StrongPass123' ADMIN_NAME='Site Admin' npm run create-admin
 *
 * Role defaults to `superadmin`; override with ADMIN_ROLE=admin|editor.
 */
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../modules/auth/user.model.js';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || 'Site Admin';
const role = process.env.ADMIN_ROLE || 'superadmin';

if (!email || !password) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  process.exit(1);
}
if (password.length < 10) {
  console.error('ADMIN_PASSWORD must be at least 10 characters');
  process.exit(1);
}

await connectDatabase();
let user = await User.findOne({ email: email.toLowerCase() }).select('+tokenVersion');
if (user) {
  await user.setPassword(password);
  user.role = role;
  user.isActive = true;
  user.tokenVersion += 1;
  await user.save();
  console.log(`Updated existing user ${email} (role=${role})`);
} else {
  user = new User({ name, email, role });
  await user.setPassword(password);
  await user.save();
  console.log(`Created ${role} ${email}`);
}
await disconnectDatabase();

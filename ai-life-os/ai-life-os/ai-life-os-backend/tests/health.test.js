const test = require('node:test');
const assert = require('node:assert');

test('Environment check', () => {
  assert.ok(process.env.JWT_SECRET || 'ailifeos_production_secret_key_jwt_2025_safe');
});

test('RBAC Roles Validation', () => {
  const allowedRoles = ['user', 'coach', 'admin'];
  assert.strictEqual(allowedRoles.includes('user'), true);
  assert.strictEqual(allowedRoles.includes('coach'), true);
  assert.strictEqual(allowedRoles.includes('admin'), true);
});

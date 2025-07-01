import { checkAuth } from '../src/common/auth';

describe('checkAuth flag', () => {
  it('allows access when AUTH_OFF is true', () => {
    process.env.AUTH_OFF = 'true';
    expect(checkAuth()).toBe(true);
  });

  it('denies access when AUTH_OFF is false', () => {
    process.env.AUTH_OFF = 'false';
    expect(checkAuth()).toBe(false);
  });
}); 
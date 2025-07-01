export function checkAuth() {
  // докато AUTH_OFF=true – пускаме всички
  return process.env.AUTH_OFF === 'true';
} 
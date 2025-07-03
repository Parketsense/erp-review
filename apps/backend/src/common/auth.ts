export function checkAuth() {
  // докато AUTH_OFF=true – пускаме всички
  // Ако AUTH_OFF не е зададена, по подразбиране пускаме всички в development
  return process.env.AUTH_OFF === 'true' || process.env.NODE_ENV === 'development';
} 
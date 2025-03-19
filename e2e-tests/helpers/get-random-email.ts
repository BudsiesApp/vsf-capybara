export function getRandomEmail () {
  return `test-${Math.random().toString(36).slice(2)}@test.test`;
}

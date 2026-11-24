import { phoneCountries } from './phone-input';

describe('phone input helpers', () => {
  it('lists all supported countries by name with US first', () => {
    const names = phoneCountries.slice(1).map((item) => item.name);

    expect(phoneCountries[0]).toEqual({
      code: 'US',
      name: 'United States',
      callingCode: '1'
    });
    expect(phoneCountries.find((item) => item.code === 'AC')?.name).toBe('Ascension Island');
    expect(phoneCountries.find((item) => item.code === 'SS')?.name).toBe('South Sudan');
    expect(phoneCountries.find((item) => item.code === 'TA')?.name).toBe('Tristan da Cunha');
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});

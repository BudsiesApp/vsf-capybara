import { resolveProductCardLink } from './resolve-product-card-link';

describe('resolveProductCardLink', () => {
  it('returns string links without invoking the router', () => {
    const resolveRoute = jest.fn();

    expect(resolveProductCardLink('/products/plushie', resolveRoute)).toBe('/products/plushie');
    expect(resolveRoute).not.toHaveBeenCalled();
  });

  it('uses the localized route full path when available', () => {
    const resolveRoute = jest.fn();

    expect(resolveProductCardLink({ fullPath: '/en/products/plushie' }, resolveRoute))
      .toBe('/en/products/plushie');
    expect(resolveRoute).not.toHaveBeenCalled();
  });

  it('converts localized route parameters before resolving the route', () => {
    const resolveRoute = jest.fn(() => '/products/42');

    expect(resolveProductCardLink({
      name: 'product',
      params: { id: 42 }
    }, resolveRoute)).toBe('/products/42');
    expect(resolveRoute).toHaveBeenCalledWith({
      path: undefined,
      name: 'product',
      hash: undefined,
      params: { id: '42' }
    });
  });
});

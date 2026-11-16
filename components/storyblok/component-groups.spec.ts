import { readFileSync } from 'fs';
import { join } from 'path';
import { add, StoryblokComponentGroup } from 'src/modules/vsf-storyblok-module/components';
import registerComponents from './index';
import registerAffirm from 'src/modules/payment-affirm/components/storyblok';

jest.mock('src/modules/vsf-storyblok-module/components', () => ({
  add: jest.fn(),
  StoryblokComponentGroup: { CORE: 'core' }
}));

it('registers HTML and every named Storyblok chunk factory in CORE, leaving separate chunks in DEFAULT', () => {
  registerComponents();

  const registrations = (add as jest.Mock).mock.calls;
  const source = readFileSync(join(__dirname, 'index.ts'), 'utf8');
  const keys = Array.from(
    source.matchAll(/add\('([^']+)',.*webpackChunkName: "vsf-storyblok"/g),
    match => match[1]
  );

  expect(keys).toContain('html');

  for (const componentKey of keys) {
    expect(registrations.find(([name]) => name === componentKey)?.[2]).toEqual({
      group: StoryblokComponentGroup.CORE
    });
  }

  expect(registrations.find(([name]) => name === 'remind_me_about_budsies')?.[2]).toBeUndefined();

  (add as jest.Mock).mockClear();
  registerAffirm();

  expect((add as jest.Mock).mock.calls).toHaveLength(2);

  (add as jest.Mock).mock.calls.forEach(([, , options]) => expect(options?.group).toBeUndefined());
});

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { prepareSocialIcon } from './prepare-social-icon';

describe('social icon serialization', () => {
  it.each(['circled', 'plain'])('matches the browser serialization for all %s icons', iconSet => {
    const directory = join(__dirname, '../assets/social-icons', iconSet);
    const files = readdirSync(directory).filter(file => file.endsWith('.svg'));
    expect(files).toHaveLength(6);
    files.forEach(file => {
      const markup = prepareSocialIcon(readFileSync(join(directory, file), 'utf8'));
      const element = document.createElement('span');
      element.innerHTML = markup;
      expect(element.innerHTML).toBe(markup);
      expect(markup).toContain('currentColor');
    });
  });
});

import { Locator, Page } from '@playwright/test';
import path from 'path';

export async function uploadImage (page: Page, uploadPhotoWidget: Locator): Promise<void> {
  const fileChooserPromise = page.waitForEvent('filechooser');
  await uploadPhotoWidget.getByText('select file').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, '../assets/mock.jpeg'));
}

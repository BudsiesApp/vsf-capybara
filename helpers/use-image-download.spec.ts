import ImageHandlerService from 'src/modules/file-storage/image-handler.service';
import { useImageDownload } from './use-image-download';

describe('printout image download contract', () => {
  it('passes the stored path unchanged and saves with the supplied filename and URL cleanup', async () => {
    const originalFetch = global.fetch;
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    const handler = new ImageHandlerService('https://artwork.example.test/');
    const originalUrl = jest.spyOn(handler, 'getOriginalImageUrl');
    const imageBlob = new Blob(['artwork'], { type: 'image/png' });
    global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: jest.fn().mockResolvedValue(imageBlob) });
    URL.createObjectURL = jest.fn().mockReturnValue('blob:artwork');
    URL.revokeObjectURL = jest.fn();
    const save = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('printout.png');
      expect(this.href).toBe('blob:artwork');
    });
    try {
      await useImageDownload(handler).downloadImage('artwork-bucket/design.png', 'printout.png');
      expect(originalUrl).toHaveBeenCalledWith('artwork-bucket/design.png');
      expect(global.fetch).toHaveBeenCalledWith('https://artwork.example.test/artwork-bucket/design.png');
      expect(URL.createObjectURL).toHaveBeenCalledWith(imageBlob);
      expect(save).toHaveBeenCalledTimes(1);
      expect(document.querySelector('a[download]')).toBeNull();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:artwork');
    } finally {
      jest.restoreAllMocks();
      global.fetch = originalFetch;
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });
});

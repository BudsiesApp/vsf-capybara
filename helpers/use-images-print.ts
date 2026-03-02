import { ImageHandlerService } from 'src/modules/file-storage';

const PRINT_IFRAME_ID = 'app-print-iframe';

function createHiddenIframe (): HTMLIFrameElement {
  const existingIframe = document.getElementById(PRINT_IFRAME_ID);

  if (existingIframe && existingIframe.parentNode) {
    existingIframe.parentNode.removeChild(existingIframe);
  }

  const iframe = document.createElement('iframe');

  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.border = '0';
  iframe.style.pointerEvents = 'none';

  iframe.id = PRINT_IFRAME_ID;

  document.body.appendChild(iframe);

  return iframe;
}

function buildPrintHtml (imageUrls: string[]): string {
  const imagesHtml = imageUrls.map((url) => {
    return `
      <div class="page">
        <img src="${url}" alt=""/>
      </div>
    `;
  }).join('');

  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: letter; margin: 0; }
          html, body { height: 100%; margin: 0; padding: 0; }
          .page {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            page-break-after: always;
            break-after: page;
            position: relative;
            overflow: hidden;
          }
          .img-portrait {
            height: 100%;
            max-width: 100%;
            object-fit: contain;
          }
          .img-landscape {
            position: absolute;
            top: 50%;
            left: 50%;
            max-width: 100vh;
            max-height: 100vw;
            width: 100vh;
            height: 100vw;
            transform: translate(-50%, -50%) rotate(90deg);
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        ${imagesHtml}
      </body>
    </html>`;
}

async function waitForImagesToLoad (doc: Document): Promise<void> {
  const images = Array.prototype.slice.call(doc.images || []) as HTMLImageElement[];

  await Promise.all(images.map((img) => {
    return new Promise<void>((resolve, reject) => {
      if (img.complete && img.naturalWidth > 0) {
        resolve();
        return;
      }

      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  }));
}

function updateImagesOrientation (doc: Document): void {
  const images = Array.prototype.slice.call(doc.images || []) as HTMLImageElement[];

  for (const img of images) {
    if (img.naturalWidth > img.naturalHeight) {
      img.className = 'img-landscape';
    } else {
      img.className = 'img-portrait';
    }
  }
}

export function useImagesPrint (imageHandlerService: ImageHandlerService) {
  async function printImages (imageUrls: string[]): Promise<void> {
    if (!imageUrls || imageUrls.length === 0) {
      return;
    }

    const resolvedUrls = imageUrls.map((url) => imageHandlerService.getOriginalImageUrl(url));

    const iframe = createHiddenIframe();

    try {
      iframe.srcdoc = buildPrintHtml(resolvedUrls);

      const onLoad = new Promise<void>((resolve) => {
        iframe.onload = () => {
          resolve();
        }
      });

      await onLoad;

      const contentWindow = iframe.contentWindow;
      const doc = contentWindow && contentWindow.document;

      if (!doc || !contentWindow) {
        throw new Error('Print iframe is not available');
      }

      await waitForImagesToLoad(doc);
      updateImagesOrientation(doc)

      contentWindow.focus();
      contentWindow.print();
    } catch (e) {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }
  }

  return {
    printImages
  };
}

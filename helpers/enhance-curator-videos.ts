import {
  applyPlaybackChoice,
  createPlaybackPreference,
  curatorPlaybackKey,
  isVideoPaused
} from 'src/modules/shared/helpers/video-playback';
import {
  playbackButtonIcon,
  VIDEO_PLAYBACK_BUTTON_CLASS
} from 'src/modules/shared/helpers/video-playback-button';

const MARKER = 'data-video-playback-toggle';

export function enhanceCuratorVideos (
  container: HTMLElement,
  label: (paused: boolean) => string,
  preview: boolean
): () => void {
  const feeds = new Map<string, ReturnType<typeof createPlaybackPreference>>();
  const currentVideos = (feed: HTMLElement) =>
    Array.from(feed.querySelectorAll<HTMLVideoElement>(`video[${MARKER}]`));

  const scan = () => {
    const videos = container.querySelectorAll<HTMLVideoElement>('[id^="curator-feed-"] .crt-video-container video');

    for (const video of Array.from(videos)) {
      if (video.hasAttribute(MARKER)) {
        continue;
      }

      const feed = video.closest<HTMLElement>('[id^="curator-feed-"]') as HTMLElement;
      let preference = feeds.get(feed.id);

      if (!preference) {
        preference = createPlaybackPreference(curatorPlaybackKey(feed.id), preview);
        feeds.set(feed.id, preference);
        void preference.load(choice => {
          if (choice !== 'paused') {
            return;
          }

          currentVideos(feed).forEach(item => item.pause());
        });
      }

      const session = preference;
      video.setAttribute(MARKER, '');

      const button = document.createElement('button');
      button.type = 'button';
      button.className = VIDEO_PLAYBACK_BUTTON_CLASS;

      const icon = document.createElement('span');
      icon.className = 'video-playback-toggle__icon';
      icon.setAttribute('aria-hidden', 'true');
      button.appendChild(icon);

      const update = () => {
        const paused = isVideoPaused(video);

        button.setAttribute('aria-label', label(paused));
        icon.innerHTML = playbackButtonIcon(paused);
      };

      video.addEventListener('play', () => {
        if (!preview && session.choice === 'paused') {
          video.pause();
        }

        update();
      });
      video.addEventListener('pause', update);
      video.addEventListener('ended', update);
      button.addEventListener('click', event => {
        event.stopPropagation();
        event.preventDefault();

        const choice = isVideoPaused(video) ? 'playing' : 'paused';

        session.save(choice);
        currentVideos(feed).forEach(item => applyPlaybackChoice(item, choice));
      });

      (video.closest('.crt-video-container') as HTMLElement).appendChild(button);

      if (!preview && session.choice === 'paused') {
        video.pause();
      }

      update();
    }
  };

  const observer = new MutationObserver(scan);
  observer.observe(container, {
    childList: true,
    subtree: true
  });
  scan();

  return () => {
    observer.disconnect();
    feeds.forEach(preference => preference.dispose());
  };
}

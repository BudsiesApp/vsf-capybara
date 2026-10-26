<template>
  <div
    class="storyblok-html-renderer layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <div class="_no-script-html"
         v-html="noScriptHtml"
    />

    <div class="_script-container" ref="scriptContainer" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { isServer } from '@vue-storefront/core/helpers';
import { useI18n } from '@vue-storefront/core/application-services';
import { isStoryblokPreview } from 'src/modules/vsf-storyblok-module/helpers/is-storyblok-preview.function';
import { enhanceCuratorVideos } from '../../helpers/enhance-curator-videos';
import { Blok } from 'src/modules/vsf-storyblok-module/components'

import HtmlData from './interfaces/html-data.interface';

export default defineComponent({
  extends: Blok,
  name: 'StoryblokHtmlRenderer',
  computed: {
    itemData (): HtmlData {
      return this.item as HtmlData;
    },
    noScriptHtml (): string {
      if (this.doesHtmlContainScript) {
        return '';
      }

      return this.itemData.html;
    },
    doesHtmlContainScript (): boolean {
      return this.itemData.html.includes('<script');
    }
  },
  props: {
    item: {
      type: Object as PropType<HtmlData>,
      required: true
    }
  },
  setup (props) {
    const scriptContainer = ref<HTMLElement | null>(null);
    const preview = ref(false);
    const i18n = useI18n();
    const html = computed(() => (props.item as HtmlData).html);

    let dispose: (() => void) | undefined;
    let stop: (() => void) | undefined;

    const clear = () => {
      dispose?.();
      dispose = undefined;

      if (scriptContainer.value) {
        scriptContainer.value.innerHTML = '';
      }
    };

    const render = () => {
      clear();

      const container = scriptContainer.value;

      if (!container || !html.value.includes('<script')) {
        return;
      }

      container.innerHTML = html.value;
      dispose = enhanceCuratorVideos(
        container,
        paused => String(paused ? i18n.t('Play video') : i18n.t('Pause video')),
        preview.value
      );
      const scriptTags: HTMLScriptElement[] = Array.from(container.querySelectorAll('script'));

      for (const oldScript of scriptTags) {
        const newScript = document.createElement('script');
        const scriptAttributes: Attr[] = Array.from(oldScript.attributes);

        for (const attr of scriptAttributes) {
          newScript.setAttribute(attr.name, attr.value);
        }

        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      }
    };

    onMounted(() => {
      if (isServer) {
        return;
      }

      preview.value = isStoryblokPreview();
      render();
      stop = watch(html, render);
    });

    onBeforeUnmount(() => {
      stop?.();
      clear();
    });

    return {
      scriptContainer
    };
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-html-renderer {
  &.-editor-preview-mode {
    ._no-script-html,
    ._script-container {
      pointer-events: none
    }
  }

  @include display-property-handling;
}
</style>

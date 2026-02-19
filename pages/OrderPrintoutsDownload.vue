<template>
  <div id="order-printouts-download">
    <div v-if="showNotFound" class="_not-found">
      <SfHeading :level="4" :title="$t('Order not found')" />

      <router-link
        :to="{ name: 'orders-history' }"
        class="sf-button _order-history-link"
      >
        {{ $t('Go To Order History') }}
      </router-link>
    </div>

    <div v-else-if="isLoading" class="_loading">
      <div class="_heading-placeholder _placeholder" />
      <div class="_content-placeholder _placeholder" />
    </div>

    <div v-else class="_content">
      <SfHeading
        :level="1"
        :title="$t('Download Printouts')"
        class="_title"
      />

      <div v-if="eligibleItems.length === 0" class="_empty">
        <SfHeading :level="4" :title="$t('No artworks available for download')" />

        <router-link
          :to="{ name: 'orders-history' }"
          class="sf-button _order-history-link"
        >
          {{ $t('Go To Order History') }}
        </router-link>
      </div>

      <template v-else>
        <div class="_batch-actions">
          <SfButton
            class="_batch-action sf-button--text"
            type="button"
            @click="onDownloadAll"
          >
            {{ $t('Download all') }}
          </SfButton>

          <SfButton
            class="_batch-action sf-button--text"
            type="button"
            @click="onPrintAll"
          >
            {{ $t('Print all') }}
          </SfButton>
        </div>

        <div class="_items">
          <div
            v-for="item in eligibleItems"
            :key="item.item_id"
            class="_item"
          >
            <BaseImage
              class="_image"
              :src="getThumbnailUrl(item.artworkUrl)"
              alt=""
            />

            <div class="_actions">
              <SfButton type="button" @click="() => onDownload(item)">
                {{ $t('Download') }}
              </SfButton>

              <SfButton type="button" class="color-secondary" @click="() => onPrint(item)">
                {{ $t('Print') }}
              </SfButton>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType } from '@vue/composition-api';
import { SfButton, SfHeading } from '@storefront-ui/vue';

import i18n from '@vue-storefront/i18n';

import { BaseImage } from 'src/modules/budsies';
import { isFileUploadValue } from 'src/modules/customization-system/types/is-file-upload-value.typeguard';
import { ImageHandlerService } from 'src/modules/file-storage';
import { BudsieStatus, useBatchImageDownload, useImageDownload, useImagesPrint } from 'src/modules/shared';
import { useOrderDetails, Order } from 'src/modules/orders-history';

export default defineComponent({
  name: 'OrderPrintoutsDownload',
  components: {
    BaseImage,
    SfButton,
    SfHeading
  },
  props: {
    orderId: {
      type: String as PropType<string>,
      required: true
    }
  },
  setup (props, context) {
    const root = context.root;
    const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');

    if (!imageHandlerService) {
      throw new Error('Image Handler Service is not defined');
    }

    const imageService = imageHandlerService;

    const { order, isLoading, isError } = useOrderDetails(context, props.orderId);
    const showNotFound = computed<boolean>(() => {
      return isError.value;
    });

    const eligibleItems = computed(() => {
      const _order = (order as any).value as Order | null;
      const items = _order?.items || [];

      const list: { item_id: number, artworkUrl: string }[] = [];

      for (const item of items) {
        if (item.progress_tracker?.status_id !== BudsieStatus.SENT_TO_CUSTOMER) {
          continue;
        }

        const customizationState = item.extension_attributes?.customization_states || [];

        let artworkUrl: string | undefined;

        for (const stateItem of customizationState) {
          if (!isFileUploadValue(stateItem.value)) {
            continue;
          }

          const value: any = stateItem.value;
          artworkUrl = Array.isArray(value) ? value[0]?.url : value?.url;
          break;
        }

        if (!artworkUrl) {
          continue;
        }

        list.push({ item_id: item.item_id, artworkUrl });
      }

      return list;
    });

    const { downloadImage } = useImageDownload(imageService);
    const { downloadImagesAsZip } = useBatchImageDownload(imageService);
    const { printImages } = useImagesPrint(imageService);

    function getThumbnailUrl (url: string): string {
      return imageService.getThumbnailUrl(url, 320, 320);
    }

    async function onDownload (item: { item_id: number, artworkUrl: string }): Promise<void> {
      try {
        await downloadImage(item.artworkUrl, `printout-${props.orderId}-${item.item_id}`);
      } catch (e) {
        root.$store.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: (e as Error).message || String(i18n.t('Something went wrong')),
          action1: { label: i18n.t('OK') }
        });
      }
    }

    async function onPrint (item: { item_id: number, artworkUrl: string }): Promise<void> {
      try {
        await printImages([item.artworkUrl]);
      } catch (e) {
        root.$store.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: (e as Error).message || String(i18n.t('Something went wrong')),
          action1: { label: i18n.t('OK') }
        });
      }
    }

    async function onDownloadAll (): Promise<void> {
      try {
        const entries = eligibleItems.value.map((item, index) => {
          return {
            url: item.artworkUrl,
            filename: `printout-${props.orderId}-${index + 1}.jpg`
          };
        });

        await downloadImagesAsZip(entries, `printouts-${props.orderId}.zip`);
      } catch (e) {
        root.$store.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: (e as Error).message || String(i18n.t('Something went wrong')),
          action1: { label: i18n.t('OK') }
        });
      }
    }

    async function onPrintAll (): Promise<void> {
      try {
        await printImages(
          eligibleItems.value.map((i) => i.artworkUrl)
        );
      } catch (e) {
        root.$store.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: (e as Error).message || String(i18n.t('Something went wrong')),
          action1: { label: i18n.t('OK') }
        });
      }
    }

    return {
      eligibleItems,
      getThumbnailUrl,
      isLoading,
      onDownload,
      onDownloadAll,
      onPrint,
      onPrintAll,
      showNotFound
    };
  },
  metaInfo (): any {
    return {
      title: this.$t('Download Printouts')
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "theme/css/mixins/form-placeholder-item.scss";

#order-printouts-download {
  box-sizing: border-box;

  ._title {
    margin-top: var(--spacer-lg);
    padding: 0 var(--spacer-sm);
  }

  ._loading {
    padding: 0 var(--spacer-sm);
    margin-top: var(--spacer-lg);
  }

  ._placeholder {
    @include form-placeholder-item;
  }

  ._heading-placeholder {
    height: 2.5rem;
    margin-bottom: var(--spacer-sm);
  }

  ._content-placeholder {
    height: 18rem;
  }

  ._not-found,
  ._empty {
    padding: 0 var(--spacer-sm);
    margin-top: var(--spacer-lg);
  }

  ._order-history-link {
    margin-top: var(--spacer-base);
  }

  ._batch-actions {
    display: flex;
    gap: var(--spacer-sm);
    padding: 0 var(--spacer-sm);
    margin-top: var(--spacer-base);
    flex-wrap: wrap;
  }

  ._items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--spacer-base);
    padding: 0 var(--spacer-sm);
    margin-top: var(--spacer-base);
  }

  ._item {
    border: 1px solid var(--c-light);
    padding: var(--spacer-sm);
    display: flex;
    flex-direction: column;
    gap: var(--spacer-sm);
  }

  ._image {
    width: 100%;
    height: auto;
    object-fit: contain;
  }

  ._actions {
    display: flex;
    gap: var(--spacer-sm);
    flex-wrap: wrap;
  }
}
</style>

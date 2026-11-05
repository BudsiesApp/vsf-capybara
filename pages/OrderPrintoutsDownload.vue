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
        :title="$t('Download Artworks')"
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
            class="_batch-action color-secondary"
            type="button"
            @click="onDownloadAll"
          >
            {{ $t('Download all') }}
          </SfButton>

          <SfButton
            class="_batch-action"
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
              :src="getThumbnailUrl(item.artworkUrl)"
              alt=""
            />

            <div class="_actions">
              <SfButton type="button" class="_item-action color-secondary" @click="() => onDownload(item)">
                {{ $t('Download') }}
              </SfButton>

              <SfButton type="button" class="_item-action" @click="() => onPrint(item)">
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
import { useStore } from '@vue-storefront/core/application-services';
import { computed, defineComponent, inject, PropType } from 'vue';
import { SfButton, SfHeading } from '@storefront-ui/vue';

import i18n from '@vue-storefront/i18n';

import { BaseImage } from 'src/modules/budsies';
import { isFileUploadValue } from 'src/modules/customization-system/types/is-file-upload-value.typeguard';
import { ImageHandlerService } from 'src/modules/file-storage';
import { BudsieStatus } from 'src/modules/shared';
import { useOrderDetails } from 'src/modules/orders-history';

import { useBatchImageDownload } from 'theme/helpers/use-batch-image-download';
import { getFileExtensionFromUrl } from 'theme/helpers/get-file-extension-from-url';
import { useImageDownload } from 'theme/helpers/use-image-download';
import { useImagesPrint } from 'theme/helpers/use-images-print';

const ELIGIBLE_PRODUCTS_SKUS = new Set<string>([
  'CustomBudsie1_bundle',
  'CustomSelfie_bundle',
  'classroomSelfie_bundle',
  'classroomBudsie_bundle',
  'customPals_bundle',
  'budsiesPuppet_bundle',
  'selfiesPuppet_bundle',
  'ForeversDog_bundle',
  'ForeversCat_bundle',
  'ForeversOther_bundle',
  'ShopifyForeversDog_bundle',
  'ShopifyForeversCat_bundle',
  'petsiesHuggables_bundle'
]);

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
    const applicationStore = useStore();
    const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');

    if (!imageHandlerService) {
      throw new Error('Image Handler Service is not defined');
    }

    const imageService = imageHandlerService;

    const { order, isLoading, isError } = useOrderDetails(props.orderId);
    const showNotFound = computed<boolean>(() => {
      return isError.value;
    });

    const eligibleItems = computed(() => {
      const _order = order.value;
      const items = _order?.items || [];

      const list: { item_id: number, artworkUrl: string }[] = [];

      for (const item of items) {
        if (!ELIGIBLE_PRODUCTS_SKUS.has(item.product.sku)) {
          continue;
        }

        if (item.progress_tracker?.status_id !== BudsieStatus.SENT_TO_CUSTOMER) {
          continue;
        }

        const customizationState = item.extension_attributes?.customization_states || [];

        let artworkUrl: string | undefined;

        for (const stateItem of customizationState) {
          if (!isFileUploadValue(stateItem.value)) {
            continue;
          }

          const value = stateItem.value;
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

    function onError (error: unknown): void {
      const message = (error as Error)?.message || String(i18n.t('Something went wrong'));

      applicationStore.dispatch('notification/spawnNotification', {
        type: 'danger',
        message,
        action1: { label: i18n.t('OK') }
      });
    }

    function getThumbnailUrl (url: string): string {
      return imageService.getThumbnailUrl(url, 320, 320);
    }

    async function onDownload (item: { item_id: number, artworkUrl: string }): Promise<void> {
      try {
        let filename = `artwork-${props.orderId}-${item.item_id}`;

        const extension = getFileExtensionFromUrl(item.artworkUrl);

        if (extension) {
          filename += `.${extension}`;
        }

        await downloadImage(item.artworkUrl, filename);
      } catch (e) {
        onError(e);
      }
    }

    async function onPrint (item: { item_id: number, artworkUrl: string }): Promise<void> {
      try {
        await printImages([item.artworkUrl]);
      } catch (e) {
        onError(e);
      }
    }

    async function onDownloadAll (): Promise<void> {
      try {
        const entries = eligibleItems.value.map((item) => {
          const extension = getFileExtensionFromUrl(item.artworkUrl);
          let filename = `artwork-${props.orderId}-${item.item_id}`;

          if (extension) {
            filename += `.${extension}`;
          }

          return {
            url: item.artworkUrl,
            filename
          };
        });

        await downloadImagesAsZip(entries, `artworks-${props.orderId}.zip`);
      } catch (e) {
        onError(e);
      }
    }

    async function onPrintAll (): Promise<void> {
      try {
        await printImages(
          eligibleItems.value.map((i) => i.artworkUrl)
        );
      } catch (e) {
        onError(e);
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
      title: this.$t('Download Artworks')
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
  }

  ._content-placeholder {
    height: 32rem;
    margin-top: var(--spacer-base);
  }

  ._not-found,
  ._empty {
    margin-top: var(--spacer-xl);
    padding: 0 var(--spacer-sm);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  ._order-history-link {
    margin-top: var(--spacer-base);

    &:hover {
      color: var(--c-white);
    }
  }

  ._batch-actions {
    display: flex;
    gap: var(--spacer-sm);
    padding: 0 var(--spacer-sm);
    margin-top: var(--spacer-xl);
    flex-wrap: wrap;
    justify-content: center;
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
    justify-content: space-between;
    gap: var(--spacer-sm);
  }

  ._actions {
    display: flex;
    justify-content: center;
    gap: var(--spacer-sm);
    flex-wrap: wrap;
  }

  ._batch-action,
  ._item-action {
    --button-font-size: var(--font-sm);
    --button-padding: var(--spacer-xs) var(--spacer-sm);
  }

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;

    ._batch-actions {
      justify-content: flex-start;
    }
  }
}
</style>

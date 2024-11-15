<template>
  <ul
    class="m-addons-selector"
    :class="[
      {
        '-disabled': disabled,
      },
      skinClass,
    ]"
  >
    <li
      class="_item"
      v-for="addon in addons"
      :key="addon.id"
      :style="getItemStyles(addon)"
    >
      <MCheckbox
        name="upgrades[]"
        class="_addon-input"
        :value="addon.optionValueId"
        :selected="selectedValues"
        :disabled="disabled"
        @change="onSelectedValuesChange"
      >
        <template #label>
          <div class="_addon-wrapper">
            <div class="_title">
              {{ addon.name }}
            </div>

            <div class="_price" v-if="addon.regularPrice">
              <strong>
                +
              </strong>

              <SfPrice
                :regular="formatPrice(addon.regularPrice)"
                :special="formatPrice(addon.specialPrice)"
              />
            </div>

            <div class="_content">
              <div class="_description-container">
                <div class="_media">
                  <div
                    v-if="!shouldShowVideo(addon.id)"
                    class="_image-container"
                    :class="{'-wide-image': wideImage}"
                    @click="switchToVideo($event, addon)"
                  >
                    <img v-if="getItemImage(addon)" :src="getItemImage(addon)" class="_image">

                    <img v-if="getItemHoverImage(addon)" :src="getItemHoverImage(addon)" class="_image-hover">
                  </div>

                  <StreamingVideo
                    :video-id="getVideoId(addon)"
                    :provider="getVideoProvider(addon)"
                    :auto-play="true"
                    :display-controls="false"
                    v-if="shouldShowVideo(addon.id) && getVideoId(addon) && getVideoProvider(addon)"
                  />
                </div>

                <div class="_description" v-html="addon.description" />
              </div>
            </div>
          </div>
        </template>
      </MCheckbox>
    </li>
  </ul>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import urlParser from 'js-video-url-parser';
import { SfPrice } from '@storefront-ui/vue';

import { StreamingVideo } from 'src/modules/shared';
import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';

import AddonOption from '../interfaces/addon-option.interface';

import MCheckbox from './m-checkbox.vue';
import { formatPrice } from 'src/modules/shared/helpers/price';

let instanceId = 0;

export default Vue.extend({
  name: 'MAddonsSelector',
  components: {
    MCheckbox,
    StreamingVideo,
    SfPrice
  },
  props: {
    addons: {
      type: Array as PropType<AddonOption[]>,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array as PropType<number[]>,
      default: () => []
    },
    wideImage: {
      type: Boolean,
      default: false
    },
    getFieldAnchorName: {
      type: Function as PropType<(field: string) => string>,
      required: true
    }
  },
  data () {
    return {
      instanceId: '',
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      showVideoFlags: {} as Record<number, boolean | undefined>
    };
  },
  computed: {
    addonsIds (): string {
      return this.addons.map((value) => value.id).join('_');
    },
    skinClass (): string {
      return getCurrentThemeClass();
    },
    selectedValues (): number[] {
      return this.value;
    }
  },
  methods: {
    getInputId (addon: AddonOption): string {
      return `design-product-${this.instanceId}-${addon.id}`;
    },
    getItemImage (item: AddonOption): string | undefined {
      return item.images[0];
    },
    getItemHoverImage (item: AddonOption): string | undefined {
      return item.images[1];
    },
    getItemStyles (item: AddonOption): Record<string, string> {
      const result: Record<string, string> = {};

      if (!item.images.length) {
        return result;
      }

      result['--addon-image-regular'] = `url(${item.images[0]})`;

      if (item.images.length === 1) {
        return result;
      }

      result['--addon-image-hover'] = `url(${item.images[1]})`;

      return result;
    },
    getVideoId (addon: AddonOption): string | undefined {
      if (!addon.videoUrl) {
        return;
      }

      const info = urlParser.parse(addon.videoUrl);

      if (!info) {
        return;
      }

      return info.id;
    },
    getVideoProvider (addon: AddonOption): string | undefined {
      if (!addon.videoUrl) {
        return;
      }

      const info = urlParser.parse(addon.videoUrl);

      if (!info) {
        return;
      }

      return info.provider;
    },
    onSelectedValuesChange (selectedValues: number[]): void {
      this.$emit('input', selectedValues);
    },
    shouldShowVideo (addonId: number): boolean {
      return !!this.showVideoFlags[addonId];
    },
    switchToVideo (event: Event, addon: AddonOption): void {
      if (!addon.videoUrl) {
        return;
      }

      event.preventDefault();
      Vue.set(this.showVideoFlags, addon.id, true);
    },
    formatPrice (price: number | null): void {
      return formatPrice(price);
    }
  },
  created (): void {
    this.instanceId = instanceId.toString();

    instanceId += 1;
  },
  watch: {
    addonsIds: {
      handler () {
        const selectedValues: number[] = [];

        this.value.forEach((item) => {
          if (!this.addons.find(
            (addon) => item.addonOptionValueId === addon.optionValueId)
          ) {
            return;
          }

          selectedValues.push(item.addonOptionValueId);
        });

        this.onSelectedValuesChange(selectedValues);
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-addons-selector {
  padding: 0;
  list-style: none;

  ._item {
    cursor: pointer;
    margin: 0 calc(var(--spacer-sm) * -1);

    ._addon-input {
      padding: var(--spacer-sm);
      transition: background-color .15s cubic-bezier(0.65, 0.05, 0.35, 1);

      &.sf-checkbox--is-active {
        background: var(--c-light);
      }
    }

    ::v-deep .sf-checkbox__container {
      align-items: flex-start;
    }

    ._addon-wrapper {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      margin-left: var(--spacer-sm);
      text-align: left;

      ._title {
        font-weight: var(--font-semibold);
        margin-top: calc(var(--checkbox-size, 1.5rem) / 10);
      }

      ._description {
        font-size: var(--font-sm);

        > :first-child {
          margin-top: 0;
        }
      }
    }

    ._content {
      display: flex;
      flex-direction: column;
      margin-top: var(--spacer-sm);
    }

    ._price {
      color: var(--c-accent);
      font-size: var(--font-base);
      margin-top: 1em;

      --price-regular-color: var(--c-accent);
      --price-regular-font-weight: var(--font-bold);
      --price-regular-font-size: var(--font-base);

      --price-special-font-weight: var(--font-bold);
      --price-special-font-size: var(--font-base);

      --price-old-font-size: var(--font-base);

      .sf-price {
        display: inline-flex;
      }

    }

    ._media {
      float: right;
      width: 40%;
      padding: 0 0 var(--spacer-sm) var(--spacer-sm);

      ._image-container {
        position: relative;

        &.-wide-image {
          margin-left: var(--spacer-xl);
          max-width: 100%;
        }
      }

      ._image {
        width: 100%;
      }

      ._image-hover {
        display: none;
        position: absolute;
        width: 100%;
        z-index: 2;
        top: 0;
        left: 0;
      }

      &:hover {
        ._image-hover {
          display: block;
        }
      }
    }
  }

  &.-disabled {
    ._item {
      --checkbox-cursor: default;

      opacity: 0.7;
      cursor: default;
    }
  }

  @media (min-width: $tablet-min) {
    ._item {
      margin: 0;

      ._addon-input {
        padding: var(--spacer-sm) var(--spacer-base);
      }
    }
  }
}
</style>

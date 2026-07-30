<template>
  <div class="form-with-images-gallery-placeholder">
    <div>
      <div class="_product-name-mobile _placeholder-item" />

      <div class="_zoom-gallery">
        <div class="_stage-image _placeholder-item" />

        <div class="_thumbnails">
          <div class="_thumbnail-item">
            <div class="_placeholder-item _thumbnail-item-content" />
          </div>

          <div class="_thumbnail-item">
            <div class="_placeholder-item _thumbnail-item-content" />
          </div>

          <div class="_thumbnail-item">
            <div class="_placeholder-item _thumbnail-item-content" />
          </div>

          <div class="_thumbnail-item">
            <div class="_placeholder-item _thumbnail-item-content" />
          </div>

          <div class="_thumbnail-item">
            <div class="_placeholder-item _thumbnail-item-content" />
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="_product-name-desktop _placeholder-item" />

      <div class="_short-description _placeholder-item" />

      <div class="_form">
        <div class="_form-section">
          <div class="_section-title _placeholder-item" />
          <div class="_section-content _placeholder-item" />
        </div>

        <div class="_form-section">
          <div class="_section-title _placeholder-item" />
          <div class="_section-content _placeholder-item" />
        </div>

        <div class="_form-section">
          <div class="_section-title _placeholder-item" />
          <div class="_section-content _placeholder-item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FormWithImagesGalleryPlaceholder'
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

$section-height: 160px;

.form-with-images-gallery-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  > div {
    width: 100%;
    flex-grow: 1;
  }

  ._product-name-mobile {
    height: 22px;
    width: $section-height;
  }

  ._product-name-desktop {
    height: 42px;
    width: 60%;
  }

  ._product-name-mobile {
    display: block;
  }

  ._product-name-desktop {
    display: none;
  }

  ._placeholder-item {
    background: linear-gradient(-45deg, #f1f1f1, #f6f6f6, #f1f1f1, #f6f6f6);
    background-size: 500% 500%;
    animation: gradient 2s ease infinite;
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  ._zoom-gallery {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    position: relative;
    margin-top: var(--spacer-xs);
  }

  ._stage-image {
    padding-top: 100%;
    position: relative;
    width: 100%;

    ._stage-content {
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
    }
  }

  ._thumbnail-item-content-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;

    top: 0;
    left: 0;
  }

  ._thumbnails {
    position: relative;
    margin-top: 0.5em;
    width: 100%;
    display: flex;
    column-gap: 10px;

    ._thumbnail-item {
      height: 100%;
      flex-basis: 20%;
    }

    ._thumbnail-item-content {
      display: block !important;
      position: relative;
      cursor: pointer;
      padding-top: 100%;
    }
  }

  ._short-description {
    height: $section-height;
    margin-top: var(--spacer-base);
  }

  ._actions {
    ._add-to-cart {
      margin: 0;
      width: 100%;
    }
  }

  ._customization-option {
    &.-widget-DropdownWidget {
      --select-width: 100%;
    }
  }

  ._form-section {
    margin-top: var(--spacer-base);
    display: flex;
    flex-direction: column;
  }

  ._section-title {
    height: 24px;
    width: $section-height;
  }

  ._section-content {
    height: $section-height / 2;
    margin-top: var(--spacer-sm);
  }

  @media (min-width: $tablet-min) {
    flex-direction: row;

    > div {
      max-width: 48.5%;
    }

    ._product-name-desktop {
      display: block;
    }

    ._product-name-mobile {
      display: none;
    }

    ._zoom-gallery {
      margin-top: 0;
    }

    ._stage-image {
      width: 100%;
      padding-top: 100%;
    }
  }
}
</style>

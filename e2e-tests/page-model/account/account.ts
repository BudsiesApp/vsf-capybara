import { Page, expect, Locator } from '@playwright/test';

class AccountSection {
  public pageContent: Locator;
  public menuItem: Locator;

  public constructor (
    public readonly pageContentContainer: Locator,
    public readonly menuItems: Locator,
    public readonly menuItemLabel: string,
    public readonly pageContentSelector: string
  ) {
    this.menuItem = this.menuItems.locator(`._menu-item:has-text("${menuItemLabel}")`);
    this.pageContent = this.pageContentContainer.locator(pageContentSelector);
  }

  public async activateSection (): Promise<void> {
    await this.menuItem.click();
    await expect(this.pageContent).toBeVisible();
  }
}

class OrderItem {
  public reorderButton: Locator;

  public constructor (orderItemLocator: Locator) {
    this.reorderButton = orderItemLocator.locator('._available-action ._action-name:has-text("Re-order")');
  }

  public async reorderItem (): Promise<void> {
    await this.reorderButton.click();

    await expect(this.reorderButton).toBeDisabled();
    await expect(this.reorderButton).toBeEnabled();
  }
}

class OrderView {
  public constructor (public readonly orderViewLocator: Locator) { }

  public getOrderItemByIndex (index: number): OrderItem {
    return new OrderItem(this.orderViewLocator.locator('._order-item').nth(index));
  }
}

class OrdersHistorySection extends AccountSection {
  public constructor (
    public readonly pageContentContainer: Locator,
    public readonly menuItems: Locator
  ) {
    super(
      pageContentContainer,
      menuItems,
      'Order history',
      '.o-my-account-orders-history'
    );
  }

  public getOrderViewByIndex (index: number): OrderView {
    return new OrderView(this.pageContent.locator('.order-view._order').nth(index));
  }
}

export class AccountPage {
  public pageContent: Locator;
  public menuItems: Locator;
  public ordersHistorySection: OrdersHistorySection;

  public constructor (public readonly page: Page) {
    this.pageContent = page.locator('#my-account ._content');
    this.menuItems = page.locator('#my-account ._navigation ._items-list');
    this.ordersHistorySection = new OrdersHistorySection(this.pageContent, this.menuItems);
  }

  public async goto () {
    await this.page.goto('/my-account/');
    await expect(this.pageContent).toBeVisible();
  }
}

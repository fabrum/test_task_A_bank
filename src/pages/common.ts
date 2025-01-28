import { expect, type Locator, type Page } from '@playwright/test';
import loc from '../locators/helpers.json';


export class Common {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async getHeader(): Promise<string>{
        return this.page.locator(loc.header1).textContent()
    }

}
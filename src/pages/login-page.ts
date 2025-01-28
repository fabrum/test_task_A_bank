import { type Locator, type Page } from '@playwright/test';
import login from '../locators/login.json';
import users from '../helpers/loginData.json';


export class LoginPage {
    readonly page: Page;
    readonly loginName: Locator;
    readonly loginPass: Locator;
    readonly button: Locator;

    constructor(page: Page) {
        this.page = page;
        this.loginName = page.locator(login.name);
        this.loginPass = page.locator(login.pass);
        this.button = page.locator(login.button);
    }

    async goto():Promise<void> {
        await this.page.goto('https://enotes.pointschool.ru/login');
    }

    async login(name: string): Promise<void>{
        await this.loginName.type(users[name].name);
        await this.loginPass.type(users[name].pass);
        await this.button.click({force :true});
    }

}
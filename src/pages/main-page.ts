import {expect, type Locator, type Page} from '@playwright/test';
import loc from '../locators/main.json';
import locHelpers from '../locators/helpers.json';


export class MainPage {
    readonly page: Page;
    readonly loggedUser: Locator;
    readonly userName: Locator;
    readonly basket: Locator;
    readonly basketBtn: Locator;
    readonly basketPopupShow: Locator;
    readonly basketOpen: Locator;
    readonly basketClear: Locator;
    readonly basketNumber: Locator;
    readonly basketAllPrice: Locator;
    readonly allProducts: Locator;
    readonly discountProducts: Locator;
    readonly notDiscountProducts: Locator;
    readonly name: Locator;
    readonly price: Locator;
    readonly navigation: Locator;

    constructor(page: Page) {
        this.page = page;
        this.loggedUser = page.locator(loc.loggedUser);
        this.userName = this.loggedUser.locator(loc.userName);
        this.basket = page.locator(loc.basket.basket);
        this.basketBtn = this.basket.locator(loc.basket.basketBtn).first();
        this.basketPopupShow = this.basket.locator(loc.basket.basketShow);
        this.basketOpen = this.basket.locator(loc.basket.basketGo);
        this.basketClear = this.basket.locator(loc.basket.basketClear);
        this.basketNumber = this.basket.locator(loc.basket.numberOnBasket);
        this.basketAllPrice = this.basket.locator(loc.basket.basketPrice);
        this.allProducts = page.locator(loc.noteItem.items).locator(loc.noteItem.all);
        this.discountProducts = page.locator(loc.noteItem.items).locator(loc.noteItem.discount);
        this.notDiscountProducts = page.locator(loc.noteItem.items).locator(loc.noteItem.notDiscount);
        this.name = page.locator(loc.noteItem.name);
        this.price = page.locator(loc.noteItem.price);
        this.navigation = page.locator(loc.navigation).locator(locHelpers.item);
    }

     getFirstNumber(str: string): number {
        const regexNumb = /[0-9]+/
        return Number(str.match(regexNumb)[0])
    }

    async getUserName(): Promise<string> {
        return this.userName.textContent()
    }

    async basketBtnClick(): Promise<void> {
        await this.basketBtn.click()
        await this.page.waitForTimeout(1000);
    }

    async basketClearClick(): Promise<void> {
        await this.basketClear.click()
    }

    async basketOpenClick(): Promise<void> {
        await this.basketOpen.click()
    }

    async basketPopupIsShow(): Promise<boolean> {
        return this.basketPopupShow.isVisible({timeout: 1000})
    }

    async getBasketNumber(): Promise<number> {
        return Number(await this.basketNumber.textContent())
    }

    async getBasketAllPrice(): Promise<number> {
        return Number(await this.basketAllPrice.textContent())
    }

    async basketBeEmpty(): Promise<void> {
        let number = await this.getBasketNumber()
        if (number > 0) {
            if (number == 9) {
                await this.allProducts.nth(1).locator(loc.noteItem.by).click()
                await this.page.waitForTimeout(1000);
            }
            await this.basketBtnClick()
            await this.basketClearClick()
            await this.page.waitForTimeout(1000);
            await expect(await this.basketNumber.textContent()).toBe("0")
        }
    }

    async countItemInBasket(): Promise<number> {
        return this.basket.locator(locHelpers.item).count()
    }

    async getNameProductFirst(): Promise<string> {
        return this.basket.locator(locHelpers.item).first().locator(loc.basket.item.name).textContent()
    }

    async getPriceProductFirst(): Promise<number> {
        let priseString = await this.basket.locator(locHelpers.item).first().locator(loc.basket.item.price).textContent()
        return this.getFirstNumber(priseString)
    }

    async getCountProductFirst(): Promise<number> {
        return Number(await this.basket.locator(locHelpers.item).first().locator(loc.basket.item.count).textContent())
    }

    async getNameProductAll(): Promise<string[]> {
        return this.basket.locator(locHelpers.item).locator(loc.basket.item.name).allTextContents()
    }

    async getPriceProductAll(): Promise<number[]> {
        let priseString = await this.basket.locator(locHelpers.item).locator(loc.basket.item.price).allTextContents()
        return   priseString.map(item=>   this.getFirstNumber(item))
    }

    async getCountProductAll(): Promise<number[]> {
        let countProductString = await this.basket.locator(locHelpers.item).locator(loc.basket.item.count).allTextContents()
        return countProductString.map(item=> Number(item))
    }

    async addNthProducts(count: number, discount: boolean): Promise<{ name: string, prise: number }> {
        let product: Locator
        let productList: Locator
        let stockNumberList: string[]
        let nthProduct: number
        let i: number
        let j = 0;

        if (discount) {
            productList = await this.discountProducts
        } else {
            productList = await this.notDiscountProducts
        }

        let navigationBtn = await this.navigation.all()
        while (j < navigationBtn.length) {
            i = 0;
            await navigationBtn[j].click()
            await this.page.waitForTimeout(200);
            stockNumberList = await productList.locator(loc.noteItem.stockNumber).allTextContents()
            while (i < stockNumberList.length) {
                if (Number(stockNumberList[i]) >= count) {
                    nthProduct = i;
                    break;
                }
                i++
            }
            if (nthProduct != undefined) {
                break
            }
            j++
        }

        await expect(nthProduct).not.toBe(undefined)

        product = await productList.nth(nthProduct)
        for (let i = 0; i < count; i++) {
            await product.locator(loc.noteItem.by).click()
        }
        const name = await product.locator(loc.noteItem.name).textContent()
        const priseString = await product.locator(loc.noteItem.price).textContent()
        return {name: name, prise: await this.getFirstNumber(priseString)}
    }

    async addNthNewProducts(n: number): Promise<{done:boolean,arrName:string[],arrPrice:number[]}> {
        let productListName: string[]
        let arrName: string[]
        let arrPrice: number[]
        await this.basketBtnClick()
        let count = 0
        let basketListName = await this.basket.locator(locHelpers.item).locator(loc.basket.item.name).allTextContents()
        arrName = basketListName;
        arrPrice =  await this.getPriceProductAll()
        let navigationBtn = await this.navigation.all()
        let nav = 0
        let i: number
        while (nav < navigationBtn.length) {
            i = 0;
            await navigationBtn[nav].click()
            await this.page.waitForTimeout(200);
            productListName = await this.allProducts.locator(loc.noteItem.name).allTextContents()
            while (count < n && i < productListName.length) {
                if (!basketListName.includes(productListName[i])) {
                    await this.allProducts.locator(loc.noteItem.by).nth(i).click()
                    arrName.push(productListName[i])
                    arrPrice.push(await this.getFirstNumber(await this.allProducts.locator(loc.noteItem.price).nth(i).textContent()))
                    count++
                }
                i++
            }
            nav++
            if ((count == n)) {
                break
            }
            if
            (nav == navigationBtn.length && i == productListName.length) {
                return {done:false,arrName:[],arrPrice:[]}
            }
        }
        return {done:true,arrName:arrName,arrPrice:arrPrice}
    }
}

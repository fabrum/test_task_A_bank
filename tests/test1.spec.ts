import {test, expect, Page} from '@playwright/test';
import {LoginPage} from '../src/pages/login-page';
import {Common} from '../src/pages/common';
import {MainPage} from '../src/pages/main-page';


test.describe('tests', () => {
    let login: LoginPage;
    let common: Common;
    let main: MainPage;
    let page: Page;

    test.beforeAll(async ({browser}) => {
        page = await browser.newPage();
        login = new LoginPage(page);
        common = new Common(page);
        main = new MainPage(page);
        await login.goto();
        await login.login("test");
        expect(await main.getUserName()).toBe("test")
    });

    test.afterAll(async () => {
        await page.close();
    });

    test.describe('tests корзанв пуста', () => {
        test.beforeEach(async () => {
            await login.goto()
            await main.basketBeEmpty()
        });

        test('Тест-кейс 1. Переход в пустую корзину', async () => {
            await main.basketBtnClick();
            expect(await main.basketPopupIsShow()).toBeTruthy()
        });

        [
            {name: 'Тест-кейс 2. Переход в корзину с 1 неакционным товаром.', param: {discount: false, count: 1}},
            {name: 'Тест-кейс 3. Переход в корзину с 1 акционным товаром.', param: {discount: true, count: 1}},
            {
                name: 'Тест-кейс 5. Переход в корзину с 9 акционными товарами одного наименования.',
                param: {discount: true, count: 9}
            },
        ].forEach(({name, param}) => {
            test(`${name}`, async () => {
                const count = param.count
                const product = await main.addNthProducts(count, param.discount)
                await main.basketBtnClick()
                expect(await main.basketPopupIsShow()).toBeTruthy()
                expect(await main.countItemInBasket()).toBe(1)
                expect(await main.getBasketNumber()).toBe(count)
                expect(await main.getCountProductFirst()).toBe(count)
                expect(await main.getNameProductFirst()).toBe(product.name)
                expect(await main.getPriceProductFirst()).toBe(product.prise * count)
                expect(await main.getBasketAllPrice()).toBe(product.prise * count)
                await main.basketOpenClick()
                expect(await common.getHeader()).not.toBe("Server Error (#500)")
            });
        });

        test.describe('tests корзана не пуста', () => {
            test.beforeEach(async () => {
                await main.addNthProducts(1, true)
            });

            test('Тест-кейс 4. Переход в корзину с 9 разными товарами.', async () => {
                let number= 8
                let addedItem= await main.addNthNewProducts(number);
                expect(addedItem.done).toBeTruthy()
                await main.basketBtnClick()
                expect(await main.basketPopupIsShow()).toBeTruthy()
                expect(await main.countItemInBasket()).toBe(number+1)
                expect(await main.getBasketNumber()).toBe(number+1)
                let arrCountProduct =await main.getCountProductAll()
                arrCountProduct.forEach(item => {
                    expect(item).toBe(1)
                    }
                )
                let arrNameProduct = await main.getNameProductAll()
                for (let i = 0; i < arrNameProduct.length; i++) {
                    expect(arrNameProduct[i]).toBe(addedItem.arrName[i])
                }
                let arrPriceProduct = await main.getPriceProductAll()
                for (let i = 0; i < arrNameProduct.length; i++) {
                    expect(arrPriceProduct[i]).toBe(addedItem.arrPrice[i])
                }
                let allPrice = arrPriceProduct.reduce((sum, a) => sum + a, 0)
                expect(await main.getBasketAllPrice()).toBe(allPrice)
                await main.basketOpenClick()
                expect(await common.getHeader()).not.toBe("Server Error (#500)")
            });
        });
    });
});

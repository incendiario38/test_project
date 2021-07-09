let hash = location.hash.substring(1);

const headerCityButton = document.querySelector('.header__city-button');
const navigationList = document.querySelector('.navigation__list');
const goodsTitle = document.querySelector('.goods__title');

headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?'

headerCityButton.addEventListener('click', () => {
    if (localStorage.getItem('lomoda-location')) {
        return false;
    } else {
        const city = prompt('Укажите ваш город');
        headerCityButton.textContent = city;
        localStorage.setItem('lomoda-location', city);
    }
});

//блокировка скролла

const disableScroll = () => {
    const widthScroll = window.innerWidth - document.body.offsetWidth;

    document.body.dbScrollY = window.scrollY;

    document.body.style.cssText = `
        position: fixed;
        top: ${-window.scrollY}px;
        left: 0;
        width: 100%;
        height: 100wh;
        overflow: hidden;
        padding-right: ${widthScroll}px;
    `;
};

const enableScroll = () => {
    document.body.style.cssText = '';
    window.scroll({
        top: document.body.dbScrollY
    });
};

//модальное окно

const subheaderCart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay')

const cartModalOpen = () => {
    cartOverlay.classList.add('cart-overlay-open');
    disableScroll();
};

const cartModalClose = () => {
    cartOverlay.classList.remove('cart-overlay-open');
    enableScroll();
};

subheaderCart.addEventListener('click', cartModalOpen);

cartOverlay.addEventListener('click', event => {
    const target = event.target;

    if (target.matches('.cart__btn-close') || target.matches('.cart-overlay')) {
        cartModalClose();
    }
});

//запрос базы данных

const getData = async () => {
    const data = await fetch('db.json');
    
    if (data.ok) {
        return data.json();
    } else {
        throw new Error(`Данные не были получены, ошибка ${data.status} ${data.statusText}`);
    }
};

const geetGoods = (callback, property, value) => {
    getData()
        .then(data => {
            if (value) {
                callback(data.filter(item => item[property] === value))
            } else {
                callback(data);
            }
        })
        .catch(err => {
            console.error(err);
        });
};

// Страниц товара

try {
    const goodsList = document.querySelector('.goods__list');

    if (!goodsList) {
        throw 'Это не страница с товарами';
    }

    const createCard = ({id, preview, cost, brand, name, sizes}) => {
        const li = document.createElement('li');

        li.classList.add('goods__item');

        li.innerHTML = `
            <article class="good">
                <a class="good__link-img" href="card-good.html#${id}">
                    <img class="good__img" src="goods-image/${preview}" alt="">
                </a>
                <div class="good__description">
                    <p class="good__price">${cost} &#8381;</p>
                    <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
                    ${sizes ? 
                        `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>`
                         : 
                         ``}
                    <a class="good__link" href="card-good.html#${id}">Подробнее</a>
                </div>
            </article>
        `;

        return li;
    };

    const renderGoodsList = data => {
        goodsList.textContent = '';

        data.forEach(item => {
            const card = createCard(item);
            goodsList.append(card);
        });
    };

    const changeTitle = () => {
        for (let i = 0; i < navigationList.getElementsByClassName('navigation__link').length; i++)  {
            if (navigationList.getElementsByClassName('navigation__link')[i].hash.substring(1) === hash) {
                goodsTitle.innerHTML = navigationList.getElementsByClassName('navigation__link')[i].innerHTML;
            }
        }
    };

    window.addEventListener('hashchange', () => {
        hash = location.hash.substring(1);
        geetGoods(renderGoodsList, 'category', hash);

        changeTitle();
    });

    window.addEventListener('load', () => {
        changeTitle();
    });

    geetGoods(renderGoodsList, 'category', hash);
} catch (err) {
    console.warn(err);
}

// Страница категорий

try {

} catch (error){
    console.warn(error);
}

// Страница товаров

try {

    //Проверка того какая это страница по классу
    if (!document.querySelector('.card-good')) {
        throw 'Это не страница товара';
    }
    
    //Создание объектов
    const cardGoodImage = document.querySelector('.card-good__image');
    const cardGoodBrand = document.querySelector('.card-good__brand');
    const cardGoodTitle = document.querySelector('.card-good__title');
    const cardGoodPrice = document.querySelector('.card-good__price');
    const cardGoodColor = document.querySelector('.card-good__color');
    const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper');
    const cardGoodColorList = document.querySelector('.card-good__color-list');
    const cardGoodSizes = document.querySelector('.card-good__sizes');
    const cardGoodSizesList = document.querySelector('.card-good__sizes-list');
    const cardGoodBuy = document.querySelector('.card-good__buy');

    //Перебираем через reduce все объекты списка data для вывода их в выпадающем списке
    const generateList = data => data.reduce((html, item, i) => 
        html +`<li class="card-good__select-item" data-id="${i}">${item}<li>`, '');
    
        //Получение данных карточки
    const renderCardGood = ([{brand, name, cost, color, sizes, photo}]) => {
        cardGoodImage.src = `goods-image/${photo}`;
        cardGoodImage.alt = `${brand} ${name}`;
        cardGoodBrand.textContent = brand;
        cardGoodTitle.textContent = name;
        cardGoodPrice.textContent = `${cost} ₽`;
        if (color) {
            //Присваиваем выпадающему списку первый элемент
            cardGoodColor.textContent = color[0];
            cardGoodColor.dataset.id = 0;
            //Заполняем выпадающий список
            cardGoodColorList.innerHTML = generateList(color);
        } else {
            //Если объекта color нет, то не отображать данный блок
            cardGoodColor.style.display = 'none';
        };
        if (sizes) {
            cardGoodSizes.textContent = sizes[0]
            cardGoodSizes.dataset.id = 0;
            cardGoodSizesList.innerHTML = generateList(sizes);
        } else {
            cardGoodSizes.style.display = 'none';
        };
    };

    //Обработчик поведения выдающего списка 
    cardGoodSelectWrapper.forEach(item => {
        item.addEventListener('click', e => {
            const target = e.target;

            //Если клик производлся по выпадающему списку, то открываем/закрываем его
            if (target.closest('.card-good__select')) {
                target.classList.toggle('card-good__select__open');
            }

            //Если клик производился по элементу выпадающего списка, то
            if (target.closest('.card-good__select-item')) {
                //Объект для получения данных элемента, по которому производился клик
                const cardGoodSelect = item.querySelector('.card-good__select');
                //Получение наименования
                cardGoodSelect.textContent = target.textContent;
                //Получение id
                cardGoodSelect.dataset.id = target.dataset.id;
                //Закрываем выпадающий список
                cardGoodSelect.classList.remove('card-good__select__open');
            }
        });
    });

    //Выводим на страницу данные карточки товара
    geetGoods(renderCardGood, 'id', hash);

} catch (error) {
    console.warn(error);
}
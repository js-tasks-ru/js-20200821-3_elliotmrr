import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

// TODO: зарефакторить; реализовать индикацию загрузок
export default class ProductForm {
  element;
  subElements = {};

  product = {
    labels: {
      title: 'Название товара',
      description: 'Описание товара',
      images: 'Фото',
      category: 'Категория',
      price: 'Цена ($)',
      discount: 'Скидка ($)',
      quantity: 'Количество',
      status: 'Статус',
    },
    values: {
      title: "",
      description: "",
      images: [],
      subcategory: "",
      price: 100,
      discount: 0,
      quantity: 1,
      status: 1,
    },
  };

  onClickDeleteProductImage = event => {
    const target = event.target;

    if (!target.closest("[data-delete-handle]")) {
      return;
    }

    target.closest(".sortable-list__item").remove();
  };

  onClickUploadProductImage = event => {
    const uploadButton = event.target;
    const onChangeInputFile = async event => {
      const target = event.target;
      const [file] = target.files;

      if (file) {
        const formData = new FormData();

        formData.set("image", file/*, file.name*/);

        uploadButton.disabled = true;
        uploadButton.classList.add("is-loading");

        const image = await this.uploadImage(formData);

        const wrapper = document.createElement("div");
        wrapper.innerHTML = this.getImageItem({
          url: image.data.link,
          source: file.name,
        });
        this.subElements.imageListContainer.querySelector(".sortable-list")
          .append(wrapper.firstElementChild);

        uploadButton.classList.remove("is-loading");
        uploadButton.disabled = false;

        target.remove();
      }
    };

    const inputFile = document.createElement("input");
    inputFile.type = "file";
    inputFile.accept = "image/*";
    inputFile.addEventListener("change", onChangeInputFile);

    // fix for IE
    inputFile.hidden = true;
    document.body.append(inputFile);

    inputFile.click();
  };

  onSubmit = event => {
    event.preventDefault();

    this.save(event);
  };

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = await this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.subElements["imageListContainer"].append(this.productImageList);
    this.setProductCategory();
    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    const { productForm } = this.subElements;

    // document.addEventListener("pointerdown", this.onClickDeleteProductImage);
    productForm.querySelector('[name="uploadImage"]')
      .addEventListener("pointerdown", this.onClickUploadProductImage);
    productForm.addEventListener("submit", this.onSubmit);
  }

  async getTemplate() {
    const [categories] = await Promise.all([this.loadCategories(), this.loadProduct()]);

    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            ${this.productTitle}
          </div>
          <div class="form-group form-group__wide">
            ${this.productDescription}
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            ${categories}
          </div>
          <div class="form-group form-group__wide">
            ${this.productImages}
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            ${this.productPrice}
            ${this.productDiscount}
          </div>
          <div class="form-group form-group__part-half">
            ${this.productQuantity}
          </div>
          <div class="form-group form-group__part-half">
            ${this.productStatus}
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? "Сохранить товар" : "Добавить товар"}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  async loadProduct() {
    if (this.productId) {
      const product = await fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`, {
        referrerPolicy: "no-referrer",
        /*signal: ,*/
      });

      if (product.length) {
        [this.product.values] = product;
      }
      else {
        this.productId = null;
      }
    }

    return this.product.values;
  }

  async loadCategories() {
    return this.getProductCategories(
      await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`, {
        referrerPolicy: "no-referrer",
        /*signal: ,*/
      })
    );
  }

  async getProductCategories(categories) {
    const options = await this.getProductCategoryOptions(categories);

    return `
      <label class="form-label">${this.product.labels.category}</label>
      <select class="form-control" id="subcategory" name="subcategory">
        ${options}
      </select>
    `;
  }

  async getProductCategoryOptions(categories = []) {
    return categories.map(category => {
      const categoryTitle = category.title;

      return getCategoryOptions({category, categoryTitle});
    }).join('');

    function getCategoryOptions({category, categoryTitle}) {
      return category.subcategories.map(subcategory => {
        return (`
            <option value="${subcategory.id}">${categoryTitle} > ${subcategory.title}</option>
          `);
      }).join('');
    }
  }

  setProductCategory() {
    const { productForm } = this.subElements;
    const subcategory = productForm.querySelector('[name="subcategory"]');

    // Можно убрать установку на первую подкатегорию...
    if (this.productId) {
      subcategory.value = this.product.values.subcategory;
    }
    else {
      subcategory.selectedIndex = 0;
    }
  }

  getImageItem({url, source}) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item">

        <input type="hidden" name="url" value="${url}"/>
        <input type="hidden" name="source" value="${source}"/>

        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab"/>
          <img class="sortable-table__cell-img" alt="Image" src="${url}"/>
          <span>${source}</span>
        </span>

        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete"/>
        </button>
      </li>
    `;
  }

  initNewData() {
    const { productForm, imageListContainer } = this.subElements;
    const product = this.product.values;

    product.title = productForm.querySelector('[name="title"]').value;
    product.description = escapeHtml(productForm.querySelector('[name="description"]').value);
    product.subcategory = escapeHtml(productForm.querySelector('[name="subcategory"]').value);
    product.images =
      [...imageListContainer.querySelectorAll(".sortable-list__item")]
        .map(item => ({
          source: escapeHtml(item.querySelector('[name="source"]').value),
          url: escapeHtml(item.querySelector('[name="url"]').value),
        }));
    product.price = Number(escapeHtml(productForm.querySelector('[name="price"]').value));
    product.discount = Number(escapeHtml(productForm.querySelector('[name="discount"]').value));
    product.quantity = Number(escapeHtml(productForm.querySelector('[name="quantity"]').value));
    product.status = Number(escapeHtml(productForm.querySelector('[name="status"]').value));
  }

  async uploadImage(data) {
    return await fetchJson("https://api.imgur.com/3/image", {
      method: 'POST',
      headers: {
        "Authorization": `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      referrerPolicy: "no-referrer",
      /*signal: ,*/
      body: data,
    });

    // TODO: реализовать статус загрузки
    /*const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.open('POST', url);*/
  }

  async uploadProduct(method = "PUT") {
    try {
      const response = await fetch(`${BACKEND_URL}/api/rest/products`, {
        method: `${method}`,
        headers: {
          "Authorization": `Client-ID ${IMGUR_CLIENT_ID}`,
          "Content-Type": "application/json;charset=utf-8",
        },
        referrerPolicy: "no-referrer",
        /*signal: ,*/
        body: JSON.stringify(this.product.values),
      });

      const json = await response.json();

      this.dispatchEvent(json.id);
    } catch (error) {
      console.error('something went wrong', error);
    }
  }

  async save(event) {
    const target = event ? event.target : this.subElements["productForm"].querySelector('[name="save"]');

    const method = this.productId ? "PATCH" : "PUT";

    target.disabled = true;

    this.initNewData();
    this.product.values.id = this.productId;

    const response = await this.uploadProduct(method);

    target.disabled = false;

    return response;
  }

  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved', { detail: id });

    this.element.dispatchEvent(event);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  deinEventListeners() {
    // document.removeEventListener('pointerdown', this.onClickDeleteProductImage);
  }

  remove () {
    this.element.remove();
    this.deinEventListeners();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.product.values = {
      title: "",
      description: "",
      images: [],
      subcategory: "",
      price: 100,
      discount: 0,
      quantity: 1,
      status: 1,
    };
  }

  get productTitle() {
    return `
      <fieldset>
        <label class="form-label">${this.product.labels.title}</label>
        <input
          id="title"
          required=""
          type="text"
          name="title"
          class="form-control"
          value="${escapeHtml(this.product.values.title)}"
          placeholder="${this.product.labels.title}"
        />
      </fieldset>
    `;
  }

  get productDescription() {
    return `
      <label class="form-label">${this.product.labels.description}</label>
      <textarea
        id="description"
        required=""
        class="form-control"
        name="description"
        data-element="productDescription"
        placeholder="${this.product.labels.description}"
      >${escapeHtml(this.product.values.description)}</textarea>
    `;
  }

  get productImages() {
    return `
      <label class="form-label">${this.product.labels.images}</label>
      <div data-element="imageListContainer">

      </div>

      <button
        type="button"
        name="uploadImage"
        class="button-primary-outline fit-content"
      >
        <span>Загрузить</span>
      </button>
    `;
  }

  get productImageList() {
    const listItems = this.product.values.images.reduce((items, {source, url}) => {
      const wrapper = document.createElement("ul");
      wrapper.innerHTML = this.getImageItem({source, url});
      items.push(wrapper.firstElementChild);

      return items;
    }, []);

    return new SortableList({items: listItems}).element/*.outerHTML*/;
    /*
    return `
      <ul class="sortable-list">
        ${listItems.join('')}
      </ul>
    `;*/
  }

  get productPrice() {
    return `
      <fieldset>
        <label class="form-label">${this.product.labels.price}</label>
        <input
          id="price"
          required=""
          type="number"
          name="price"
          class="form-control"
          value="${escapeHtml(this.product.values.price.toString())}"
          placeholder="${this.product.labels.price}"
        />
      </fieldset>
    `;
  }

  get productDiscount() {
    return `
      <fieldset>
        <label class="form-label">${this.product.labels.discount}</label>
        <input
          id="discount"
          required=""
          type="number"
          name="discount"
          class="form-control"
          value="${escapeHtml(this.product.values.discount.toString())}"
          placeholder="${this.product.values.discount}"
        />
      </fieldset>
    `;
  }

  get productQuantity() {
    return `
      <label class="form-label">${this.product.labels.quantity}</label>
      <input
        id="quantity"
        required=""
        type="number"
        class="form-control"
        name="quantity"
        value="${escapeHtml(this.product.values.quantity.toString())}"
        placeholder="${this.product.values.quantity}"
      />
    `;
  }

  get productStatus() {
    const state = ["", ""];
    state[this.product.values.status] = 'selected = true';

    const options = [
      `<option value="1" ${state[1]}>Активен</option>`,
      `<option value="0" ${state[0]}>Неактивен</option>`,
    ];

    return `
      <label class="form-label">${this.product.labels.status}</label>
      <select class="form-control" id="status" name="status">
        ${options.join('')}
      </select>
    `;
  }
}

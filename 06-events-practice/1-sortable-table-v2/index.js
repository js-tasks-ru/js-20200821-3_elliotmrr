export default class SortableTable {
  element; // HTMLElement;
  subElements = {};
  headersConfig = [];
  data = [];

  sortOnClickHeader = event => {
    const target = event.target.closest(".sortable-table__cell[data-sortable=true]");

    if (!target) {
      return;
    }

    const {id, order} = target.dataset;

    const invertedOrder = {
      "desc": 'asc',
      "asc": 'desc',
    };

    this.sort(id, invertedOrder[order]);
  };

  constructor(headersConfig = [], {
    data = [],
    sorting = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc',
    },
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorting = sorting;

    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.header.addEventListener("pointerdown", this.sortOnClickHeader);
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headersConfig.map(item => this.getTableHeaderCells(item)).join('')}
      </div>
    `;
  }

  getTableHeaderCells({id, title, sortable}) {
    const order = sortable ? `data-order="${this.sorting.order}"` : "";

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" ${order}>
        <span>${title}</span>
        ${id === this.sorting.id ? this.getHeaderSortingArrow() : ""}
      </div>
    `;
  }

  getHeaderSortingArrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableBodyRows(data)}
      </div>
    `;
  }

  getTableBodyRows(data) {
    return data.map(item => `
      <div class="sortable-table__row">
        ${this.getTableBodyCells(item, data)}
      </div>`
    ).join('');
  }

  getTableBodyCells(item) {
    const cells = this.headersConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTable(data) {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}
      </div>
    `;
  }

  render() {
    const $wrapper = document.createElement('div');
    $wrapper.innerHTML = this.getTable(this.sortData(this.sorting.id));
    const element = $wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
    this.setCaret(this.sorting.id);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  setCaret(field, order = 'asc') {
    const currentColumn = this.subElements.header.querySelector(`[data-id="${field}"]`);

    currentColumn.dataset.order = order;
    currentColumn.append(this.arrow);
  }

  sort(field, order) {
    const sortedData = this.sortData(field, order);

    this.setCaret(field, order);
    this.body.innerHTML = this.getTableBodyRows(sortedData);
  }

  sortData(field, order = 'asc') {
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === field);
    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[field] - b[field]);
        case 'string':
          return direction * a[field].localeCompare(b[field], ['ru', 'en']);
        case 'custom':
          return direction * customSorting(a, b);
        default:
          return direction * (a[field] - b[field]);
      }
    });
  }

  get arrow() {
    return this.subElements.arrow;
  }

  get header() {
    return this.subElements.header;
  }

  get body() {
    return this.subElements.body;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

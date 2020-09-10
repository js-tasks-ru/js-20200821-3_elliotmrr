export default class SortableTable {
  element; // HTMLElement;
  subElements = {};
  headersConfig = [];
  data = [];

  constructor(headersConfig = [], {
    data = []
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;

    this.render();
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headersConfig.map(item => this.getTableHeaderCells(item)).join('')}
      </div>
    `;
  }

  getTableHeaderCells({id, title, sortable}) {
    // const order = sortable ? 'data-order=""' : "";

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        ${sortable ? `${this.getHeaderSortingArrow()}` : ""}
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

    $wrapper.innerHTML = this.getTable(this.data);

    const element = $wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]:not([data-element="arrow"])');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  sort(field, order = 'asc') {
    const sortedData = this.sortData(field, order);
    const prevCurrentColumn = this.subElements.header.querySelector('.sortable-table__cell[data-order]');
    const currentColumn = this.subElements.header.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    // NOTE: Remove sorting arrow from prev column
    if (prevCurrentColumn) {
      prevCurrentColumn.removeAttribute("data-order");
    }

    currentColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.getTableBodyRows(sortedData);
  }

  sortData(field, order) {
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

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}


export default class SortableTable {
  element; // HTMLElement;
  subElements = {};

  constructor(header = [], {data = []} = {}) {
    this.header = header;
    this.data = data;

    this.render();
  }

  getColumnsHeader(data) {
    return data
      .map(item => {
        return `
          <div class="sortable-table__cell"
            data-id="${item.id}"
            ${item.sortable ? 'data-order=""' : ""}
          >
            <span>${item.title}</span>
            ${item.sortable ? `
                <span data-element="arrow" class="sortable-table__sort-arrow">
                  <span class="sort-arrow"/>
                </span>` : ""}
          </div>
        `;
      })
      .join('');
  }

  getCellsBody(obj) {
    if (!obj) {
      return;
    }

    const cells = [];
    const cellOpen = '<div class="sortable-table__cell">';
    const cellClose = '</div>';
    let value;

    for (const prop of this.header) {
      switch (prop.id) {
      case undefined:
        value = cellOpen + cellClose;
        break;

      case "images":
        value = prop.template ? prop.template(obj[prop.id]) : "";
        break;

      case "status":
        value = cellOpen + `${obj.status ? "Enabled" : "Disabled"}` + cellClose;
        break;

      default:
        value = cellOpen + `${obj[prop.id] || ""}` + cellClose;
        break;
      }

      cells.push(value);
    }

    return cells.join("");
  }

  getColumnsBody(data) {
    return data
      .map(item => {
        return `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${this.getCellsBody(item)}
          </a>
        `;
      })
      .join('');
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">

          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getColumnsHeader(this.header)}
          </div>

          <div data-element="body" class="sortable-table__body">
            ${this.getColumnsBody(this.data)}
          </div>

          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  sort(fieldName, direction = 'asc') {
    if (!fieldName) {
      return;
    }

    const column = this.subElements.header.querySelector(`[data-id="${fieldName}"]`);
    column.setAttribute("data-order", direction);

    const columnSort = this.header.find(item => item.id === fieldName);
    const columnSortType = columnSort.sortType;
    const columnSortColNumber = this.header.indexOf(columnSort) + 1;

    const sortedArr = sortDirection(this.subElements.body.children);

    this.subElements.body.append(...sortedArr);

    function sortDirection(arr) {
      switch (direction) {
      case "asc":
        return sortingArr(arr, 1);

      case "desc":
        return sortingArr(arr, -1);

      default:
        return sortingArr(arr, 1);
      }

      function sortingArr(arr, direction) {
        const selector = `.sortable-table__cell:nth-child(${columnSortColNumber})`;

        return [...arr].sort((a, b) => {
          switch (columnSortType) {
          case "string":
            return direction *
              a.querySelector(selector).textContent.trim()
                .localeCompare(b.querySelector(selector).textContent.trim(), "default", {caseFirst: "upper"});

          case "number":
            return direction *
              (a.querySelector(selector).textContent - b.querySelector(selector).textContent);

          default:
            return direction *
              (a.querySelector(selector).firstChild.data - b.querySelector(selector).firstChild.data);
          }
        });
      }
    }
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}


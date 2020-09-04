export default class ColumnChart {
  element; // HTMLElement;

  constructor({
    data = [],
    label = "noName",
    value = 0,
    link = "#"
  } = {}) {
    this.chartHeight = 50;
    this.label = label;
    this.value = value;
    this.link = link;
    this.data = data;

    this.render();
    this.initEventListeners();
  }

  render() {
    this.template = `<div class="column-chart${(this.data.length === 0) ? " column-chart_loading" : ""}">
        <div class="column-chart__title">
          ${this.label}
          <a class="column-chart__link" href="${this.link}">View all</a>
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.dataParsingTag`${this.data}`}
          </div>
        </div>
      </div>`;

    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  update(data = []) {
    if (!data.length) {
      return;
    }

    this.data = data;

    this.element.classList.remove("column-chart_loading");
    this.element.querySelector('[data-element="body"]')
      .innerHTML = this.dataParsingTag`${this.data}`;
  }

  dataParsingTag(strings, ...args) {
    const data = args[0];
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;
    let result = ``;

    for (const item of data) {
      const percent = (item / maxValue * 100).toFixed(0);
      const value = Math.floor(item * scale);

      result += `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
    }

    return result;
  }

  initEventListeners() {

  }

  removeEventListeners() {

  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}

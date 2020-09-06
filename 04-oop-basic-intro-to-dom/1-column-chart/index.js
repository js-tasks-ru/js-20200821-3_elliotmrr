export default class ColumnChart {
  element; // HTMLElement;
  subElements = {};
  chartHeight = 50;

  constructor({
    data = [],
    label = "",
    value = 0,
    link = "",
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;

    this.render();
  }

  getColumnBody(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data
      .map(item => {
        const percent = (item / maxValue * 100).toFixed(0);

        return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  get template() {
    return `
      <div class="column-chart ${(this.data.length === 0) ? "column-chart_loading" : ""}"
           style="--chart-height: ${this.chartHeight}"
      >
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody(this.data)}
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

  /*
  * Обновление всего чарта не реализовано.
  * При обновлении всего чарта, можно заносить все данные (data, label, value, link)
  * в объект и рендерить весь чарт без проверки на пустые данные
  * и добавлении класса для склетона,
  * т.к проверка уже в get template(){} осуществляется, при формировании строки.
  * */
  update(bodyData = []) {
    if (!bodyData.length) {
      // Линк продолжает отображаться
      this.element.classList.add("column-chart_loading");
      this.subElements.body.innerHTML = "";

      return;
    }

    /*
    * Оставим первоначальное значение в объекте, по аналогии с <input>.
    * К тому же у нас название, значение и линк "старые".
    * */
    // this.data = bodyData;

    this.subElements.body.innerHTML = this.getColumnBody(bodyData);

    this.element.classList.remove("column-chart_loading");
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

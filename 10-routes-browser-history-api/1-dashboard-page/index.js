import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {
  element;
  subElements = {};
  components = {};

  async updateComponents (from, to) {
    const data = await fetchJson(`${BACKEND_URL}/api/dashboard/bestsellers?_start=0&_end=19&from=${from.toISOString()}&to=${to.toISOString()}`);

    this.components.sortableTable.update(data);
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  initComponents () {
    const from = new Date();
    const to = new Date();

    from.setMonth(from.getMonth() - 2);

    const rangePicker = new RangePicker({from, to});
    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=0&_end=19&from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true
    });
    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      label: 'orders',
      range: {from, to},
      link: '#'
    });
    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      label: 'sales',
      range: {from, to},
      formatHeading: data => `$${data}`
    });
    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {from, to},
      label: 'customers',
    });

    this.components = {sortableTable, ordersChart, salesChart, customersChart, rangePicker};
  }

  constructor() {
    this.render();
  }

  async render () {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  initEventListeners () {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  get template () {
    return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>
      <h3 class="block-title">Best sellers</h3>
      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`;
  }
}

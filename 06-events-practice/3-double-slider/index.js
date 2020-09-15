export default class DoubleSlider {
  element; // HTMLElement;
  subElements = {};
  thumb; // Active slide thumb {String};
  thumbPercentPositions = {};

  position = {
    shiftX: 0,
    barLeft: 0,
  };

  selected = {};

  /* Arrow functions */

  onPointerDown = (event) => {
    const target = event.target;
    const thumbClassname = "range-slider__thumb";

    if (!target.className.includes(thumbClassname)) {
      return;
    }

    event.preventDefault(); // предотвратить запуск выделения (действие браузера)
    target.ondragstart = function() {
      return false;
    };

    this.getInitialPosition(event);

    /* const side = target.className.slice(thumbClassname.length + 1); */
    const {element: side} = target.dataset;

    this.thumb = side;

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerMove = (event) => {
    this.moveAt(event);

    const customEvent = new CustomEvent('range-select', {
      bubbles: true,
      detail: {
        from: this.selected.from,
        to: this.selected.to,
      }
    });

    this.element.dispatchEvent(customEvent);
  };

  moveAt = ({
    clientX,
  }) => {
    const { shiftX, barLeft } = this.position;
    const side = this.thumb;
    const thumb = this.subElements[this.thumb];
    const bar = this.subElements.bar;
    const progress = this.subElements.progress;

    let currentThumbShift = clientX - shiftX - barLeft;

    // курсор вышел из слайдера => оставить бегунок в его границах.
    if (currentThumbShift < 0) {
      currentThumbShift = 0;
    }

    const rightEdge = bar.offsetWidth/* - thumb.offsetWidth*/;

    if (currentThumbShift > rightEdge) {
      currentThumbShift = rightEdge;
    }

    // Получаем % и значения для to/from в соотношении с прокруткой
    let percent = this.getPercent(currentThumbShift, side, 0, bar.offsetWidth);

    // ползунок заходит за другой
    const thumbInvert = {
      "left": "right",
      "right": "left",
    };
    const oppositeThumbPercent = this.thumbPercentPositions[thumbInvert[side]];
    const allowPercent = 100 - oppositeThumbPercent;

    percent = percent - allowPercent < 0 ? percent : allowPercent;

    const selectedThumb = {
      "left": "from",
      "right": "to",
    };
    this.selected[selectedThumb[side]] = this.getSelectedValue(percent, side);

    progress.style[side] = percent + '%';
    thumb.style[side] = percent + '%';
  };

  onRangeSelect = () => {
    this.subElements.from.innerHTML = `${this.formatValue(this.selected.from)}`;
    this.subElements.to.innerHTML = `${this.formatValue(this.selected.to)}`;
  };

  onPointerUp = () => {
    this.deinEventListeners();
  };

  /* / Arrow functions */

  /* Accessors */

  get template() {
    let {from, to} = this.selected;

    return `
      <div class="range-slider">
        ${this.getSliderFrom(from)}
        ${this.getSliderInner(from, to)}
        ${this.getSliderTo(to)}
      </div>
    `;
  }

  /* / Accessors */

  constructor({
    min = 0,
    max = 100,
    formatValue = value => '$' + value,
    selected,
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;

    this.selected = selected ?? {
      from: min,
      to: max,
    };

    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.bar.addEventListener("pointerdown", this.onPointerDown);
    this.element.addEventListener("range-select", this.onRangeSelect);
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  getInitialPosition(event) { // bar event: currentTarget = bar. Target = thumb
    const {clientX, target} = event;

    this.position.barLeft = this.subElements.bar.getBoundingClientRect().left;
    this.position.shiftX = 0 /*clientX - target.getBoundingClientRect().left*/; // TODO: сделать "шифт".
  }

  getSelectedValue(positionPercent, side) {
    const thumbInvertValue = {
      "left": 0,
      "right": 100,
    };

    return Math.floor(
      (this.max - this.min)
      * Math.abs(positionPercent - thumbInvertValue[side])
      / 100 + this.min
    );
  }

  getPercent(value, side, min, max) {
    if (side === "right") {
      [max, min] = [min, max];
    }

    const result = (value - min) * 100 / (max - min);

    this.setThumbPercent(result, side);

    return result/*.toFixed(0)*/;
  }

  setThumbPercent(result, side) {
    this.thumbPercentPositions[side] = result;
  }

  /* Slider */

  getSliderFrom(from) {
    return `
      <span data-element="from">${this.formatValue(from)}</span>
    `;
  }

  getSliderInner(from, to) {
    const percentFrom = this.getPercent(from, "left", this.min, this.max);
    const percentTo = this.getPercent(to, "right", this.min, this.max);

    return `
      <div class="range-slider__inner" data-element="bar">
        ${this.getSliderProgress(percentFrom, percentTo)}
        ${this.getSliderThumbLeft(percentFrom)}
        ${this.getSliderThumbRight(percentTo)}
      </div>
    `;
  }

  getSliderProgress(percentFrom, percentTo) {
    const style = percentFrom && percentTo ? `style="left: ${percentFrom}%; right: ${percentTo}%;"` : "";

    return `
      <span class="range-slider__progress" data-element="progress" ${style}> </span>
    `;
  }

  getSliderThumbLeft(percentFrom) {
    const style = percentFrom ? `style="left: ${percentFrom}%;"` : "";

    return `
      <span class="range-slider__thumb-left" data-element="left" ${style}> </span>
    `;
  }

  getSliderThumbRight(percentTo) {
    const style = percentTo ? `style="right: ${percentTo}%;"` : "";

    return `
      <span class="range-slider__thumb-right" data-element="right" ${style}> </span>
    `;
  }

  getSliderTo(to) {
    return `
      <span data-element="to">${this.formatValue(to)}</span>
    `;
  }

  /* / Slider */

  remove() {
    this.element.remove();
  }

  deinEventListeners() {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  destroy() {
    this.remove();
    this.deinEventListeners();
    this.subElements = {};
    this.thumb = '';
    /*
    this.selected = {};
    this.position.shiftX = 0;
    this.position.sliderLeft = 0;
    thumbPercentPositions = {};
    */
  }
}

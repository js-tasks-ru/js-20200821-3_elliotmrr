class Tooltip {
  static instance;
  element; // HTMLElement
  target; // HTMLElement

  get template() {
    return `
      <div class="tooltip"></div>
    `;
  }

  constructor() {

  }

  initialize() {
    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener("pointerover", this.onPointerover);
    document.addEventListener("pointerout", this.onPoinerout);
  }

  render(tooltip = '') {
    const $wrapper = document.createElement('div');
    $wrapper.innerHTML = this.template;
    this.element = $wrapper.firstElementChild;

    this.changeTip(tooltip);
    this.show();
  }

  changeTip(tooltip = '') {
    this.element.innerHTML = tooltip;
  }

  show() {
    document.body.append(this.element);
  }

  onPointerover = (event) => {
    const target = event.target.closest('[data-tooltip]');

    if (!target) {
      return;
    }

    this.target = target;
    this.render(target.dataset.tooltip);
    this.target.addEventListener("pointermove", this.onPointermove);
  };

  onPointermove = (event) => {
    this.moveTooltip(event);
  }

  /* TODO: реализовать "нормальное" отображение подсказки в момент попадания курсором над подсказкой. */
  moveTooltip({
    clientX,
    clientY,
  }) {
    const shiftX = 16;
    const shiftY = 20;

    let y = clientY + shiftY;
    let x = clientX - this.element.offsetWidth / 2; /* + shiftX; */

    // Если подсказка выходит за левый край
    if (x < shiftX) {
      x = shiftX;
    }

    // Если подсказка выходит за правый край
    const docScreenRight = document.documentElement.clientWidth;
    const tooltipWidth = this.element.offsetWidth + shiftX;

    if (x + tooltipWidth > docScreenRight) {
      x = docScreenRight - tooltipWidth;
    }

    // Подсказка не может выйти за верхний край
    // Если подсказка выходит за нижний край
    const docScreenBottom = document.documentElement.clientHeight;
    const tooltipHeight = this.element.offsetHeight + shiftY;

    if (y + tooltipHeight > docScreenBottom) {
      y = docScreenBottom - tooltipHeight;
    }

    this.element.style.left = x + "px";
    this.element.style.top = y + "px";
  }

  onPoinerout = (event) => {
    if (!this.target) {
      return;
    }

    this.target.removeEventListener("pointermove", this.onPointermove);
    this.target = null;
    this.remove();
  };

  deinEventListeners() {
    document.removeEventListener("pointerover", this.onPointerover);
    document.removeEventListener("pointerout", this.onPoinerout);
  }

  deinitialize() {
    this.onPoinerout();
    this.destroy();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.deinEventListeners();
  }
}

// NOTE: при удалении объекта, стойство instance не обнулится (remove objClass)
function singleton(Base) {
  return Base.instance ?? newInstance();

  function newInstance() {
    const instance = new Base();
    Base.instance = instance;

    return instance;
  }
}

const tooltip = singleton(Tooltip);

export {singleton};
export default tooltip;

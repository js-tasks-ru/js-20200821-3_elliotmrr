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
    document.addEventListener("pointerover", this.onMouseover);
    document.addEventListener("pointerout", this.onMouseout);
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

  onMouseover = (event) => {
    const target = event.target.closest('[data-tooltip]');

    if (!target) {
      return;
    }

    this.target = target;
    this.render(target.dataset.tooltip);
    this.target.addEventListener("pointermove", this.onMousemove);
  };

  onMousemove = (event) => {
    this.moveTooltip(event);
  }

  moveTooltip({
    clientX,
    clientY,
  }) {
    const shift = 7;

    let x = clientX + shift; /* - this.element.offsetWidth / 2; */
    if (x < shift) {
      x = shift;
    }

    let y = clientY + shift;
    if (y < shift) {
      y = shift;
    }

    this.element.style.left = x + shift + "px";
    this.element.style.top = y + shift + "px";
  }

  onMouseout = (event) => {
    if (!this.target) {
      return;
    }

    this.target.removeEventListener("pointermove", this.onMousemove);
    this.target = null;
    this.remove();
  };

  deinEventListeners() {
    document.removeEventListener("pointerover", this.onMouseover);
    document.removeEventListener("pointerout", this.onMouseout);
  }

  deinitialize() {
    this.onMouseout();
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

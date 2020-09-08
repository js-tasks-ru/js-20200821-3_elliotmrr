export default class NotificationMessage {
  element; // HTMLElement;

  constructor(message, {duration = 2000, type = 'success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type === "success" ? "success" : "error";

    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    this.element.addEventListener('animationend', this.remove.bind(this));
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration}ms">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
  }

  show(target = document.body) {
    if (globalThis.notification) {
      globalThis.notification.remove();
      globalThis.notification = null;
    }

    target.append(this.element);
    globalThis.notification = this;
  }

  remove() {
    this.element.remove();
  }

  finalEventListeners() {
    this.element.removeEventListener('animationend', this.remove.bind(this));
  }

  destroy() {
    this.remove();
    this.finalEventListeners();
  }
}

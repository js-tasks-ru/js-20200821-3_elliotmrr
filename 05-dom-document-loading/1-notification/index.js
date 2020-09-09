export default class NotificationMessage {
  element; // HTMLElement;
  static notification;

  constructor(message, {
    duration = 2000,
    type = 'success',
  } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type === "success" ? "success" : "error";

    this.render();
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
    if (NotificationMessage.notification) {
      NotificationMessage.notification.remove();
      NotificationMessage.notification = null;
    }

    target.append(this.element);
    NotificationMessage.notification = this.element;

    setTimeout(this.remove, this.duration);
  }

  remove = () => {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

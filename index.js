class CounterApp {
  constructor() {
    this.counters = [];
    this.nextId = 1;
    this.selectedBackground = "";
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadCounters();
    this.loadSettings();
    if (this.counters.length === 0) this.addCounter();
  }

  bindEvents() {
    const bind = (id, event, handler) =>
      document.getElementById(id).addEventListener(event, handler);

    bind("addCounterBtn", "click", () => this.addCounter());
    bind("resetCountersBtn", "click", () => this.resetAllCounters());
    bind("bgColorInput", "input", this.updateBackgroundColor.bind(this));
    bind("fontSelect", "change", this.updateFontFamily.bind(this));
    bind("resetStylesBtn", "click", this.resetStyles.bind(this));
    bind("toggleSettingsBtn", "click", () => this.toggleSettings());
    bind("closeSettingsBtn", "click", () => this.closeSettings());

    document.querySelectorAll(".image-option").forEach((option) => {
      option.addEventListener("click", () =>
        this.selectBackgroundImage(option)
      );
    });
  }

  selectBackgroundImage(option) {
    document
      .querySelectorAll(".image-option")
      .forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");

    const imageUrl = option.dataset.image;
    this.selectedBackground = imageUrl;

    if (imageUrl) {
      Object.assign(document.body.style, {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      });
    } else {
      document.body.style.backgroundImage = "";
    }
    this.saveSettings();
  }

  resetAllCounters() {
    if (
      confirm(
        "Are you sure you want to reset all counters to 0? This cannot be undone."
      )
    ) {
      this.counters.forEach((counter) => {
        counter.count = 0;
        this.updateCounterDisplay(counter.id, 0);
      });
      this.updateTotal();
      this.saveCounters();
    }
  }

  resetCounter(id) {
    if (confirm("Reset this counter to 0?")) {
      const counter = this.counters.find((c) => c.id === id);
      if (counter) {
        counter.count = 0;
        this.updateCounterDisplay(id, 0);
        this.updateTotal();
        this.saveCounters();
      }
    }
  }

  addCounter() {
    const counter = {
      id: this.nextId++,
      count: 0,
      name: `Counter ${this.counters.length + 1}`,
    };
    this.counters.push(counter);
    this.renderCounter(counter);
    this.updateTotal();
    this.saveCounters();
  }

  renderCounter(counter) {
    const container = document.getElementById("countersContainer");
    const counterDiv = document.createElement("div");
    counterDiv.className = "counter";
    counterDiv.dataset.id = counter.id;

    counterDiv.innerHTML = `
      <div class="counter-header">
        <div class="counter-title" onclick="app.editCounterName(${counter.id})">${counter.name}</div>
        <div class="counter-actions">
          <button class="reset-counter" onclick="app.resetCounter(${counter.id})" title="Reset counter">↻</button>
          <button class="delete-counter" onclick="app.deleteCounter(${counter.id})" title="Delete counter">×</button>
        </div>
      </div>
      <div class="counter-controls">
        <button class="counter-btn minus" onclick="app.decrementCounter(${counter.id})">−</button>
        <div class="count-display">${counter.count}</div>
        <button class="counter-btn plus" onclick="app.incrementCounter(${counter.id})">+</button>
      </div>
    `;

    container.appendChild(counterDiv);
  }

  editCounterName(id) {
    const counter = this.counters.find((c) => c.id === id);
    const titleElement = document.querySelector(
      `[data-id="${id}"] .counter-title`
    );

    if (counter && titleElement) {
      const input = document.createElement("input");
      input.className = "counter-title-input";
      input.value = counter.name;
      input.maxLength = 20;

      titleElement.replaceWith(input);
      input.focus();
      input.select();

      const saveTitle = () => {
        const newName = input.value.trim() || counter.name;
        counter.name = newName;

        const newTitleElement = document.createElement("div");
        newTitleElement.className = "counter-title";
        newTitleElement.onclick = () => this.editCounterName(id);
        newTitleElement.textContent = newName;

        input.replaceWith(newTitleElement);
        this.saveCounters();
      };

      input.addEventListener("blur", saveTitle);
      input.addEventListener(
        "keypress",
        (e) => e.key === "Enter" && saveTitle()
      );
    }
  }

  incrementCounter(id) {
    const counter = this.counters.find((c) => c.id === id);
    if (counter) {
      counter.count++;
      this.updateCounterDisplay(id, counter.count);
      this.animateCounter(id);
      this.updateTotal();
      this.saveCounters();
    }
  }

  decrementCounter(id) {
    const counter = this.counters.find((c) => c.id === id);
    if (counter && counter.count > 0) {
      counter.count--;
      this.updateCounterDisplay(id, counter.count);
      this.animateCounter(id);
      this.updateTotal();
      this.saveCounters();
    }
  }

  deleteCounter(id) {
    if (this.counters.length <= 1) {
      alert("You must have at least one counter!");
      return;
    }
    if (confirm("Are you sure you want to delete this counter?")) {
      this.counters = this.counters.filter((c) => c.id !== id);
      document.querySelector(`[data-id="${id}"]`).remove();
      this.updateTotal();
      this.saveCounters();
    }
  }

  updateCounterDisplay(id, count) {
    const element = document.querySelector(`[data-id="${id}"] .count-display`);
    if (element) element.textContent = count;
  }

  animateCounter(id) {
    const element = document.querySelector(`[data-id="${id}"] .count-display`);
    if (element) {
      element.classList.add("animate");
      setTimeout(() => element.classList.remove("animate"), 200);
    }
  }

  updateTotal() {
    const total = this.counters.reduce(
      (sum, counter) => sum + counter.count,
      0
    );
    document.getElementById("totalCount").textContent = total;
  }

  updateBackgroundColor() {
    document.body.style.backgroundColor =
      document.getElementById("bgColorInput").value;
    this.saveSettings();
  }

  updateFontFamily() {
    document.body.style.fontFamily =
      document.getElementById("fontSelect").value;
    this.saveSettings();
  }

  toggleSettings() {
    document.getElementById("settingsPanel").classList.toggle("open");
  }

  closeSettings() {
    document.getElementById("settingsPanel").classList.remove("open");
  }

  resetStyles() {
    Object.assign(document.body.style, {
      backgroundColor: "#f5f5f5",
      backgroundImage: "",
      fontFamily: "",
    });

    document.getElementById("bgColorInput").value = "#f5f5f5";
    document.getElementById("fontSelect").value = "'Open Sans', sans-serif";

    document
      .querySelectorAll(".image-option")
      .forEach((opt) => opt.classList.remove("selected"));
    document
      .querySelector('.image-option[data-image=""]')
      .classList.add("selected");

    this.selectedBackground = "";
    localStorage.removeItem("counterAppSettings");
  }

  saveSettings() {
    const settings = {
      backgroundColor: document.body.style.backgroundColor,
      backgroundImage: this.selectedBackground,
      fontFamily: document.body.style.fontFamily,
    };
    localStorage.setItem("counterAppSettings", JSON.stringify(settings));
  }

  loadSettings() {
    const saved = localStorage.getItem("counterAppSettings");
    if (!saved) {
      document.querySelector('[data-image=""]')?.classList.add("selected");
      return;
    }

    const settings = JSON.parse(saved);

    if (settings.backgroundColor) {
      document.body.style.backgroundColor = settings.backgroundColor;
      document.getElementById("bgColorInput").value = settings.backgroundColor;
    }

    if (settings.backgroundImage !== undefined) {
      this.selectedBackground = settings.backgroundImage;
      if (settings.backgroundImage) {
        Object.assign(document.body.style, {
          backgroundImage: `url(${settings.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        });
        document
          .querySelector(`[data-image="${settings.backgroundImage}"]`)
          ?.classList.add("selected");
      } else {
        document.querySelector('[data-image=""]')?.classList.add("selected");
      }
    }

    if (settings.fontFamily) {
      document.body.style.fontFamily = settings.fontFamily;
      document.getElementById("fontSelect").value = settings.fontFamily;
    }
  }

  saveCounters() {
    localStorage.setItem("counterAppData", JSON.stringify(this.counters));
  }

  loadCounters() {
    const saved = localStorage.getItem("counterAppData");
    if (saved) {
      this.counters = JSON.parse(saved);
      this.nextId = Math.max(...this.counters.map((c) => c.id), 0) + 1;
      this.counters.forEach((counter) => this.renderCounter(counter));
      this.updateTotal();
    }
  }
}

const app = new CounterApp();

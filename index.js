class CounterApp {
  constructor() {
    this.counters = [];
    this.nextId = 1;
    this.init();
  }

  init() {
    this.bindEvents();
    this.addCounter(); // Add initial counter
    this.loadSettings();
  }

  bindEvents() {
    // Add counter button
    document.getElementById("addCounterBtn").addEventListener("click", () => {
      this.addCounter();
    });

    // Style controls
    document
      .getElementById("bgColorInput")
      .addEventListener("input", this.updateBackgroundColor.bind(this));
    document
      .getElementById("textColorInput")
      .addEventListener("input", this.updateTextColor.bind(this));
    document
      .getElementById("bgImageInput")
      .addEventListener("input", this.updateBackgroundImage.bind(this));
    document
      .getElementById("fontSelect")
      .addEventListener("change", this.updateFontFamily.bind(this));
    document
      .getElementById("fontSizeSlider")
      .addEventListener("input", this.updateFontSize.bind(this));
    document
      .getElementById("resetStylesBtn")
      .addEventListener("click", this.resetStyles.bind(this));
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
  }

  renderCounter(counter) {
    const container = document.getElementById("countersContainer");
    const counterDiv = document.createElement("div");
    counterDiv.className = "counter";
    counterDiv.dataset.id = counter.id;

    counterDiv.innerHTML = `
            <div class="counter-header">
                <div class="counter-title">${counter.name}</div>
                <button class="delete-counter" onclick="app.deleteCounter(${counter.id})">×</button>
            </div>
            <div class="counter-controls">
                <button class="counter-btn minus" onclick="app.decrementCounter(${counter.id})">−</button>
                <div class="count-display">${counter.count}</div>
                <button class="counter-btn plus" onclick="app.incrementCounter(${counter.id})">+</button>
            </div>
        `;

    container.appendChild(counterDiv);
  }

  incrementCounter(id) {
    const counter = this.counters.find((c) => c.id === id);
    if (counter) {
      counter.count++;
      this.updateCounterDisplay(id, counter.count);
      this.updateTotal();
    }
  }

  decrementCounter(id) {
    const counter = this.counters.find((c) => c.id === id);
    if (counter && counter.count > 0) {
      counter.count--;
      this.updateCounterDisplay(id, counter.count);
      this.updateTotal();
    }
  }

  deleteCounter(id) {
    if (this.counters.length <= 1) {
      alert("You must have at least one counter!");
      return;
    }

    this.counters = this.counters.filter((c) => c.id !== id);
    document.querySelector(`[data-id="${id}"]`).remove();
    this.updateTotal();
  }

  updateCounterDisplay(id, count) {
    const counterElement = document.querySelector(
      `[data-id="${id}"] .count-display`
    );
    if (counterElement) {
      counterElement.textContent = count;
    }
  }

  updateTotal() {
    const total = this.counters.reduce(
      (sum, counter) => sum + counter.count,
      0
    );
    document.getElementById("totalCount").textContent = total;
  }

  // Style update methods
  updateBackgroundColor() {
    const color = document.getElementById("bgColorInput").value;
    if (this.isValidHexColor(color)) {
      document.body.style.backgroundColor = color;
      this.saveSettings();
    }
  }

  updateTextColor() {
    const color = document.getElementById("textColorInput").value;
    if (this.isValidHexColor(color)) {
      document.body.style.color = color;
      this.saveSettings();
    }
  }

  updateBackgroundImage() {
    const imageUrl = document.getElementById("bgImageInput").value;
    if (imageUrl) {
      document.body.style.backgroundImage = `url(${imageUrl})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
    } else {
      document.body.style.backgroundImage = "";
    }
    this.saveSettings();
  }

  updateFontFamily() {
    const fontFamily = document.getElementById("fontSelect").value;
    document.body.style.fontFamily = fontFamily;
    this.saveSettings();
  }

  updateFontSize() {
    const fontSize = document.getElementById("fontSizeSlider").value;
    document.getElementById("fontSizeDisplay").textContent = fontSize + "px";
    document.body.style.fontSize = fontSize + "px";
    this.saveSettings();
  }

  resetStyles() {
    document.body.style.backgroundColor = "";
    document.body.style.color = "";
    document.body.style.backgroundImage = "";
    document.body.style.fontFamily = "";
    document.body.style.fontSize = "";

    document.getElementById("bgColorInput").value = "";
    document.getElementById("textColorInput").value = "";
    document.getElementById("bgImageInput").value = "";
    document.getElementById("fontSelect").value = "'Open Sans', sans-serif";
    document.getElementById("fontSizeSlider").value = 24;
    document.getElementById("fontSizeDisplay").textContent = "24px";

    localStorage.removeItem("counterAppSettings");
  }

  isValidHexColor(hex) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  }

  saveSettings() {
    const settings = {
      backgroundColor: document.body.style.backgroundColor,
      color: document.body.style.color,
      backgroundImage: document.body.style.backgroundImage,
      fontFamily: document.body.style.fontFamily,
      fontSize: document.body.style.fontSize,
    };
    localStorage.setItem("counterAppSettings", JSON.stringify(settings));
  }

  loadSettings() {
    const savedSettings = localStorage.getItem("counterAppSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);

      if (settings.backgroundColor) {
        document.body.style.backgroundColor = settings.backgroundColor;
        document.getElementById("bgColorInput").value =
          settings.backgroundColor;
      }
      if (settings.color) {
        document.body.style.color = settings.color;
        document.getElementById("textColorInput").value = settings.color;
      }
      if (settings.backgroundImage) {
        document.body.style.backgroundImage = settings.backgroundImage;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
      }
      if (settings.fontFamily) {
        document.body.style.fontFamily = settings.fontFamily;
        document.getElementById("fontSelect").value = settings.fontFamily;
      }
      if (settings.fontSize) {
        document.body.style.fontSize = settings.fontSize;
        const size = parseInt(settings.fontSize);
        document.getElementById("fontSizeSlider").value = size;
        document.getElementById("fontSizeDisplay").textContent = size + "px";
      }
    }
  }
}

// Initialize the app
const app = new CounterApp();

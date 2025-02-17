import {
  priceChart,
  lengthOptions,
  projectionOptions,
  installationFeeByDesign,
  screenPrices,
} from "./priceData.js";

let formData = {
  pergolaDesign: "D1",
  pergolaLength: "8.2",
  pergolaProjection: "22.11",
  pergolaHeight: "standard",
  pergolaColor: "RAL7016",
  pergolaMounting: "freestanding",
  pergolaLedPerimeter: "no",
  pergolaHeaters: 0,
  pergolaFans: 0,
  pergolaPermitRequired: "no",
  pergolaColumns: 4,
};

var designSelect = document.getElementById("pergolaDesign");
var permitSelect = document.getElementById("pergolaPermitRequired");

designSelect.addEventListener("change", function () {
  var selectedDesign = designSelect.value;
  var options = lengthOptions[selectedDesign] || [];

  var lengthSelect = document.getElementById("pergolaLength");
  lengthSelect.innerHTML = "";

  options.forEach((option) => {
    var opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.text;
    lengthSelect.appendChild(opt);
  });

  if (options.length > 0) {
    formData.pergolaLength = options[0].value;
  } else {
    formData.pergolaLength = "";
  }

  var installationFeeInput = document.getElementById("pergolaInstallationFee");
  installationFeeInput.value =
    installationFeeByDesign[selectedDesign].text || "";

  document.querySelectorAll(".pergolaImgDesign").forEach((img) => {
    img.classList.remove("active");
  });

  var selectedImage = document.getElementById(`${selectedDesign}-design`);
  if (selectedImage) {
    selectedImage.classList.add("active");
  }
});

permitSelect.addEventListener("change", function () {
  var selectedPermit = permitSelect.value;
  var permitInput = document.getElementById("pergolaPermitFee");

  permitInput.value =
    selectedPermit === "no"
      ? "Permit & Engineering Fee: $0.00"
      : "Permit & Engineering Fee: $3,500";

  formData.pergolaPermitRequired = selectedPermit;
});

document
  .querySelectorAll(".pergolaDiv input, .pergolaDiv select")
  .forEach((element) => {
    element.addEventListener("change", function () {
      formData[this.id] =
        this.type === "number" ? parseFloat(this.value) || 0 : this.value;
    });
  });

document
  .getElementById("calculatePergolaBtn")
  .addEventListener("click", function () {
    let priceKey = `${formData.pergolaDesign}-${formData.pergolaLength}-${formData.pergolaProjection}`;
    let basePrice = parseFloat(priceChart[priceKey] || 0);

    if (basePrice === 0) {
      document.getElementById("pergolaResult").innerText =
        "Price not found for selected combination. Please verify measurements.";
      return;
    }

    let totalPrice = basePrice;
    let adjustments = [];

    // Mounting Adjustment
    if (formData.pergolaMounting?.toLowerCase() === "wall") {
      const posts = formData.pergolaDesign === "D3" ? 8 : 4;
      let mountingDiscount = 140 * posts;
      let mountingAdjustment = 8 * posts;
      totalPrice -= mountingDiscount;
      totalPrice += mountingAdjustment;
      adjustments.push(
        `Wall Mounting Adjustment: -$${mountingDiscount}, +$${mountingAdjustment}`
      );
    }

    // LED Perimeter
    let perimeter =
      (parseFloat(formData.pergolaLength || 0) +
        parseFloat(formData.pergolaProjection || 0)) *
      2;
    let ledCost = perimeter * 4.27;
    if (formData.pergolaLedPerimeter === "yes") {
      totalPrice += ledCost;
      adjustments.push(`LED Perimeter: +$${ledCost.toFixed(2)}`);
    }

    // Electric Heater
    let heaterCost = parseFloat(formData.pergolaHeaters || 0) * 165;
    totalPrice += heaterCost;
    if (heaterCost > 0) {
      adjustments.push(`Electric Heaters: +$${heaterCost.toFixed(2)}`);
    }

    // Fan Beam
    let fanCost = parseFloat(formData.fans || 0) * 209;
    totalPrice += fanCost;
    if (fanCost > 0) {
      adjustments.push(`Fans: +$${fanCost.toFixed(2)}`);
    }

    // Installation Fee
    let installationFee =
      parseFloat(installationFeeByDesign[formData.pergolaDesign]?.value) || 0;
    totalPrice += installationFee;
    adjustments.push(`Installation Fee: +$${installationFee.toFixed(2)}`);

    // Permit Fee
    let permitFee = formData.pergolaPermitRequired === "yes" ? 3500 : 0;
    totalPrice += permitFee;
    if (permitFee > 0) {
      adjustments.push(`Permit & Engineering Fee: +$${permitFee}`);
    }

    // Concrete Footing Costs
    const footingPricePerColumn =
      formData.pergolaPermitRequired === "yes" ? 800 : 400;
    const numberOfColumns = Math.max(
      0,
      parseInt(formData.pergolaColumns, 10) || 0
    );
    let footingCost = footingPricePerColumn * numberOfColumns;
    totalPrice += footingCost;
    adjustments.push(
      `Concrete Footings (${numberOfColumns} columns): +$${footingCost.toFixed(
        2
      )}`
    );

    document.getElementById("pergolaResultText").innerHTML = `
    <strong>Estimated Price: $${totalPrice.toFixed(2)}</strong><br>
    <hr>
    <strong>Breakdown:</strong><br>
    Base Price: $${basePrice.toFixed(2)}<br>
    ${adjustments.join("<br>")}
    `;

    document.getElementById("pergolaResult").style.display = "block";
  });

document
  .getElementById("calculateScreenBtn")
  .addEventListener("click", function () {
    var screenHeight = document.getElementById("screenHeight").value;
    var screenWidth = document.getElementById("screenWidth").value;

    if (screenHeight === "10+ Ft ask pricing") {
      document.getElementById("screenResult").innerText =
        "Price not found for selected combination. Please verify measurements.";
      return;
    }

    const price = parseFloat(screenPrices[screenHeight][screenWidth]);

    if (price) {
      document.getElementById(
        "screenResultText"
      ).innerText = `Screen Price: ${price.toFixed(
        2
      )} (${screenHeight} x ${screenWidth})`;

      document.getElementById("screenResult").style.display = "block";
    } else {
      document.getElementById("screenResult").innerText =
        "Please select valid dimensions for pricing";
    }
  });

const basePrices = {
  sliding: {
    "JAL-D24A": 14.86,
    "JAL-D24A Pro": 14.86,
  },
  bifold: {
    "Jal-WWW Pro": 15.79,
  },
  fixed: {
    "Jal-D24C": 10.23,
  },
  swing: {
    "Single Swing": 17.65,
    "Double Swing": 17.65,
  },
};

const openingMethodSelect = document.getElementById(
  "aluminumPanelsOpeningMethod"
);
const subModelGroup = document.getElementById("aluminumPanelsSubModelGroup");
const subModelSelect = document.getElementById("aluminumPanelsSubModel");
const imageContainer = document.getElementById("aluminumPanelsImageContainer");
const panelImage = document.getElementById("aluminumPanelsPanelImage");

openingMethodSelect.addEventListener("change", function () {
  const selectedMethod = openingMethodSelect.value;
  subModelSelect.innerHTML = "";

  if (selectedMethod && basePrices[selectedMethod]) {
    subModelGroup.style.display = "block";
    const models = basePrices[selectedMethod];
    Object.keys(models).forEach((model) => {
      const option = document.createElement("option");
      option.value = model;
      option.textContent = model;
      subModelSelect.appendChild(option);
    });
  } else {
    subModelGroup.style.display = "none";
  }

  // Show image if bifold or swing panels are selected
  document.querySelectorAll(".panelImage").forEach((img) => {
    img.classList.remove("active");
  });

  var selectedImage = document.getElementById(selectedMethod);
  if (selectedImage) {
    selectedImage.classList.add("active");
  }
});

document
  .getElementById("calculateAluminumPanelsBtn")
  .addEventListener("click", function () {
    const length = parseFloat(
      document.getElementById("aluminumPanelsLength").value
    );
    const width = parseFloat(
      document.getElementById("aluminumPanelsWidth").value
    );
    const height = 8.5; // Fixed height
    const selectedMethod = openingMethodSelect.value;
    const selectedModel = subModelSelect.value;

    const pricingMode = document.querySelector(
      'input[name="aluminumPanelsPricingMode"]:checked'
    ).value;

    if (isNaN(length) || isNaN(width) || !selectedModel) {
      document.getElementById("aluminumPanelsResult").innerText =
        "Please enter valid inputs and select a model.";
      return;
    }

    const basePricePerSqFt = basePrices[selectedMethod][selectedModel];
    let pricePerSqFt = basePricePerSqFt;

    // Apply markup based on pricing mode
    if (pricingMode === "distributor") {
      pricePerSqFt *= 1.2; // 20% markup
    } else if (pricingMode === "retail") {
      pricePerSqFt *= 1.4; // 40% markup
    }

    const perimeter = length + width; // Sum of length and projection width
    const totalArea = perimeter * height; // Area based on perimeter and height
    const totalPrice = totalArea * pricePerSqFt;

    document.getElementById("aluminumPanelsResult").innerHTML = `
          <p>Selected Opening Method: ${selectedMethod}</p>
          <p>Selected Model: ${selectedModel}</p>
          <p>Total Length + Projection Width: ${perimeter.toFixed(2)} ft</p>
          <p>Total Area: ${totalArea.toFixed(2)} sq ft</p>
          <p>Price per Sq Ft: $${pricePerSqFt.toFixed(2)}</p>
          <p>Total Price: $${totalPrice.toFixed(2)}</p>
      `;

    document.getElementById("aluminumPanelsResult").style.display = "block";
  });

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#jsWarning").style.display = "none";
});

import {
  priceChart,
  lengthOptions,
  projectionOptions,
  installationFeeByDesign,
  screenPrices,
} from "./priceData.js";

const validDesigns = ["D1", "D2", "D3"];
const validHeights = ["standard", "custom"];
const validColors = ["RAL7016", "RAL9016", "custom"];
const validMountings = ["freestanding", "wall"];
const validPermitOptions = ["yes", "no"];
const validLedOptions = ["yes", "no"];

let formData = {};

const designSelect = document.querySelector("#pergolaDesign");
const permitSelect = document.querySelector("#pergolaPermitRequired");

function getFormData() {
  const pergolaDesign = designSelect.value;
  const pergolaLength = document.querySelector("#pergolaLength").value;
  const pergolaProjection = document.querySelector("#pergolaProjection").value;
  const pergolaHeight = document.querySelector("#pergolaHeight").value;
  const pergolaColor = document.querySelector("#pergolaColor").value;
  const pergolaMounting = document.querySelector("#pergolaMounting").value;
  const pergolaLedPerimeter = document.querySelector(
    "#pergolaLedPerimeter"
  ).value;
  const pergolaPermitRequired = permitSelect.value;
  const pergolaHeaters =
    parseInt(document.querySelector("#pergolaHeaters").value) || 0;
  const pergolaFans =
    parseInt(document.querySelector("#pergolaFans").value) || 0;
  const pergolaColumns =
    parseInt(document.querySelector("#pergolaColumns").value) || 4;

  let errors = [];

  if (!validDesigns.includes(pergolaDesign)) {
    errors.push("⚠ Invalid Pergola Design selected.");
  }
  if (!validHeights.includes(pergolaHeight)) {
    errors.push("⚠ Invalid Pergola Height selected.");
  }
  if (!validColors.includes(pergolaColor)) {
    errors.push("⚠ Invalid Pergola Color selected.");
  }
  if (!validMountings.includes(pergolaMounting)) {
    errors.push("⚠ Invalid Mounting Type selected.");
  }
  if (!validPermitOptions.includes(pergolaPermitRequired)) {
    errors.push("⚠ Invalid Permit option selected.");
  }
  if (!validLedOptions.includes(pergolaLedPerimeter)) {
    errors.push("⚠ Invalid LED Perimeter option selected.");
  }

  if (isNaN(pergolaHeaters) || pergolaHeaters < 0) {
    errors.push("⚠ Electric Heaters must be a valid number (0 or more).");
  }
  if (isNaN(pergolaFans) || pergolaFans < 0) {
    errors.push("⚠ Fan Beams must be a valid number (0 or more).");
  }
  if (isNaN(pergolaColumns) || pergolaColumns < 1 || pergolaColumns > 16) {
    errors.push("⚠ Number of Columns must be between 1 and 16.");
  }

  if (errors.length > 0) {
    alert(errors.join("\n"));
    return null;
  }

  return {
    pergolaDesign,
    pergolaLength,
    pergolaProjection,
    pergolaHeight,
    pergolaColor,
    pergolaMounting,
    pergolaLedPerimeter,
    pergolaHeaters,
    pergolaFans,
    pergolaPermitRequired,
    pergolaColumns,
  };
}

function updatePergolaDesign() {
  let selectedDesign = designSelect.value;
  let options = lengthOptions[selectedDesign] || [];

  let lengthSelect = document.querySelector("#pergolaLength");
  lengthSelect.innerHTML = "";

  options.forEach((option) => {
    let opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.text;
    lengthSelect.appendChild(opt);
  });

  let installationFeeInput = document.querySelector("#pergolaInstallationFee");
  installationFeeInput.value =
    installationFeeByDesign[selectedDesign].text || "";

  Object.assign(document.querySelector("#pergolaImg"), {
    src: `img/${selectedDesign}-image.jpg`,
    alt: `Pergola design ${selectedDesign}`,
  });
}

designSelect.addEventListener("change", updatePergolaDesign);

function updatePermitFee() {
  const selectedPermit = permitSelect.value;
  document.querySelector("#pergolaPermitFee").value =
    selectedPermit === "no"
      ? "Permit & Engineering Fee: $0.00"
      : "Permit & Engineering Fee: $3,500";
}

permitSelect.addEventListener("change", updatePermitFee);

function calculatePergolaPrice() {
  formData = getFormData();
  if (!formData) return;

  const priceKey = `${formData.pergolaDesign}-${formData.pergolaLength}-${formData.pergolaProjection}`;
  const basePrice = parseFloat(priceChart[priceKey] || 0);

  if (basePrice === 0) {
    alert(
      "Price not found for selected combination. Please verify measurements."
    );
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

  document.querySelector("#pergolaResultText").innerHTML = `
  <strong>Estimated Price: $${totalPrice.toFixed(2)}</strong><br>
  <hr>
  <strong>Breakdown:</strong><br>
  Base Price: $${basePrice.toFixed(2)}<br>
  ${adjustments.join("<br>")}`;

  document.querySelector("#pergolaResult").style.display = "block";

  formData = { ...formData, basePrice, installationFee, permitFee, totalPrice };
}

document
  .querySelector("#calculatePergolaBtn")
  .addEventListener("click", calculatePergolaPrice);

const validScreenHeights = [
  "6 ft 7 inch",
  "8 ft 2 inch",
  "9 ft 10 inch",
  "10+ Ft ask pricing",
];

const validScreenWidths = [
  "4 ft 11 inch",
  "6 ft 7 inch",
  "8 ft 2 inch",
  "9 ft 10 inch",
  "11 ft 5 inch",
  "13 ft 1 inch",
  "14 ft 9 inch",
  "16 ft 4 inch",
  "19 ft 8 inch",
];

function calculateScreenPrice() {
  const screenHeight = document.querySelector("#screenHeight").value;
  const screenWidth = document.querySelector("#screenWidth").value;
  const screenLinearFeet = document.querySelector("#screenLinearFeet").value;
  const numberScreens = document.querySelector("#numberScreens").value;

  let errors = [];

  if (!validScreenHeights.includes(screenHeight)) {
    errors.push("⚠ Invalid Screen Height selected.");
  }
  if (!validScreenWidths.includes(screenWidth)) {
    errors.push("⚠ Invalid Screen Width selected.");
  }

  if (isNaN(screenLinearFeet) || screenLinearFeet <= 0) {
    errors.push("⚠ Linear Feet must be a positive number.");
  }

  if (isNaN(numberScreens) || numberScreens <= 0) {
    errors.push("⚠ Number of Screens must be a positive number.");
  }

  if (errors.length > 0) {
    alert(errors.join("\n"));
    return;
  }

  if (screenHeight === "10+ Ft ask pricing") {
    alert(
      "Price not found for selected combination. Please verify measurements."
    );
    return;
  }

  const basePrice = parseFloat(screenPrices[screenHeight][screenWidth]);

  const heightFeet = parseFloat(screenHeight.split(" ")[0]);
  const widthFeet = parseFloat(screenWidth.split(" ")[0]);

  const totalSqFt = heightFeet * widthFeet;

  const baseCostPerSqFt = basePrice / totalSqFt;

  const officialPricePerSqFt = baseCostPerSqFt * 2.75;

  const totalPriceBeforeLinearFeet = officialPricePerSqFt * totalSqFt;

  const finalPricePerLinearFoot = totalPriceBeforeLinearFeet / widthFeet;

  const finalPrice = finalPricePerLinearFoot * screenLinearFeet;

  if (finalPrice) {
    document.querySelector(
      "#screenResultText"
    ).textContent = `Total Screen Price: ${finalPrice.toFixed(
      2
    )} (${screenHeight} x ${screenWidth})`;
  } else {
    document.querySelector("#screenResultText").textContent =
      "Please select valid dimensions for pricing";
  }
  document.querySelector("#screenResult").style.display = "block";
}

document
  .querySelector("#calculateScreenBtn")
  .addEventListener("click", function (event) {
    event.preventDefault();
    calculateScreenPrice();
  });

function sanitizeInput(input) {
  return input.trim().replace(/[<>/'"]/g, "");
}

function generateEstimate() {
  const clientName = sanitizeInput(
    document.querySelector("#clientNameInput").value
  );
  const clientAddress = sanitizeInput(
    document.querySelector("#clientAddressInput").value
  );
  const clientPhone = sanitizeInput(
    document.querySelector("#clientPhoneInput").value
  );
  const clientEmail = sanitizeInput(
    document.querySelector("#clientEmailInput").value
  );

  const nameRegex = /^[a-zA-Z\s]+$/;
  const addressRegex = /^[a-zA-Z0-9\s,.-]+$/;
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  let errors = [];

  if (!nameRegex.test(clientName)) {
    errors.push("⚠ Full Name should contain only letters and spaces.");
  }

  if (!addressRegex.test(clientAddress)) {
    errors.push(
      "⚠ Address can only include letters, numbers, spaces, commas, dots, and hyphens."
    );
  }

  if (!phoneRegex.test(clientPhone)) {
    errors.push(
      "⚠ Phone number should be 10-15 digits long (optional + at start)."
    );
  }

  if (!emailRegex.test(clientEmail)) {
    errors.push("⚠ Enter a valid email address.");
  }

  if (errors.length > 0) {
    alert(errors.join("\n"));
    return;
  }

  calculatePergolaPrice();

  const estimateData = {
    clientName,
    clientAddress,
    clientPhone,
    clientEmail,
    ...formData,
  };

  localStorage.setItem("estimateData", JSON.stringify(estimateData));

  window.open("estimate.html", "_blank");
}

document
  .querySelector("#generateEstimateBtn")
  .addEventListener("click", function (event) {
    event.preventDefault();
    generateEstimate();
  });

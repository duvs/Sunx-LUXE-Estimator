import {
  priceChart,
  lengthOptions,
  projectionOptions,
  installationFeeByDesign,
  screenPrices,
} from "./priceData.js";

const designSelect = document.querySelector("#pergolaDesign");
const permitSelect = document.querySelector("#pergolaPermitRequired");

function getFormData() {
  return {
    pergolaDesign: designSelect.value,
    pergolaLength: document.querySelector("#pergolaLength").value,
    pergolaProjection: document.querySelector("#pergolaProjection").value,
    pergolaHeight: document.querySelector("#pergolaHeight").value,
    pergolaColor: document.querySelector("#pergolaColor").value,
    pergolaMounting: document.querySelector("#pergolaMounting").value,
    pergolaLedPerimeter: document.querySelector("#pergolaLedPerimeter").value,
    pergolaHeaters:
      parseInt(document.querySelector("#pergolaHeaters").value) || 0,
    pergolaFans: parseInt(document.querySelector("#pergolaFans").value) || 0,
    pergolaPermitRequired: permitSelect.value,
    pergolaColumns:
      parseInt(document.querySelector("#pergolaColumns").value) || 4,
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

  let pergolaDesignImg = document.querySelector("#pergolaImg");
  pergolaDesignImg.src = `img/${selectedDesign}-image.jpg`;
  pergolaDesignImg.alt = `Pergola design ${selectedDesign}`;
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
  const formData = getFormData();

  const priceKey = `${formData.pergolaDesign}-${formData.pergolaLength}-${formData.pergolaProjection}`;
  const basePrice = parseFloat(priceChart[priceKey] || 0);

  if (basePrice === 0) {
    document.querySelector("#pergolaResult").innerText =
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

  document.querySelector("#pergolaResultText").innerHTML = `
  <strong>Estimated Price: $${totalPrice.toFixed(2)}</strong><br>
  <hr>
  <strong>Breakdown:</strong><br>
  Base Price: $${basePrice.toFixed(2)}<br>
  ${adjustments.join("<br>")}`;

  document.querySelector("#pergolaResult").style.display = "block";
}

document
  .querySelector("#calculatePergolaBtn")
  .addEventListener("click", calculatePergolaPrice);

function calculateScreenPrice() {
  var screenHeight = document.querySelector("#screenHeight").value;
  var screenWidth = document.querySelector("#screenWidth").value;

  if (screenHeight === "10+ Ft ask pricing") {
    document.querySelector("#screenResult").innerText =
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

    document.querySelector("#screenResult").style.display = "block";
  } else {
    document.querySelector("#screenResult").innerText =
      "Please select valid dimensions for pricing";
  }
}

document
  .querySelector("#calculateScreenBtn")
  .addEventListener("click", calculateScreenPrice);

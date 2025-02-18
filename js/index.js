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

  return totalPrice.toFixed(2);
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

document
  .querySelector("#clientForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const clientName = document.querySelector("#clientNameInput").value.trim();
    const clientAddress = document
      .querySelector("#clientAddressInput")
      .value.trim();
    const clientPhone = document
      .querySelector("#clientPhoneInput")
      .value.trim();
    const clientEmail = document
      .querySelector("#clientEmailInput")
      .value.trim();

    if (!clientName || !clientAddress || !clientPhone || !clientEmail) {
      document.querySelector("#error-message").style.display = "block";
      return;
    }

    document.querySelector("#error-message").style.display = "none";

    generateEstimate(clientName, clientAddress, clientPhone, clientEmail);
  });

function generateEstimate(clientName, clientAddress, clientPhone, clientEmail) {
  const formData = getFormData();
  const totalPrice = calculatePergolaPrice();

  const estimateContent = `
        <html>
        <head>
          <title>Estimate Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            h2, h3 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            table, th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #007bff; color: white; }
            .total { font-weight: bold; font-size: 18px; color: green; text-align: right; }
            .contract { margin-top: 40px; font-size: 14px; }
            .signature-section { margin-top: 30px; text-align: center; }
            .signature-box { width: 300px; border-top: 1px solid black; margin: 20px auto; padding-top: 5px; }
          </style>
        </head>
        <body>
          <h2>Pergola Estimate</h2>
  
          <h3>Client Information</h3>
          <table>
            <tr><td><strong>Name:</strong></td><td>${clientName}</td></tr>
            <tr><td><strong>Address:</strong></td><td>${clientAddress}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>${clientPhone}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${clientEmail}</td></tr>
          </table>
  
          <h3>Estimate Details</h3>
          <table>
            <tr><th>Property</th><th>Value</th></tr>
            <tr><td>Design</td><td>${formData.pergolaDesign}</td></tr>
            <tr><td>Length</td><td>${formData.pergolaLength} ft</td></tr>
            <tr><td>Projection</td><td>${
              formData.pergolaProjection
            } ft</td></tr>
            <tr><td>Height</td><td>${formData.pergolaHeight}</td></tr>
            <tr><td>Color</td><td>${formData.pergolaColor}</td></tr>
            <tr><td>Mounting</td><td>${formData.pergolaMounting}</td></tr>
            <tr><td>LED Perimeter</td><td>${
              formData.pergolaLedPerimeter === "yes" ? "Yes" : "No"
            }</td></tr>
            <tr><td>Electric Heaters</td><td>${
              formData.pergolaHeaters
            }</td></tr>
            <tr><td>Fans</td><td>${formData.pergolaFans}</td></tr>
            <tr><td>Permit Required</td><td>${
              formData.pergolaPermitRequired === "yes" ? "Yes" : "No"
            }</td></tr>
            <tr><td>Number of Columns</td><td>${
              formData.pergolaColumns
            }</td></tr>
          </table>
          
          <h3 class="total">Total Price: $${totalPrice}</h3>
  
          <h3>Contract Agreement</h3>
          <div class="contract">
            <p><strong>1. Agreement Overview</strong><br>
            This Agreement is made between the Parties and may only be modified as specified herein...
            </p>
  
            <p><strong>2. Contract Documents</strong><br>
            This Agreement encompasses all details of the project scope...
            </p>
  
            <p><strong>3. Payment Terms</strong><br>
            Payments shall be made to Epic Landscaping Inc. according to the following schedule:<br>
            30% Deposit upon contract execution.<br>
            40%: (20% upon permit approval, 20% upon material delivery).<br>
            20% Upon pergola final completion.<br>
            10% Upon permit closure.<br>
            </p>
  
            <p><strong>4. Design Revisions and Change Orders</strong><br>
            Up to three (3) design revisions are included in the contract price...
            </p>
  
            <p><strong>5. Scheduling, Site Access, and Delivery</strong><br>
            Epic Landscaping Inc. will make every reasonable effort to complete the project on schedule...
            </p>
  
            <p><strong>6. Warranty and Disclaimer</strong><br>
            The SunXco pergola system is engineered to withstand various weather conditions...
            </p>
  
            <p><strong>7. Dispute Resolution</strong><br>
            Before initiating legal action, Epic Landscaping Inc. shall have the right to address and remedy any construction defects...
            </p>
  
            <p><strong>8. Insurance</strong><br>
            The Owner shall maintain standard property and liability insurance...
            </p>
  
            <p><strong>9. Homeowner’s Association and Historic Approvals</strong><br>
            The Owner is responsible for obtaining any necessary Homeowner’s Association (HOA) approvals...
            </p>
  
            <p><strong>10. Construction Liens</strong><br>
            Under Florida’s Construction Lien Law (Sections 713.001 - 713.37), contractors and suppliers who are unpaid may file a lien against the property...
            </p>
  
            <p><strong>11. Termination Policy</strong><br>
            Due to the custom nature of SunXco pergola systems, orders cannot be canceled once placed...
            </p>
  
            <p><strong>12. Cleanup Responsibility</strong><br>
            Epic Landscaping Inc. shall maintain a clean and organized job site...
            </p>
          </div>
  
          <div class="signature-section">
            <h3>Signatures</h3>
            <div class="signature-box">Owner Signature</div>
            <p>Print Name: ${clientName}</p>
            <div class="signature-box">Epic Landscaping Inc. Representative</div>
            <p>Print Name: ___________________________</p>
            <p>Date: ___________________________</p>
          </div>
  
          <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </body>
        </html>
      `;

  const estimateWindow = window.open("", "_blank");
  estimateWindow.document.open();
  estimateWindow.document.write(estimateContent);
  estimateWindow.document.close();

  estimateWindow.print();
}

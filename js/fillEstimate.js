document.addEventListener("DOMContentLoaded", function () {
  const estimateData = JSON.parse(localStorage.getItem("estimateData"));

  if (!estimateData) {
    alert("No estimate data found. Please generate an estimate first.");
    window.location.href = "index.html";
    return;
  }

  document.querySelector("#clientName").textContent = estimateData.clientName;
  document.querySelector("#clientAddress").textContent =
    estimateData.clientAddress;
  document.querySelector("#clientPhone").textContent = estimateData.clientPhone;
  document.querySelector("#clientEmail").textContent = estimateData.clientEmail;

  document.querySelector("#description").innerHTML = `
  <ul>
    <li>Pergola Design: ${estimateData.pergolaDesign}</li>
    <li>Dimensions: ${estimateData.pergolaLength} ft (Length) x ${
    estimateData.pergolaProjection
  } ft (Projection)</li>
    <li>Height: ${estimateData.pergolaHeight}</li>
    <li>Structure Color: ${estimateData.pergolaColor}</li>
    <li>Mounting Type: ${estimateData.pergolaMounting}</li>
    <li>LED Perimeter: ${
      estimateData.pergolaLedPerimeter === "yes" ? "Included" : "Not included"
    }</li>
    <li>Electric Heaters: ${estimateData.pergolaHeaters}</li>
    <li>Fan Beams: ${estimateData.pergolaFans}</li>
    <li>Permit Required: ${
      estimateData.pergolaPermitRequired === "yes"
        ? "Yes, additional engineering and permitting fees apply."
        : "No, standard installation."
    }</li>
    <li>Supporting Columns: ${estimateData.pergolaColumns}</li>
    <li>Installation Fee: $${estimateData.installationFee.toFixed(2)}</li>
    <li>Permit Fee: $${estimateData.permitFee.toFixed(2)}</li>
  </ul>
`;

  document.querySelector("#price").textContent = `$${estimateData.totalPrice}`;

  document.querySelector(
    "#totalPrice"
  ).textContent = `$${estimateData.totalPrice}`;

  document.querySelector("#estimateDate").textContent =
    new Date().toLocaleDateString();
});

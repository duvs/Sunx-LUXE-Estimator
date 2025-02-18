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

  document.querySelector("#summaryDesign").textContent =
    estimateData.pergolaDesign;
  document.querySelector(
    "#summaryLength"
  ).textContent = `${estimateData.pergolaLength} ft`;
  document.querySelector(
    "#summaryProjection"
  ).textContent = `${estimateData.pergolaProjection} ft`;
  document.querySelector("#summaryHeight").textContent =
    estimateData.pergolaHeight;
  document.querySelector("#summaryColor").textContent =
    estimateData.pergolaColor;
  document.querySelector("#summaryMounting").textContent =
    estimateData.pergolaMounting;
  document.querySelector("#summaryLed").textContent =
    estimateData.pergolaLedPerimeter === "yes" ? "Yes" : "No";
  document.querySelector("#summaryHeaters").textContent =
    estimateData.pergolaHeaters;
  document.querySelector("#summaryFans").textContent = estimateData.pergolaFans;
  document.querySelector("#summaryPermit").textContent =
    estimateData.pergolaPermitRequired === "yes" ? "Yes" : "No";
  document.querySelector("#summaryColumns").textContent =
    estimateData.pergolaColumns;

  document.querySelector(
    "#summaryBasePrice"
  ).textContent = `$${estimateData.basePrice.toFixed(2)}`;
  document.querySelector(
    "#summaryInstallation"
  ).textContent = `$${estimateData.installationFee.toFixed(2)}`;
  document.querySelector(
    "#summaryPermitFee"
  ).textContent = `$${estimateData.permitFee.toFixed(2)}`;
  document.querySelector(
    "#summaryTotal"
  ).textContent = `$${estimateData.totalPrice.toFixed(2)}`;

  document.querySelector("#estimateDate").textContent =
    new Date().toLocaleDateString();
});

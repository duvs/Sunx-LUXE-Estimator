document.addEventListener("DOMContentLoaded", function () {
  const estimateData = JSON.parse(localStorage.getItem("estimateData"));

  if (!estimateData) {
    alert("No estimate data found. Please generate an estimate first.");
    console.error("No estimate data in localStorage.");
    window.location.href = "index.html";
    return;
  }

  // Asignar valores si los elementos existen en el DOM
  const setTextContent = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value || "N/A";
  };

  setTextContent("#clientName", estimateData.clientName);
  setTextContent("#clientAddress", estimateData.clientAddress);
  setTextContent("#clientPhone", estimateData.clientPhone);
  setTextContent("#clientEmail", estimateData.clientEmail);
  setTextContent("#price", `$${estimateData.totalPrice.toFixed(2)}`);
  setTextContent("#totalPrice", `$${estimateData.totalPrice.toFixed(2)}`);
  setTextContent("#estimateDate", new Date().toLocaleDateString());

  // Llenar la descripción con lista <ul>
  const descriptionElement = document.querySelector("#description");
  if (descriptionElement) {
    descriptionElement.innerHTML = `
      <ul>
        <li>Pergola Design: ${estimateData.pergolaDesign}</li>
        <li>Dimensions: ${estimateData.pergolaLength} ft (Length) x ${
      estimateData.pergolaProjection
    } ft (Projection)</li>
        <li>Height: ${estimateData.pergolaHeight}</li>
        <li>Structure Color: ${estimateData.pergolaColor}</li>
        <li>Mounting Type: ${estimateData.pergolaMounting}</li>
        <li>LED Perimeter: ${
          estimateData.pergolaLedPerimeter === "yes"
            ? "Included"
            : "Not included"
        }</li>
        <li>Electric Heaters: ${estimateData.pergolaHeaters || 0}</li>
        <li>Fan Beams: ${estimateData.pergolaFans || 0}</li>
        <li>Permit Required: ${
          estimateData.pergolaPermitRequired === "yes"
            ? "Yes, additional engineering and permitting fees apply."
            : "No, standard installation."
        }</li>
        <li>Supporting Columns: ${estimateData.pergolaColumns || 0}</li>
        <li>Installation Fee: $${(estimateData.installationFee || 0).toFixed(
          2
        )}</li>
        <li>Permit Fee: $${(estimateData.permitFee || 0).toFixed(2)}</li>
      </ul>
    `;
  }

  // Descargar PDF
  const downloadButton = document.querySelector("#downloadPdfBtn");
  if (downloadButton) {
    downloadButton.addEventListener("click", function () {
      const element = document.querySelector(".estimate");
      if (!element) {
        console.error("Estimate element not found.");
        return;
      }

      html2pdf()
        .from(element)
        .set({
          margin: [10, 10, 10, 10],
          filename: "Pergola_Estimate.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .save();
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const breakdownList = document.querySelector("#breakdown-list");
  const screenDetailsList = document.querySelector("#screenDetails-list");
  const estimateData = JSON.parse(localStorage.getItem("estimateData"));
  const clientInfo = estimateData.clientInfo;
  const formData = estimateData.formData;
  const screenData = estimateData.screenData || {};
  const projectPrice = estimateData.projectPrice || formData.totalPrice;

  if (!estimateData) {
    alert("No estimate data found. Please generate an estimate first.");
    console.error("No estimate data in localStorage.");
    window.location.href = "index.html";
    return;
  }

  const setTextContent = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value || "N/A";
  };

  setTextContent("#clientName", clientInfo.clientName);
  setTextContent("#clientAddress", clientInfo.clientAddress);
  setTextContent("#clientPhone", clientInfo.clientPhone);
  setTextContent("#clientEmail", clientInfo.clientEmail);
  setTextContent("#basePrice", `${formData.basePrice.toFixed(2)}`);
  setTextContent("#installationFee", `${formData.installationFee.toFixed(2)}`);
  setTextContent("#permitFee", `${formData.permitFee.toFixed(2)}`);
  setTextContent("#totalPrice", `${formData.totalPrice.toFixed(2)}`);
  setTextContent("#estimateDate", new Date().toLocaleDateString());
  setTextContent("#projectPrice", `${projectPrice.toFixed(2)}`);

  const descriptionElement = document.querySelector("#description");
  if (descriptionElement) {
    descriptionElement.innerHTML = `
      <ul>
        <li>Pergola Design ${formData.pergolaDesign.text}</li>
        <li>Dimensions: ${formData.pergolaLength.text} (Length) x ${
      formData.pergolaProjection.text
    } (Projection)</li>
        <li>Height: ${formData.pergolaHeight.text}</li>
        <li>Structure Color: ${formData.pergolaColor.text}</li>
        <li>Mounting Type: ${formData.pergolaMounting.text}</li>
        <li>LED Perimeter: ${
          formData.pergolaLedPerimeter.value === "Yes"
            ? "Included"
            : "Not included"
        }</li>
        <li>Electric Heaters: ${formData.pergolaHeaters || 0}</li>
        <li>Fan Beams: ${formData.pergolaFans || 0}</li>
        <li>Permit Required: ${
          formData.pergolaPermitRequired.value === "Yes"
            ? "Yes, additional engineering and permitting fees apply."
            : "No, standard installation."
        }</li>
        <li>Supporting Footer: ${formData.pergolaFooter || 0}</li>
      </ul>
    `;
  }

  const breakDownData = formData["adjustments"] || [];
  if (breakdownList && Array.isArray(breakDownData)) {
    breakDownData.forEach((adjustment) => {
      const li = document.createElement("li");
      li.textContent = adjustment;

      breakdownList.appendChild(li);
    });
  }

  const screenDetails = screenData.screenDetails || [];
  if (
    screenDetailsList &&
    Array.isArray(screenDetails) &&
    screenDetails.length > 0
  ) {
    setTextContent("#totalPriceScreen", screenData.totalPrice.toFixed(2));
    document.querySelector("#pergolaCost").style.display = "block";
    document.querySelector("#screenDetails").style.display = "block";
    screenDetails.forEach((details) => {
      const li = document.createElement("li");
      li.textContent = details;

      screenDetailsList.appendChild(li);
    });
  }

  const downloadButton = document.querySelector("#downloadPdfBtn");
  if (downloadButton) {
    downloadButton.addEventListener("click", function () {
      const element = document.querySelector(".estimate");
      if (!element) {
        console.error("Estimate element not found.");
        return;
      }

      let clientName = clientInfo.clientName.trim();

      let nameParts = clientName.split(/\s+/);
      let shortName = nameParts.slice(0, 2).join("_");

      shortName = shortName.substring(0, 30);

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;
      const fileName = `${shortName}_Estimate_${formattedDate}.pdf`;

      html2pdf()
        .from(element)
        .set({
          margin: [10, 20, 10, 20],
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            dpi: 300,
            letterRendering: true,
            useCORS: true,
            logging: false,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .save(fileName);
    });
  }
});

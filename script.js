// === DOM References ===
const dotButtons = document.querySelectorAll("#dotShapes .shape-button");
const cornerButtons = document.querySelectorAll("#cornerShapes .shape-button");
const fgColor = document.getElementById("FGColor");
const bgColor = document.getElementById("BGColor");
const logoInput = document.getElementById("logoInput");
const logoPreview = document.getElementById("logoPreview");
const logoPreviewWrapper = document.getElementById("logoPreviewWrapper");
const removeLogoBtn = document.getElementById("removeLogo");
const uploadTrigger = document.getElementById("uploadTrigger");

const qrContainer = document.getElementById("qrContainer");
const downloadBtn = document.getElementById("downloadBtn");
const userInput = document.getElementById("userInput");
const qrTypeButtons = document.querySelectorAll(".qr-type");
const accordionHeaders = document.querySelectorAll(".accordion-header");

// === State ===
let dotStyleVal = "square";
let cornerStyleVal = "square";
let logoImage = null;
let selectedType = "URL";
let qr = null;

// === QR Type Placeholder Logic ===
function updatePlaceholder() {
  const map = {
    TEXT: "Enter plain text here",
    "E-MAIL": "you@example.com",
    SMS: "91XXXXXXXXXX: Your message here",
    URL: "https://example.com",
  };
  userInput.placeholder = map[selectedType] || map.URL;
}

// === Format Data for QR Code ===
function formatData(raw) {
  switch (selectedType) {
    case "E-MAIL":
      return `mailto:${raw}`;
    case "SMS":
      const [phone, ...msg] = raw.split(":");
      return `sms:${phone}?body=${msg.join(":")}`;
    default:
      return raw;
  }
}

// === Generate QR Code ===
function generateQR() {
  qrContainer.innerHTML = "";
  const data = userInput.value.trim() || userInput.placeholder;
  const qrSize = Math.min(qrContainer.clientWidth, qrContainer.clientHeight);

  qr = new QRCodeStyling({
    width: qrSize,
    height: qrSize,
    data: formatData(data),
    image: logoImage,
    dotsOptions: {
      color: fgColor.value,
      type: dotStyleVal,
    },
    cornersSquareOptions: {
      color: fgColor.value,
      type: cornerStyleVal,
    },
    backgroundOptions: {
      color: bgColor.value,
    },
  });

  qr.append(qrContainer);

  qr.getRawData("png").then((blob) => {
    if (downloadBtn.href?.startsWith("blob:")) {
      URL.revokeObjectURL(downloadBtn.href);
    }

    const blobUrl = URL.createObjectURL(blob);
    downloadBtn.href = blobUrl;
    downloadBtn.download = "qr-code.png";
    downloadBtn.classList.remove("secondary");
  });
}

// === Shape Selector Logic ===
function initShapeToggle(buttons, updateFn) {
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateFn(btn.dataset.style);
      generateQR();
    });
  });
}

initShapeToggle(dotButtons, (val) => (dotStyleVal = val));
initShapeToggle(cornerButtons, (val) => (cornerStyleVal = val));

// === QR Type Switching ===
qrTypeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    qrTypeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedType = btn.textContent.trim();
    updatePlaceholder();
    generateQR();
  });
});

// === Accordion Toggle ===
accordionHeaders.forEach((header) => {
  header.addEventListener("click", () => {
    const current = header.parentElement;
    const isActive = current.classList.contains("active");

    document
      .querySelectorAll(".accordion")
      .forEach((acc) => acc.classList.remove("active"));

    if (!isActive) current.classList.add("active");
  });
});

// === Logo Upload Logic ===
uploadTrigger.addEventListener("click", () => {
  logoInput.value = "";
  logoInput.click();
});

logoInput.addEventListener("change", () => {
  const file = logoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    logoImage = reader.result;
    logoPreview.src = logoImage;
    logoPreview.style.display = "block";
    removeLogoBtn.style.display = "flex";
    generateQR();
  };
  reader.readAsDataURL(file);
});

// === Remove Logo ===
function removeLogo() {
  logoImage = null;
  logoPreview.src = "";
  logoPreview.style.display = "none";
  removeLogoBtn.style.display = "none";
  generateQR();
}

removeLogoBtn.addEventListener("click", removeLogo);
logoPreview.addEventListener("click", removeLogo);

// Prevent wrapper click triggering file upload
logoPreviewWrapper.addEventListener("click", (e) => {
  if (e.target === logoPreviewWrapper) {
    e.stopPropagation();
  }
});

// === Live Update for Color / Input ===
[userInput, fgColor, bgColor].forEach((el) =>
  el.addEventListener("input", generateQR)
);

// === Init ===
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".accordion")
    .forEach((acc) => acc.classList.remove("active"));

  updatePlaceholder();
  generateQR();
});

document.addEventListener("DOMContentLoaded", () => {
  generateQR(); // call after page is fully loaded
});

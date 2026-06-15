// panel.js - Minimal Complete Version
console.log("panel.js loaded");
const TOOLTIP_TEXTS = {
    "nx-t1": "Classic", "nx-t2": "LED", 
    "nx-police": "police", "flicker": "flicker", "starter": "start", "blink": "blink",
    "crazy": "slumbery", "lantern": "lantern"
};



let currentBackgroundImage = null;
let currentTemplateUI = "nx-t1";
let canvasWidth = 800;
let canvasHeight = 400;
let renderTimeout = null;

const canvas = document.getElementById("neonCanvas");
const textarea = document.getElementById("textbox");
const fontSelect = document.getElementById("fontSelect");
const sizeSelect = document.querySelector(".sizeSelect");
const picker = document.getElementById("colorPicker");
const bgToggle = document.getElementById("bgImageToggle");
const chooseBtn = document.getElementById("chooseImageBtn");
const fileInput = document.getElementById("bgImageInput");
const alignButtons = document.querySelectorAll(".icon-btn[data-align]");
const templateBoxes = document.querySelectorAll('.gif-box[data-template]');
const effectButtons = document.querySelectorAll(".gif-box");

let currentState = {
    text: "Neony",
    fontFamily: "Abnoos",
    fontSize: 120,
    neonColor: "#00eaff",
    textAlign: "center",
    direction: "rtl"
};

function renderToCanvas() {
    if (!canvas || !window.NeonRenderer) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const style = {
        fontSize: `${currentState.fontSize}px`,
        fontFamily: currentState.fontFamily,
        lineHeight: 0.8,
        textAlign: currentState.textAlign,
        direction: currentState.direction
    };
    window.NeonRenderer.settings.template = currentTemplateUI;
    window.NeonRenderer.settings.color = currentState.neonColor;
    let bgImage = (bgToggle && bgToggle.checked && currentBackgroundImage) ? currentBackgroundImage : null;
    const intensity = window.NeonRenderer.getCurrentIntensity();
    window.NeonRenderer.draw(ctx, currentState.text, style, intensity, canvas.width, canvas.height, 0, bgImage);
}

function scheduleRender() {
    if (renderTimeout) clearTimeout(renderTimeout);
    renderTimeout = setTimeout(renderToCanvas, 50);
}

function updateStateAndRender(updates) {
    Object.assign(currentState, updates);
    scheduleRender();
}

if (textarea) {
    textarea.addEventListener("input", () => {
        let val = textarea.value.substring(0, 100);
        textarea.value = val;
        updateStateAndRender({ text: val || "Neony" });
    });
}
if (fontSelect) fontSelect.addEventListener("change", () => updateStateAndRender({ fontFamily: fontSelect.value }));
if (picker) picker.addEventListener("input", (e) => updateStateAndRender({ neonColor: e.target.value }));
if (sizeSelect) {
    sizeSelect.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const sizeSlider = document.getElementById("floatingSizeSlider");
        if (!sizeSlider) return;
        const rect = sizeSelect.getBoundingClientRect();
        sizeSlider.style.position = "fixed";
        sizeSlider.style.left = rect.left + "px";
        sizeSlider.style.top = (rect.bottom + 6) + "px";
        sizeSlider.style.width = rect.width + "px";
        sizeSlider.style.display = "block";
        sizeSlider.value = currentState.fontSize;
        sizeSlider.oninput = () => {
            currentState.fontSize = parseInt(sizeSlider.value);
            sizeSelect.options[0].textContent = currentState.fontSize + " pt";
            renderToCanvas();
        };
        document.addEventListener("mousedown", function onDocClick(e) {
            if (!sizeSlider.contains(e.target) && e.target !== sizeSelect) {
                sizeSlider.style.display = "none";
                document.removeEventListener("mousedown", onDocClick);
            }
        });
    });
}
alignButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        alignButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        updateStateAndRender({ textAlign: btn.dataset.align });
    });
});
templateBoxes.forEach(box => {
    box.addEventListener("click", () => {
        templateBoxes.forEach(b => b.classList.remove("active"));
        box.classList.add("active");
        currentTemplateUI = box.dataset.template;
        scheduleRender();
    });
});
if (chooseBtn && fileInput) {
    chooseBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                currentBackgroundImage = img;
                if (bgToggle && bgToggle.checked) scheduleRender();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });
}
if (bgToggle) bgToggle.addEventListener("change", () => scheduleRender());

const applySizeBtn = document.getElementById("applySizeBtn");
if (applySizeBtn) {
    applySizeBtn.addEventListener("click", () => {
        let w = parseInt(document.querySelector(".rs-width")?.value, 10);
        let h = parseInt(document.querySelector(".rs-height")?.value, 10);
        if (isNaN(w) || w < 1) w = 800;
        if (isNaN(h) || h < 1) h = 400;
        canvasWidth = w;
        canvasHeight = h;
        if (canvas) {const dpr = window.devicePixelRatio || 1;

canvas.width = canvasWidth * dpr;
canvas.height = canvasHeight * dpr;

canvas.style.width = canvasWidth + "px";
canvas.style.height = canvasHeight + "px";



ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        scheduleRender();
    });
}

if (effectButtons.length) {
    effectButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            NeonRenderer.setEffect(btn.dataset.effect);
            renderToCanvas();
        });
    });
}

window.addEventListener("load", () => {
    if (textarea) textarea.value = currentState.text;
    if (fontSelect) fontSelect.value = currentState.fontFamily;
    if (sizeSelect) sizeSelect.options[0].textContent = currentState.fontSize + " pt";
    if (picker) picker.value = currentState.neonColor;
    setTimeout(renderToCanvas, 200);
    if (NeonRenderer.startPreview) NeonRenderer.startPreview(canvas, () => renderToCanvas());
});

const gifRenderBtn = document.querySelector(".gif-render-btn");
const supportPopup = document.getElementById("support-popup");
const saveForVideo = document.getElementById("saveForVideo");
const saveForWeb = document.getElementById("saveForWeb");
const adVideo = document.getElementById("adVideo");
const adStatus = document.getElementById("adStatus");
const renderButtons = document.getElementById("render-buttons");

function closePopup() { if (supportPopup) supportPopup.style.display = "none"; }

if (saveForVideo && typeof JSZip !== "undefined") {
    saveForVideo.onclick = async () => {
        if (saveForVideo.disabled) return;
        closePopup();
saveForVideo.disabled = true;
showProgress("Start Rener ZIP...");
        try {
            const zip = new JSZip();
            const totalFrames = 60;
            const style = { fontFamily: currentState.fontFamily, fontSize: currentState.fontSize, lineHeight: 0.8, textAlign: currentState.textAlign, direction: currentState.direction };
            const bgImage = (bgToggle?.checked && currentBackgroundImage) ? currentBackgroundImage : null;
            for (let i = 0; i < totalFrames; i++) {
                const percent = Math.round((i / totalFrames) * 100);
                updateProgress(percent, `ZIP... ${percent}%`);
                const frameCanvas = document.createElement("canvas");
                frameCanvas.width = canvasWidth;
                frameCanvas.height = canvasHeight;
                const ctx = frameCanvas.getContext("2d");
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                if (bgImage) ctx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
                window.NeonRenderer.settings.color = currentState.neonColor;
                window.NeonRenderer.settings.template = currentTemplateUI;
                const intensity = window.NeonRenderer.getIntensityForFrame(i);
                window.NeonRenderer.draw(ctx, currentState.text, style, intensity, canvasWidth, canvasHeight, (i/totalFrames)*2, null);
                const blob = await new Promise(resolve => frameCanvas.toBlob(resolve, "image/png"));
                zip.file(`frame_${String(i+1).padStart(3,'0')}.png`, blob);
                await new Promise(r => setTimeout(r, 0));
            }
            updateProgress(100, "Compressing...");
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const link = document.createElement("a");
            link.download = `neon-frames-${Date.now()}.zip`;
            link.href = URL.createObjectURL(zipBlob);
            link.click();
            URL.revokeObjectURL(link.href);
            alert("ZIP Downloaded");
        } catch (err) { alert("خطا: " + err.message); }
        finally {
            saveForVideo.disabled = false;
            saveForVideo.textContent = "For Video Editors";
            hideProgress();
        }
    };
}

if (saveForWeb && typeof UPNG !== "undefined") {
    saveForWeb.onclick = async () => {
        if (saveForWeb.disabled) return;
        closePopup();
        saveForWeb.disabled = true;
	showProgress("Start of making APNG...");
        try {
            const totalFrames = 60;
            const delayMs = Math.round(5000 / totalFrames);
            const delays = new Array(totalFrames).fill(delayMs);
            const style = { fontFamily: currentState.fontFamily, fontSize: currentState.fontSize, lineHeight: 0.8, textAlign: currentState.textAlign, direction: currentState.direction };
            const bgImage = (bgToggle?.checked && currentBackgroundImage) ? currentBackgroundImage : null;
            const framesData = [];
            for (let i = 0; i < totalFrames; i++) {
                const percent = Math.round((i / totalFrames) * 100);
                updateProgress(percent, `APNG... ${percent}%`);
                const frameCanvas = document.createElement("canvas");
                frameCanvas.width = canvasWidth;
                frameCanvas.height = canvasHeight;
                const ctx = frameCanvas.getContext("2d");
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                if (bgImage) ctx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
                window.NeonRenderer.settings.color = currentState.neonColor;
                window.NeonRenderer.settings.template = currentTemplateUI;
                const intensity = window.NeonRenderer.getIntensityForFrame(i);
                window.NeonRenderer.draw(ctx, currentState.text, style, intensity, canvasWidth, canvasHeight, (i/totalFrames)*2, null);
                const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
                framesData.push(new Uint8Array(imageData.data));
                await new Promise(r => setTimeout(r, 0));
            }
            saveForWeb.textContent = "Under Making APNG...";
            const apngBuffer = UPNG.encode(framesData, canvasWidth, canvasHeight, 0, delays);
            const blob = new Blob([apngBuffer], { type: "image/apng" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = "neon-animation.apng";
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            alert("APNG Downloaded");
        } catch (err) { alert("Eror: " + err.message); }
        finally {
            saveForWeb.disabled = false;
            saveForWeb.textContent = "For Web/Social media (APNG)";
	    hideProgress();
        }
    };
}

const globalProgress = document.getElementById("globalProgress");
const globalProgressBar = document.getElementById("globalProgressBar");
const globalProgressStatus = document.getElementById("globalProgressStatus");

function showProgress(text = "") {
    if (!globalProgress) return;
    globalProgress.style.display = "block";
    globalProgressBar.style.width = "0%";
    globalProgressStatus.textContent = text;
}

function updateProgress(percent, text = "") {
    if (!globalProgress) return;
    globalProgressBar.style.width = percent + "%";
    globalProgressStatus.textContent = text;
}

function hideProgress() {
    if (!globalProgress) return;
    globalProgress.style.display = "none";
}

function unlockRenderButtons() {

    saveForVideo.disabled = false;
    saveForWeb.disabled = false;

    if (adStatus) {
        adStatus.textContent = "رندر فعال شد";
    }
}
if (adVideo) {

    adVideo.addEventListener("ended", () => {

        unlockRenderButtons();

    });

}

if (gifRenderBtn && supportPopup) {
    gifRenderBtn.onclick = () => { supportPopup.style.display = "flex"; };
	if (renderButtons) {
    renderButtons.style.display = "none";
}
    supportPopup.onclick = (e) => { if (e.target === supportPopup) supportPopup.style.display = "none"; };
}

// Tooltips
const tooltip = document.getElementById("effect-tooltip");
if (tooltip) tooltip.style.display = "none";
function attachTooltip(element, textKey) {
    if (!element || !tooltip) return;
    element.addEventListener("mouseenter", (e) => {
        tooltip.textContent = TOOLTIP_TEXTS[textKey] || textKey;
        tooltip.style.position = "fixed";
        tooltip.style.display = "block";
    });
    element.addEventListener("mousemove", (e) => {
        tooltip.style.left = (e.pageX + 10) + "px";
        tooltip.style.top = (e.pageY + 10) + "px";
    });
    element.addEventListener("mouseleave", () => tooltip.style.display = "none");
}
document.querySelectorAll('[data-align]').forEach(el => attachTooltip(el, `align-${el.dataset.align}`));
document.querySelectorAll('.template-box').forEach(el => attachTooltip(el, el.dataset.template));
document.querySelectorAll('.gif-box').forEach(el => attachTooltip(el, el.dataset.effect));
if (document.querySelector('#chooseImageBtn')) attachTooltip(document.querySelector('#chooseImageBtn'), 'choose-image');
if (document.querySelector('#applySizeBtn')) attachTooltip(document.querySelector('#applySizeBtn'), 'apply-size');
if (document.querySelector('.gif-render-btn')) attachTooltip(document.querySelector('.gif-render-btn'), 'gif-render');

// Background image
if (chooseBtn && fileInput) {
    chooseBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Choose an image (png, jpg, jpeg, tiff)");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentBackgroundImage = img;
                if (bgToggle && bgToggle.checked) scheduleRender();
                console.log("Background image successfully loaded.");
            };
            img.onerror = () => {
                console.error("Error loading image");
                alert("Error loading image");
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
if (bgToggle) {
    bgToggle.addEventListener("change", () => scheduleRender());
}

// تعریف متن تولتیپ برای دکمه‌های پاپ‌آپ
const saveVideoBtn = document.getElementById("saveForVideo");
const saveWebBtn = document.getElementById("saveForWeb");

if (saveVideoBtn && saveWebBtn) {
    // متن‌های دلخواه خود را اینجا بنویسید
    const videoTooltip = "For Video Editors (AdobePremiere, AdobeAfterEffects, FinalCut, DaVinciResolve, etc.)";
    const webTooltip = "For web and social media.";
    
    // تنظیم title (تولتیپ پیش‌فرض مرورگر)
    saveVideoBtn.title = videoTooltip;
    saveWebBtn.title = webTooltip;
    
    // (اختیاری) استفاده از تولتیپ سفارشی
    if (typeof attachTooltip === 'function') {
        if (typeof TOOLTIP_TEXTS === 'undefined') window.TOOLTIP_TEXTS = {};
        TOOLTIP_TEXTS['save-video'] = videoTooltip;
        TOOLTIP_TEXTS['save-web'] = webTooltip;
        attachTooltip(saveVideoBtn, 'save-video');
        attachTooltip(saveWebBtn, 'save-web');
    }
}

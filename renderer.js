function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    let r = parseInt( hex.substring(0, 2), 16 );
    let g = parseInt( hex.substring(2, 4), 16 );
    let b = parseInt( hex.substring(4, 6), 16 );

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function mixColor(hex, mixHex, amount) {

    hex = hex.replace('#', '');
    mixHex = mixHex.replace('#', '');

    const r1 = parseInt(hex.substring(0, 2), 16);
    const g1 = parseInt(hex.substring(2, 4), 16);
    const b1 = parseInt(hex.substring(4, 6), 16);

    const r2 = parseInt(mixHex.substring(0, 2), 16);
    const g2 = parseInt(mixHex.substring(2, 4), 16);
    const b2 = parseInt(mixHex.substring(4, 6), 16);

    const r = Math.round(r1 * (1 - amount) + r2 * amount);
    const g = Math.round(g1 * (1 - amount) + g2 * amount);
    const b = Math.round(b1 * (1 - amount) + b2 * amount);

    return `rgb(${r}, ${g}, ${b})`;
}

function getTextColorForTemplate( template, neonColor) {
    switch (template) {
	case "nx-t1":return mixColor(neonColor,"#ffffff",0.85);
       case "nx-t2":return mixColor(neonColor,"#ffffff",0.2);
      case "nx-police":return"#ffffff";
              default:
            return "#ffffff";
    }
}

const neonEffects = {
    flicker: [1,1,1,1,1,1,1,1,0.5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.5,1,0.5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.05,1,1,1,1,1,1,0.05],
    starter: [1,1,1,0.05,0.05,0.05,0.05,1,0.05,1,1,1,1,0.05,1,0.05,1,1,1,0.05,0.05,0.05,0.05,0.05,1,1,0.05,1,0.05,1,1,1,1,0.05,0.05,0.05,0.05,0.05,0.05,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1,1,1,1,1,1,1,1,1,1,1],
    blink: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    crazy: [0.05,1,1,0.05,1,0.5,0.05,1,0.75,1,1,0.05,1,1,0.05,1,0.05,0.05,1,1,0.975,0.95,0.925,0.9,0.875,0.85,0.825,0.8,0.775,0.75,0.725,0.7,0.675,0.65,0.625,0.6,0.575,0.55,0.525,0.5,0.475,0.45,0.425,0.4,0.375,0.35,0.325,0.3,0.275,0.25,0.225,0.2,0.175,0.15,0.125,0.1,0.075,0.05,0.025],
    lantern: [0.01,0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.75,0.8,0.85,0.9,0.95,1,1,1,1,1,1,1,1,1,1,0.95,0.9,0.85,0.8,0.75,0.7,0.65,0.6,0.55,0.5,0.45,0.4,0.35,0.3,0.25,0.2,0.15,0.1,0.05,0.01,0,0,0,0,0,0,0,0,0,0]
};

const NeonRenderer = {
    settings: {
        intensity: 1,
        color: "#ff00a2",
        template: "nx-t1",
        effect: null,
        effectFrame: 0,
        animationId: null
    },

    setEffect: function(effectName) {
        if (effectName && neonEffects[effectName]) {
            this.settings.effect = effectName;
            this.settings.effectFrame = 0;
        } else {
            this.settings.effect = null;
        }
    },

    getCurrentIntensity: function() {
        let base = this.settings.intensity;
        if (this.settings.effect && neonEffects[this.settings.effect]) {
            const arr = neonEffects[this.settings.effect];
            const frame = this.settings.effectFrame % arr.length;
            return base * arr[frame];
        }
        return base;
    },

    getIntensityForFrame: function(frameIndex) {
        let base = this.settings.intensity;
        if (this.settings.effect && neonEffects[this.settings.effect]) {
            const arr = neonEffects[this.settings.effect];
            const idx = frameIndex % arr.length;
            return base * arr[idx];
        }
        return base;
    },

    startPreview: function(canvas, renderCallback) {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        let startTime = performance.now();
        const cycleMs = 5000;
        const totalFrames = 60;
        const animate = (now) => {
            let elapsed = now - startTime;
            let progress = (elapsed % cycleMs) / cycleMs;
            let frameIndex = Math.floor(progress * totalFrames) % totalFrames;
            this.settings.effectFrame = frameIndex;
            if (renderCallback) renderCallback();
            this.animationId = requestAnimationFrame(animate);
        };
        this.animationId = requestAnimationFrame(animate);
    },

    stopPreview: function() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    },

    drawBackground: function(ctx, img, w, h) {
        if (!img) return;
        const imgRatio = img.width / img.height;
        const targetRatio = w / h;
        let dw, dh, dx, dy;
        if (imgRatio > targetRatio) {
            dh = h;
            dw = img.width * (h / img.height);
            dx = (w - dw) / 2;
            dy = 0;
        } else {
            dw = w;
            dh = img.height * (w / img.width);
            dx = 0;
            dy = (h - dh) / 2;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
    },

    getShadowsForTemplate: function(templateName, fontSize, neonColor) {
        const emToPx = (em) => em * fontSize;

const policeColor =
    this.getPoliceColor();

        const t1Shadows = [
{
    x: 0.03,
    y: 0.03,
    blur: emToPx(0.01),
    color: "rgba(0,0,0,0.75)",
    stroke: true,
    // ضخامت تیوب سایه
    strokeWidth: 0.015,
    blend: "multiply"
},

 {x: 0, y: 0,
    blur: emToPx(0.05),
    color: hexToRgba(neonColor, 0.6),
    stroke: true,
    strokeWidth: 0.12,
    blend: "normal",
	pulse: true
},

{x: 0, y: 0,
    blur: emToPx(0.03),
    color: hexToRgba(neonColor, 0.5),
    stroke: true,
    strokeWidth: 0.075,
    blend: "screen",
	pulse: true
},

{x: 0, y: 0,
    blur: emToPx(0.015),
    color: hexToRgba(neonColor, 0.3),
    stroke: true,
    strokeWidth: 0.05,
    blend: "screen",
	pulse: true
},
        
	{ x: 0, y: 0, blur: emToPx(0.002), 
	color: mixColor(neonColor, "#ffffff", 0.2) 
	.replace("rgb(", "rgba(") .replace(")", ",0.7)"),	
	stroke: true,
	strokeWidth: 0.02,
	blend: "screen"
},
	{ x: 0, y: 0, blur: emToPx(0), 
	color: mixColor(neonColor, "#ffffff", 0.6) 
	.replace("rgb(", "rgba(") .replace(")", ",0.5)"),	
	stroke: true,
	strokeWidth: 0.01,
	blend: "normal"
},
         
{ x: 0, y: 0, blur: emToPx(0.5), color: "#ffffff" },
        ];

 const t2Shadows = [
        {
    x: 0.01,
    y: 0.01,
    blur: emToPx(0.01),
    color: "rgba(0,0,0,0.75)",
    stroke: true,
    // ضخامت تیوب سایه
    strokeWidth: 0.015,
    blend: "multiply"
},

 {x: 0, y: 0,
    blur: emToPx(0.02),
    color: hexToRgba(neonColor, 0.6),
    stroke: true,
    strokeWidth: 0.08,
    blend: "screen",
	pulse: true
},

{x: 0, y: 0,
    blur: emToPx(0.01),
    color: hexToRgba(neonColor, 0.5),
    stroke: true,
    strokeWidth: 0.035,
    blend: "screen",
	pulse: true
},

{x: 0, y: 0,
    blur: emToPx(0.01),
    color: hexToRgba(neonColor, 0.15),
    stroke: true,
    strokeWidth: 0.02,
    blend: "screen",
	pulse: true
},
        
	{ x: 0, y: 0, blur: emToPx(0.001), 
	color:  "#ffffff" 
	.replace("rgb(", "rgba(") .replace(")", ",0.7)"),	
	stroke: true,
	strokeWidth: 0.004,
	blend: "screen"
},
	{ x: 0, y: 0, blur: emToPx(0), 
	color: mixColor(neonColor, "#ffffff", 0.2) 
	.replace("rgb(", "rgba(") .replace(")", ",0.5)"),	
	stroke: true,
	strokeWidth: 0.002,
	blend: "normal"
},
         
{ x: 0, y: 0, blur: emToPx(0.5), color: "#ffffff" },
        ];

        switch (templateName) {
            case "nx-t1": return t1Shadows;
            case "nx-t2": return t2Shadows;
            case "nx-police": return t1Shadows;
            default: return t1Shadows;
        }
    },

    getPoliceColor: function() {
        if (this._policeStart === undefined) this._policeStart = performance.now();
        const elapsed = performance.now() - this._policeStart;
        const cycleMs = 2500; // 2.5 ثانیه
        const halfCycle = cycleMs / 2;
        const t = (elapsed % cycleMs);
        if (t < halfCycle) return "#ff0000";
        else return "#0000ff";
    },

    draw: function(ctx, text, style, intensity, width, height, progress = 0, backgroundImage = null) {
        if (!ctx) return;

        // پالس سراسری
        if (this._pulseStart === undefined) this._pulseStart = performance.now();
        const elapsed = performance.now() - this._pulseStart;
        const pulseCycle = 1250;
        const pulse = 1 + 0.3 * Math.sin(2 * Math.PI * (elapsed / pulseCycle));

        let baseIntensity = parseFloat(intensity);
        if (isNaN(baseIntensity)) baseIntensity = this.settings.intensity;
        baseIntensity = Math.min(2, Math.max(0, baseIntensity));

        ctx.clearRect(0, 0, width, height);
        if (backgroundImage) this.drawBackground(ctx, backgroundImage, width, height);

        ctx.save();
        ctx.globalAlpha = baseIntensity;

        const fontSize = parseFloat(style?.fontSize) || 120;
        const fontFamily = style?.fontFamily || "sans-serif";
        const lineHeight = parseFloat(style?.lineHeight) || 1.2;
        const textAlign = style?.textAlign || "center";
        const direction = style?.direction || "ltr";

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textBaseline = "middle";
        let effectiveAlign = textAlign;
        if (direction === "rtl") {
            if (textAlign === "left") effectiveAlign = "right";
            else if (textAlign === "right") effectiveAlign = "left";
        }
        ctx.textAlign = effectiveAlign;

        const lines = text.split("\n");
        const lineHeightPx = lineHeight * fontSize;
        const totalTextHeight = lines.length * lineHeightPx;
        const startY = (height / 2) - (totalTextHeight / 2) + (lineHeightPx / 2);
        let startX;
        switch (effectiveAlign) {
            case "left": startX = 0; break;
            case "right": startX = width; break;
            default: startX = width / 2; break;
        }

        let neonColor;
        if (this.settings.template === "nx-police") {
            neonColor = this.getPoliceColor();
        } else {
            neonColor = this.settings.color || "#00ffff";
        }

        const shadows =
    this.getShadowsForTemplate(
        this.settings.template,
        fontSize,
        neonColor
    );

const textColor =
    getTextColorForTemplate(
        this.settings.template,
        neonColor
    );

// =====================================
// DRAW LINES
// =====================================

for (let i = 0; i < lines.length; i++) {

    const line = lines[i];

    if (line === "") continue;

    const y =
        startY + i * lineHeightPx;

    // =================================
    // SHADOW LAYERS
    // =================================

    for (let sh of shadows) {

        ctx.save();

        // blend mode
        ctx.globalCompositeOperation =
            sh.blend || "source-over";

        // smooth corners
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        // =============================
        // STROKE
        // =============================

        if (sh.stroke) {

 let pulseFactor = 1;

if (sh.pulse) {

    pulseFactor =
        1 +
        Math.sin(
            performance.now() * 0.002
        ) * 0.1;
}

ctx.lineWidth =
    sh.strokeWidth *
    fontSize *
    pulseFactor;

            ctx.strokeStyle =
                sh.color;

            ctx.filter =
    `blur(${sh.blur * pulseFactor}px)`;

            ctx.strokeText(
    line,
    startX + (sh.x * fontSize),
    y + (sh.y * fontSize)
);
        }

        // =============================
        // NORMAL SHADOW
        // =============================

        else {

            ctx.shadowColor =
                sh.color;

            ctx.shadowBlur =
                sh.blur * pulse;

            ctx.shadowOffsetX =
                sh.x * fontSize;

            ctx.shadowOffsetY =
                sh.y * fontSize;

            ctx.fillStyle =
                "#ffffff";

            ctx.fillText(
                line,
                startX,
                y
            );
        }

        // reset filter
        ctx.filter = "none";

        ctx.restore();
    }

    // =================================
    // FINAL TEXT CORE
    // =================================

    ctx.save();

    ctx.globalCompositeOperation =
        "source-over";

    ctx.shadowColor =
        "transparent";

// ======================
// SOFT NEON CORE
// ======================

ctx.save();

// هسته نرم
ctx.fillStyle =
    textColor;

ctx.globalAlpha =
    0.7;

ctx.filter =
    "blur(2px)";

ctx.fillText(
    line,
    startX,
    y
);

// متن شارپ سفید
ctx.fillStyle =
    textColor;
ctx.globalAlpha =
    1;

ctx.filter =
    "none";

ctx.fillText(
    line,
    startX,
    y
);

ctx.restore();

// ======================
// SHARP WHITE CORE
// ======================

ctx.fillStyle =
    textColor;


ctx.filter =
    "blur(4px)";

ctx.globalAlpha =
    1;

ctx.fillText(
    line,
    startX,
    y
);

ctx.restore();

}

ctx.restore();

}

};

window.NeonRenderer = NeonRenderer;

function initColorPickerEventHandlers()
{
    document.addEventListener('mousemove', colorPickerPointerMove);
    document.addEventListener('touchmove', colorPickerPointerMove);

    document.addEventListener('mouseup', colorPickerPointerRelease);
    document.addEventListener('touchend', colorPickerPointerRelease);
    document.addEventListener('touchcancel', colorPickerPointerRelease);
    window.addEventListener('resize', () => {
        let picks = document.querySelectorAll(".color-picker");
        picks.forEach(colorPicker => {
            let circlePos = getPosAndCenter(colorPicker.querySelector(".color-circle"));
            renderHuePointer(colorPicker, circlePos, colorPicker.hue);
            renderValPointer(colorPicker, circlePos, colorPicker.hue, colorPicker.sat, colorPicker.lum);
        });
    });
}

function colorPickerPointerMove(e)
{
    let prevent = false
    let list = document.querySelectorAll(".color-hue-selecting");
    let click = getClickedXY(e);

    list.forEach(colorPicker => {
        updatePickerHue(click, colorPicker);
    });

    if(list.length > 0) prevent = true;

    list = document.querySelectorAll(".color-val-selecting");
    list.forEach(colorPicker => {
        updatePickerVal(click, colorPicker);
    });

    if(prevent || list.length > 0) e.preventDefault();
}

function colorPickerPointerRelease()
{
    let list = document.querySelectorAll(".color-picker");
    list.forEach(colorPicker => {
        colorPicker.classList.remove("color-hue-selecting");
        colorPicker.classList.remove("color-val-selecting");
    });
}

function createColorPicker(parent, onColorChange)
{
    let colorPicker = document.createElement('div');
    colorPicker.classList.add("color-picker");
    colorPicker.onColorChange = onColorChange;
    parent.appendChild(colorPicker);

    let hslCircle = document.createElement('div');
    hslCircle.classList.add("color-circle");
    colorPicker.appendChild(hslCircle);

    let triangle = document.createElement('div');
    triangle.classList.add("color-triangle");
    colorPicker.appendChild(triangle);

    let pointer = document.createElement('div');
    pointer.classList.add("pointer-dot", "hue-pointer");
    colorPicker.appendChild(pointer);

    pointer = document.createElement('div');
    pointer.classList.add("pointer-dot", "val-pointer");
    colorPicker.appendChild(pointer);

    let pressHandler = e => {
        if(e.target == hslCircle)
        {
            e.preventDefault();
            colorPicker.classList.add("color-hue-selecting");
            updatePickerHue(getClickedXY(e), colorPicker);
        }
        else if(e.target == triangle)
        {
            e.preventDefault();
            colorPicker.classList.add("color-val-selecting");
            updatePickerVal(getClickedXY(e), colorPicker);
        }
    }

    colorPicker.onmousedown = pressHandler;
    colorPicker.ontouchstart = pressHandler;
    
    colorPicker.hue = 0;
    colorPicker.sat = 1;
    colorPicker.lum = 0.2;
}

function updatePickerHue(e, colorPicker)
{
    let circlePos = getPosAndCenter(colorPicker.querySelector(".color-circle"));
    let dX = e.x - circlePos.cX;
    let dY = e.y - circlePos.cY;
    let l = Math.sqrt(dX * dX + dY * dY);
    let radRotate = Math.acos(-dY/l);

    if(dX < 0) radRotate = Math.PI*2 - radRotate;

    if(colorPicker.hue != radRotate)
    {
        colorPicker.hue = radRotate;
        renderHuePointer(colorPicker, circlePos, radRotate);
        renderValPointer(colorPicker, circlePos, radRotate, colorPicker.sat, colorPicker.lum);
        colorPicker.onColorChange();
    }
}

function updatePickerVal(e, colorPicker)
{
    let circlePos = getPosAndCenter(colorPicker.querySelector(".color-circle"));
    let radRotate = colorPicker.hue;
    let rotCos = Math.cos(radRotate);
    let rotSin = Math.sin(radRotate);
    let rawX = e.x - circlePos.cX;
    let rawY = e.y - circlePos.cY;
    let rotatedXY = rotateXY(rawX, rawY, rotCos, rotSin);
    let dX = rotatedXY.x;
    let dY = rotatedXY.y;
    let rot = Math.PI*2/3;
    rotCos = Math.cos(rot);
    rotSin = Math.sin(rot);

    dY = limitTriangleBottom(dY, circlePos);
    rotatedXY = rotateXY(dX, dY, rotCos, rotSin);
    rotatedXY.y = limitTriangleBottom(rotatedXY.y, circlePos);
    rotatedXY = rotateXY(rotatedXY.x, rotatedXY.y, rotCos, rotSin);
    rotatedXY.y = limitTriangleBottom(rotatedXY.y, circlePos);
    rotatedXY = rotateXY(rotatedXY.x, rotatedXY.y, rotCos, rotSin);
    dX = rotatedXY.x;
    dY = rotatedXY.y;

    let satL = circlePos.relCY*0.71;
    let lumL = circlePos.relCX*0.8;
    let sat = 0.32 - dY/satL;
    let lum = 0.5 - dX/lumL;
    lum = lum > 1 ? 1 : lum < 0 ? 0 : lum;

    if(sat < 0) sat = 0;
    else if(sat > 1)
    {
        sat = 1;

        if(dY < 0) lum = 0.5;
    }
    else
    {
        let satMod = 2 - lum*2;
        satMod = satMod > 1 ? 2 - satMod : satMod;
    
        if(satMod)
        {
            sat /= satMod;
            sat = sat > 1 ? 1 : sat < 0 ? 0 : sat;
        }
        else sat = 1;
    }

    if(colorPicker.sat != sat || colorPicker.lum != lum)
    {
        colorPicker.sat = sat;
        colorPicker.lum = lum;
        renderValPointer(colorPicker, circlePos, radRotate, sat, lum);
        colorPicker.onColorChange();
    }
}

function renderHuePointer(colorPicker, circlePos, radRotate)
{
    let triangle = colorPicker.querySelector(".color-triangle");
    let huePointer = colorPicker.querySelector(".hue-pointer");
    let rotate = radRotate/Math.PI*180;

    triangle.style.setProperty("--var-cur-color", "hsl(" + rotate + ", 100%, 50%)");
    triangle.style.transform = "rotate(" + (rotate - 90) + "deg)";

    let pointerTop = circlePos.relCY - Math.cos(radRotate)*(circlePos.relCY*0.87);
    let pointerLeft = circlePos.relCX + Math.sin(radRotate)*(circlePos.relCX*0.87);
    huePointer.style.top = "calc(" + pointerTop + "px - " + "var(--var-pointer-size)/2)";
    huePointer.style.left = "calc(" + pointerLeft + "px - " + "var(--var-pointer-size)/2)";
}

function renderValPointer(colorPicker, circlePos, radRotate, sat, lum)
{
    let valPointer = colorPicker.querySelector(".val-pointer");

    let lumScale = lum*0.8 - 0.4;
    let lumTop = -Math.sin(radRotate)*(circlePos.relCY*lumScale);
    let lumLeft = Math.cos(radRotate)*(circlePos.relCX*lumScale);

    let satMod = 2 - lum*2;
    satMod = satMod > 1 ? 2 - satMod : satMod;
    let satScale = sat*0.71*satMod - 0.23;
    let satTop = Math.cos(radRotate)*(circlePos.relCY*satScale);
    let satLeft = Math.sin(radRotate)*(circlePos.relCX*satScale);

    let pointerTop = circlePos.relCY - satTop + lumTop;
    let pointerLeft = circlePos.relCX + satLeft - lumLeft;

    valPointer.style.top = "calc(" + pointerTop + "px - " + "var(--var-pointer-size)/2)";
    valPointer.style.left = "calc(" + pointerLeft + "px - " + "var(--var-pointer-size)/2)";
}

function limitTriangleBottom(y, circlePos)
{
    let limit = circlePos.relCY*0.235;
    return y > limit ? limit : y;
}

function HSLToRGB(h, s, l) {
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    let r = 255 * f(0);
    let g = 255 * f(8);
    let b = 255 * f(4);
    return {r: Math.round(r), g: Math.round(g), b: Math.round(b)};
}
function createControlStrobo(configItem, paramContainer)
{
    let callback = throttle(() => sendEffectStrobo(configItem, getStripMask(configItem)));
    let magicButton = createMagicButton("ON", "OFF", true, stat => {
        if(stat) sendEffectStrobo(configItem, getStripMask(configItem));
        else delEffect(getStripMask(configItem));
    });
    magicButton.style.marginTop = "1.6em";
    magicButton.style.marginBottom = "2.2em";
    magicButton.style.width = "6em";
    createColorPicker(paramContainer, () => {
        let clr = getColor(configItem);
        magicButton.style.setProperty("--var-button-color", "hsl(" + clr.hue + "deg, " + (clr.sat*100) + "%, " + (clr.lum*100) + "%)");
        buttonToggleON(magicButton);
        callback();
    });

    let period = document.createElement('div');
    period.classList.add("period");
    period.innerHTML = "Periódus idő: 500ms";
    period.value = 500;
    period.style.marginTop = ".8em";
    period.style.marginBottom = ".6em";
    paramContainer.appendChild(period);
    createSlider(paramContainer, slider => {
        let last = period.value;
        period.value = Math.floor(Math.pow(slider.valStart*34, 1.5) + 2)*5;
        period.innerHTML = "Periódus idő: " + period.value + "ms";
        buttonToggleON(magicButton);

        if(last != period.value) callback();
    }, Math.pow((490/5), 1/1.5)/34);

    let duty = document.createElement('div');
    duty.classList.add("duty");
    duty.innerHTML = "Kitöltési tényező: 50%";
    duty.value = .5;
    duty.style.marginTop = "1em";
    duty.style.marginBottom = ".6em";
    paramContainer.appendChild(duty);
    createSlider(paramContainer, slider => {
        let last = duty.value;
        duty.value = slider.valStart;
        duty.innerHTML = "Kitöltési tényező: " + Math.floor(duty.value*100) + "%";
        buttonToggleON(magicButton);

        if(last != duty.value) callback();
    }, .5);
    paramContainer.appendChild(magicButton);
    callback();
}

function createControlRunLight(configItem, paramContainer)
{
    let label = document.createElement('div');
    label.innerHTML = '<div>Futófény színei:</div><div style="font-size:84%">(első szín: alsó frek. ... utolsó szín: felső frek.)</div>';
    label.style.marginBottom = ".8em";
    paramContainer.appendChild(label);
    spectrumColorIniEmptyFeedbacks(paramContainer);
    createColorPicker(paramContainer, () => {
        let clr = getColor(configItem);
        let active = paramContainer.querySelector(".selected-color-indicator");
        active.style.background = "hsl(" + clr.hue + "deg, " + (clr.sat*100) + "%, " + (clr.lum*100) + "%)";
    });

    let labelRL = document.createElement('div');
    labelRL.style.marginTop = "1em";
    createAudioSelect(labelRL, () => {});
    paramContainer.appendChild(labelRL);

    let start = document.createElement('div');
    start.innerHTML = "Alsó frek.: 0Hz";
    start.style.marginTop = ".8em";
    start.style.marginBottom = 0;
    paramContainer.appendChild(start);

    let end = document.createElement('div');
    end.innerHTML = "Felső frek.: " + (Math.pow(.2, 2.4)*freqStep*1024).toLocaleString(undefined, {maximumFractionDigits: 0}) + "Hz";
    end.style.marginTop = ".2em";
    end.style.marginBottom = ".6em";
    paramContainer.appendChild(end);
    createDoubleSlider(paramContainer, slider => {
        start.innerHTML = "Alsó frek.: " + (Math.pow(slider.valStart, 2.4)*freqStep*1024).toLocaleString(undefined, {maximumFractionDigits: 0}) + "Hz";
        end.innerHTML = "Felső frek.: " + (Math.pow(slider.valEnd, 2.4)*freqStep*1024).toLocaleString(undefined, {maximumFractionDigits: 0}) + "Hz";
    }, 0, .2);

    let speed = document.createElement('div');
    speed.innerHTML = "Sebesség: 0,2 LED/sec";
    speed.style.marginTop = "1em";
    speed.style.marginBottom = ".6em";
    paramContainer.appendChild(speed);
    createSlider(paramContainer, slider => {
        speed.innerHTML = "Sebesség: " + (slider.valStart*9.8 + .2).toLocaleString(undefined, {maximumFractionDigits: 2}) + " LED/sec";
    });

    let decay = document.createElement('div');
    decay.innerHTML = "Lecsengési idő: 10ms";
    decay.style.marginTop = "1em";
    decay.style.marginBottom = ".6em";
    paramContainer.appendChild(decay);
    createSlider(paramContainer, slider => {
        decay.innerHTML = "Lecsengési idő: " + Math.floor(Math.pow(slider.valStart*42, 1.785) + 10) + "ms";
    });
}

function createControlSpektrum(configItem, paramContainer)
{
    let callback = throttle(() => sendEffectSpektrum(configItem, getStripMask(configItem)));
    let colorCallback = throttle(() => sendEffectSpektrumColor(configItem, getStripMask(configItem)));
    let label = document.createElement('div');
    label.innerHTML = '<div>Spektrum színei:</div><div style="font-size:84%">(első szín: alacsony frek. ... utolsó szín: magas frek.)</div>';
    label.style.marginBottom = ".8em";
    paramContainer.appendChild(label);
    spectrumColorIniEmptyFeedbacks(paramContainer);
    createColorPicker(paramContainer, () => {
        let clr = getColor(configItem);
        let active = paramContainer.querySelector(".selected-color-indicator");
        active.style.background = "hsl(" + clr.hue + "deg, " + (clr.sat*100) + "%, " + (clr.lum*100) + "%)";
        active.hue = clr.hue;
        active.sat = clr.sat;
        active.lum = clr.lum;
        colorCallback();
    });

    let labelRL = document.createElement('div');
    labelRL.style.marginTop = "1em";
    createAudioSelect(labelRL, callback);
    paramContainer.appendChild(labelRL);

    let intensity = document.createElement('div');
    intensity.classList.add("intensity");
    intensity.innerHTML = "Érzékenység: 0%";
    intensity.value = 0;
    intensity.style.marginTop = "1em";
    intensity.style.marginBottom = ".6em";
    paramContainer.appendChild(intensity);
    createSlider(paramContainer, slider => {
        let last = intensity.value;
        intensity.value = slider.valStart;
        intensity.innerHTML = "Érzékenység: " + Math.floor(intensity.value*100) + "%";

        if(last != intensity.value) callback();
    });

    let delay = document.createElement('div');
    delay.classList.add("delay");
    delay.innerHTML = "Megtartási idő: 0ms";
    delay.value = 0;
    delay.style.marginTop = "1em";
    delay.style.marginBottom = ".6em";
    paramContainer.appendChild(delay);
    createSlider(paramContainer, slider => {
        let last = delay.value;
        delay.value = Math.floor(Math.pow(slider.valStart*34, 1.502))*5;
        delay.innerHTML = "Megtartási idő: " + delay.value + "ms";

        if(last != delay.value) callback();
    });

    let decay = document.createElement('div');
    decay.classList.add("decay");
    decay.innerHTML = "Lecsengési idő: 0ms";
    decay.value = 0;
    decay.style.marginTop = "1em";
    decay.style.marginBottom = ".6em";
    paramContainer.appendChild(decay);
    createSlider(paramContainer, slider => {
        let last = decay.value;
        decay.value = Math.floor(Math.pow(slider.valStart*34, 1.502))*5;
        decay.innerHTML = "Lecsengési idő: " + decay.value + "ms";

        if(last != decay.value) callback();
    });
    callback();
    colorCallback();
}

function spectrumColorIniEmptyFeedbacks(paramContainer)
{
    for(let i = 0; i < 8; i++)
    {
        let indicator = document.createElement('div');
        indicator.index = i;
        indicator.onclick = () => buildSpectrumColorFeedback(indicator, paramContainer);
        indicator.classList.add("color-indicator");
        indicator.innerHTML = "&nbsp";

        if(i == 0)
        {
            first = false;
            indicator.classList.add("selected-color-indicator");
            indicator.style.background = "hsl(0deg, 100%, 50%)";
            indicator.hue = 0;
            indicator.sat = 1;
            indicator.lum = .5;
        }
        else if(i == 1)
        {
            indicator.classList.add("new-color-indicator");
            indicator.innerHTML = null;
            let tmp = document.createElement('div');
            tmp.innerHTML = "+";
            indicator.appendChild(tmp);
        }
        else indicator.classList.add("disabled-color-indicator");

        paramContainer.appendChild(indicator);
    }
}

function buildSpectrumColorFeedback(e, paramContainer)
{
    if(e.classList.contains("disabled-color-indicator"))
    {
        let list = paramContainer.querySelectorAll(".color-indicator");

        for(tmp of list)
        {
            if(tmp.classList.contains("new-color-indicator"))
            {
                spectrumColorFeedbackCreateNew(tmp, paramContainer);
                break;
            }
        }
    }
    else if(e.classList.contains("new-color-indicator"))
    {
        spectrumColorFeedbackCreateNew(e, paramContainer);
    }
    else
    {
        paramContainer.querySelector(".selected-color-indicator").classList.remove("selected-color-indicator");
        e.classList.add("selected-color-indicator");
        
        let colorPicker = paramContainer.querySelector(".color-picker");
        let circlePos = getPosAndCenter(colorPicker.querySelector(".color-circle"));
        colorPicker.hue = e.hue/180*Math.PI;
        colorPicker.sat = e.sat;
        colorPicker.lum = e.lum;
        renderHuePointer(colorPicker, circlePos, colorPicker.hue);
        renderValPointer(colorPicker, circlePos, colorPicker.hue, colorPicker.sat, colorPicker.lum);
    }
}

function spectrumColorFeedbackCreateNew(indicator, paramContainer)
{
    indicator.innerHTML = "&nbsp";
    indicator.classList.remove("new-color-indicator");
    let cur = paramContainer.querySelector(".selected-color-indicator");
    indicator.style.background = cur.style.background;
    indicator.hue = cur.hue;
    indicator.sat = cur.sat;
    indicator.lum = cur.lum;
    cur.classList.remove("selected-color-indicator");
    indicator.classList.add("selected-color-indicator");
    let next = indicator.nextElementSibling;

    if(next != null && next.classList.contains("color-indicator"))
    {
        next.classList.remove("disabled-color-indicator");
        next.classList.add("new-color-indicator");
        next.innerHTML = null;
        let tmp = document.createElement('div');
        tmp.innerHTML = "+";
        next.appendChild(tmp);
    }
}

function createControlSoundMeter(configItem, paramContainer)
{
    createColorPicker(paramContainer, () => {

    });

    let labelRL = document.createElement('div');
    labelRL.style.marginTop = "1em";
    createAudioSelect(labelRL, () => {});
    paramContainer.appendChild(labelRL);

    let labelMirror = document.createElement('div');
    labelMirror.style.marginTop = ".6em";
    labelMirror.style.marginBottom = ".6em";
    labelMirror.innerHTML = "Tükrözés:&nbsp<select style='margin-left: .2em; min-width:10em'><option>nincs</option><option>egyszeres</option><option>egyszeres fordítva</option><option>kétszeres</option><option>kétszeres fordítva</option></select>";
    paramContainer.appendChild(labelMirror);
}

function createControlColor(configItem, paramContainer)
{
    let callback = throttle(() => sendEffectColor(configItem, getStripMask(configItem)));
    createColorPicker(paramContainer, callback);
    callback();
}

function sendEffectSpektrumColor(configItem, stripMask)
{
    let active = configItem.querySelector(".selected-color-indicator");
    let clr = getColor(configItem);
    let rgb = HSLToRGB(clr.hue, clr.sat, clr.lum);
    fetchJsonPost(
        {
            packet: "setEffectSpektrumColor",
            lineMask: stripMask,
            index: active.index,
            r: rgb.r,
            g: rgb.g,
            b: rgb.b
        }
    );
}

function sendEffectSpektrum(configItem, stripMask)
{
    let delay = configItem.querySelector(".delay");
    let decay = configItem.querySelector(".decay");
    let intensity = configItem.querySelector(".intensity");
    let isRightAudio = configItem.querySelector(".isRightAudio");
    let intensityVal = (1 - intensity.value)*255;
    fetchJsonPost(
        {
            packet: "setEffectSpektrum",
            lineMask: stripMask,
            delay: delay.value,
            decay: decay.value,
            intensity: Math.floor(intensityVal),
            isRightAudio: isRightAudio.value
        }
    );
}

function sendEffectStrobo(configItem, stripMask)
{
    let period = configItem.querySelector(".period");
    let duty = configItem.querySelector(".duty");
    let dutyVal = duty.value*255;
    let clr = getColor(configItem);
    let rgb = HSLToRGB(clr.hue, clr.sat, clr.lum);
    fetchJsonPost(
        {
            packet: "setEffectStrobo",
            lineMask: stripMask,
            r: rgb.r,
            g: rgb.g,
            b: rgb.b,
            period: period.value,
            duty: Math.floor(dutyVal)
        }
    );
}

function sendEffectColor(configItem, stripMask)
{
    let clr = getColor(configItem);
    let rgb = HSLToRGB(clr.hue, clr.sat, clr.lum);
    fetchJsonPost(
        {
            packet: "setEffectColor",
            lineMask: stripMask,
            r: rgb.r,
            g: rgb.g,
            b: rgb.b
        }
    );
}

function delEffect(stripMask)
{
    fetchJsonPost(
        {
            packet: "delEffect",
            lineMask: stripMask
        }
    );
}
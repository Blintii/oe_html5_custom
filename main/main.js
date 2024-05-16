const URLedit = "/edit";
const stripList = ["L magas", "R magas", "L közép", "R közép", "L mély", "R mély", "L széle", "R széle"];
const effectList = ["szín", "hangerő futófény", "spektrum", "spektrum futófény", "stroboszkóp"];
let usedStrips = [];
let createTile;
let freqStep = 24;
window.onload = onPageLoaded;

function onPageLoaded()
{
    checkCanShowingCreateTile();

    const HCLK = 216; //Mhz
    const prescaler = 2;
    const resolution = 12;
    const sampling_time = 56;
    let freq = (216 * 1000000)/16; //PCLK2
    freq /= prescaler; //ADC cycle
    freq /= (resolution + sampling_time) * 2;
    addInfoData("info-freq", freq.toLocaleString(undefined, {maximumFractionDigits: 2}) + " Hz");

    fetchJsonPost({packet: "SampleNbr"})
    .then(response => response.json())
    .then(data =>
        {
            if(data.N > 1)
            {
                addInfoData("info-sampleNbr", data.N);
                freqStep = freq / data.N;
                addInfoData("info-freqStep", freqStep.toLocaleString(undefined, {maximumFractionDigits: 2}) + " Hz");
            }
            else
            {
                addInfoData("info-sampleNbr", "N/A");
                addInfoData("info-freqStep", "N/A");
            }
        }
    )
    .catch(error =>
        {
            addInfoData("info-sampleNbr", "N/A");
            addInfoData("info-freqStep", "N/A");
        }
    );

    loadGlobalSettings();
    initColorPickerEventHandlers();
    initSliderEventHandlers();
    window.addEventListener('resize', () => {
        let containers = document.querySelectorAll(".param-container");
        containers.forEach(container => {
            let parent = container.parentElement;
            parent.style.maxHeight = parent.scrollHeight + "px";
        });
    });
}

function addInfoData(id, data)
{
    document.getElementById(id).innerText += " " + data;
}

function loadGlobalSettings()
{
    let global_settings = document.getElementById("global-settings");
    let rgb_order = document.createElement("div");
    rgb_order.classList.add("checkbox-list", "radiobtn");
    let rgb_order_rgb = document.createElement("div");
    rgb_order_rgb.innerHTML = "RGB";
    rgb_order_rgb.style.marginRight = "2em";
    rgb_order_rgb.onclick = () => onClickRadioList(rgb_order, rgb_order_rgb, () => sendColorOrder(1));
    let rgb_order_grb = document.createElement("div");
    rgb_order_grb.innerHTML = "GRB";
    rgb_order_grb.classList.add("checkedItem");
    rgb_order_grb.onclick = () => onClickRadioList(rgb_order, rgb_order_grb, () => sendColorOrder(0));
    rgb_order.appendChild(rgb_order_rgb);
    rgb_order.appendChild(rgb_order_grb);
    global_settings.appendChild(rgb_order);

    let fade_label = document.createElement("div");
    fade_label.innerHTML = "Áttűnés: 500ms";
    fade_label.value = 500;
    fade_label.style.marginTop = ".6em";
    global_settings.appendChild(fade_label);
    let callbackFade = throttle(() => sendGlobalFade(fade_label.value));
    createSlider(global_settings, slider => {
        let last = fade_label.value;
        fade_label.value = Math.pow(slider.valStart*35, 1.748).toFixed(0)*5;
        fade_label.innerHTML = "Áttűnés: " + fade_label.value + "ms";

        if(last != fade_label.value) callbackFade();
    }, Math.pow((500/5), 1/1.748)/35);
}

function sendGlobalFade(fadeTime)
{
    fetchJsonPost(
        {
            packet: "setGlobalFade",
            fadeTime: fadeTime
        }
    );
}

function sendColorOrder(order)
{
    fetchJsonPost(
        {
            packet: "setColorOrder",
            order: order
        }
    );
}

function checkCanShowingCreateTile()
{
    if(usedStrips.length < stripList.length) showCreateTile()
    else closeCreateTile();
}

function showCreateTile()
{
    if(createTile == null)
    {
        createTile = document.createElement("div");
        createTile.id = "config-create";
        createTile.classList.add("config-item");
        createTile.innerHTML = "<div>+</div><div>új létrehozása</div>";
        createTile.onclick = onClickCreateTile;
    }

    document.getElementById("config-container").appendChild(createTile);
}

function closeCreateTile()
{
    if(createTile != null)
    {
        if(createTile.parentElement != null) createTile.parentElement.removeChild(createTile);
    }
}

function onClickCreateTile()
{
    createTile.id = null;
    createTile.innerHTML = null;
    createTile.onclick = null;
    createGroupStrip(createTile);
    createTile = null;
}

function onClickRadioList(parent, selItem, callback)
{
    if(hasTag(selItem, "checkedItem")) return;

    parent.querySelectorAll(".checkedItem").forEach(item => item.classList.remove("checkedItem"));
    selItem.classList.add("checkedItem");
    callback();
}

function getPosAndCenter(div)
{
    let boundingBox = div.getBoundingClientRect();
    let relCX = boundingBox.width/2;
    let relCY = boundingBox.height/2;
    let cX = boundingBox.x + relCX;
    let cY = boundingBox.y + relCY;

    return {
        x: boundingBox.x,
        y: boundingBox.y,
        cX: cX,
        cY: cY,
        relCX: relCX,
        relCY: relCY
    };
}

function rotateXY(x, y, cos, sin)
{
    let rX = x*cos + y*sin;
    let rY = y*cos - x*sin;
    return {x: rX, y: rY};
}

function getClickedXY(e)
{
    if(e instanceof MouseEvent) return {x: e.clientX, y: e.clientY};
    else if(e instanceof TouchEvent) return {x: e.changedTouches.item(0).clientX, y: e.changedTouches.item(0).clientY};
}

function fetchJsonPost(bodyJson)
{
    return fetch(URLedit, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(bodyJson)
    });
}

function delFromArray(array, e)
{
    let i = array.indexOf(e);

    if(i >= 0) array.splice(i, 1);
}

function hasTag(dom, tag)
{
    return dom.classList.contains(tag);
}

function throttle(callback, delay = 90)
{
    let shouldWait = false;
    let waitingArgs;

    const timeoutFunc = () => {
        if(waitingArgs == null) shouldWait = false;
        else
        {
            callback(...waitingArgs);
            waitingArgs = null;
            setTimeout(timeoutFunc, delay);
        }
    }

    return(...args) => {
        if(shouldWait)
        {
            waitingArgs = args;
            return;
        }
    
        callback(...args);
        shouldWait = true;
        setTimeout(timeoutFunc, delay);
    }
}
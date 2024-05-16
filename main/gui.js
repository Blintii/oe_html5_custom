function createGroupStrip(parent)
{
    let headDiv = createSettingHeader(parent, "Szakasz");
    let listDiv = createSettingContent(parent);
    listDiv.classList.add("checkbox-list", "usedStrips-container", "new-item", "firstUse");

    for(let i = 0; i < stripList.length; i++)
    {
        let tmpDiv = document.createElement('div');
        tmpDiv.onclick = () => onClickStrip(tmpDiv);
        tmpDiv.innerHTML = stripList[i];

        if(usedStrips.indexOf(stripList[i]) >= 0) tmpDiv.classList.add("checkedItem", "disabled-item");

        listDiv.appendChild(tmpDiv);
    }

    animateShowNewItem(headDiv, listDiv);
}

function createGroupEffect(parent)
{
    let headDiv = createSettingHeader(parent, "Effekt");
    setCollapsable(headDiv);
    let settingContainer = createSettingContent(parent);
    settingContainer.classList.add("new-item");

    let selectList = document.createElement('select');
    selectList.classList.add("effect-type");
    selectList.onchange = () => onUpdateEffect(parent, selectList);
    settingContainer.appendChild(selectList);

    let paramContainer = document.createElement('div');
    paramContainer.classList.add("param-container");
    settingContainer.appendChild(paramContainer);

    for(let i = 0; i < effectList.length; i++)
    {
        let tmpDiv = document.createElement('option');
        tmpDiv.value = i;
        tmpDiv.innerHTML = effectList[i];
        selectList.appendChild(tmpDiv);
    }

    animateShowNewItem(headDiv, settingContainer);
}

function onClickStrip(selStrip)
{
    let hasCheckedTag = hasTag(selStrip, "checkedItem");

    if(hasTag(selStrip, "disabled-item")) return;

    if(hasCheckedTag) delFromArray(usedStrips, selStrip.innerHTML);
    else usedStrips.push(selStrip.innerHTML);

    let isFirst = checkFirstClickStrip(selStrip.parentElement);

    let configs = document.querySelectorAll(".usedStrips-container");
    let forceClose = false;

    configs.forEach(container => {
        let sameConfig = selStrip.parentElement == container;
        let stripStat = updateStripList(container, selStrip, hasCheckedTag, sameConfig);

        if(stripStat.curUsedStrips == 0) forceClose = true;

        if(sameConfig)
        {
            if(stripStat.stripMaskRemoved) delEffect(stripStat.stripMaskRemoved);
            else
            {
                if(isFirst) onUpdateEffect(container.parentElement, container.parentElement.querySelector(".effect-type"));
                else sendEffectSettings(container.parentElement, stripStat.stripMaskUsed);
            }
        }
    });

    if(forceClose) closeCreateTile();
    else checkCanShowingCreateTile();
}

function checkFirstClickStrip(container)
{
    if(container.classList.contains("firstUse"))
    {
        container.classList.remove("firstUse");
        setCollapsable(container.previousElementSibling);
        createGroupEffect(container.parentElement);
        return true;
    }
    else return false;
}

function updateStripList(container, e, hasCheckedTag, sameConfig)
{
    let curUsedStrips = 0;
    let stripMaskRemoved = 0;
    let stripMaskUsed = 0;
    let curMask = 1;
    
    for(dom of container.children)
    {
        if(dom.innerHTML == e.innerHTML)
        {
            if(hasCheckedTag)
            {
                dom.classList.remove("checkedItem");
                stripMaskRemoved = curMask;

                if(!sameConfig) dom.classList.remove("disabled-item");

            }
            else
            {
                dom.classList.add("checkedItem");

                if(!sameConfig) dom.classList.add("disabled-item");
            }
        }

        if(!hasTag(dom, "disabled-item") && hasTag(dom, "checkedItem"))
        {
            curUsedStrips++;
            stripMaskUsed |= curMask;
        }

        curMask <<= 1;
    }

    if(sameConfig) container.stripMaskUsed = stripMaskUsed;

    return {curUsedStrips: curUsedStrips, stripMaskRemoved: stripMaskRemoved, stripMaskUsed: stripMaskUsed};
}

function onUpdateEffect(configItem, selectList)
{
    let paramContainerList = configItem.getElementsByClassName("param-container");
    let paramContainer = paramContainerList[0];
    paramContainer.innerHTML = null;

    switch(selectList.value)
    {
        case '4':   //strobo
            createControlStrobo(configItem, paramContainer);
            break;
        case '3':   //spektrum futófény
            createControlRunLight(configItem, paramContainer);
            break;
        case '2':   //spektrum
            createControlSpektrum(configItem, paramContainer);
            break;
        case '1':   //hangerő futófény
            createControlSoundMeter(configItem, paramContainer);
            break;
        default:    //szín
            createControlColor(configItem, paramContainer);
            break;
    }

    let parent = paramContainer.parentElement;
    parent.style.maxHeight = parent.scrollHeight + "px";
}

function sendEffectSettings(configItem, stripMaskUsed)
{
    let selectList = configItem.querySelector(".effect-type");

    switch(selectList.value)
    {
        case '4':   //strobo
            sendEffectStrobo(configItem, stripMaskUsed);
            break;
        case '3':   //spektrum futófény
            {
                break;
            }
        case '2':   //spektrum
            sendEffectSpektrum(configItem, stripMaskUsed);
            sendEffectSpektrumColor(configItem, stripMaskUsed);
            break;
        case '1':   //hangerő futófény
            {
                break;
            }
        default:    //szín
            sendEffectColor(configItem, stripMaskUsed);
            break;
    }
}

function getColor(configItem)
{
    let colorPicker = configItem.querySelector(".color-picker");
    return {hue: colorPicker.hue/Math.PI*180, sat: colorPicker.sat, lum: colorPicker.lum};
}

function getStripMask(configItem)
{
    let container = configItem.querySelector(".usedStrips-container");
    return container.stripMaskUsed;
}

function createAudioSelect(parent, callback)
{
    parent.style.display = "flex";
    let label = document.createElement('p');
    label.innerHTML = "Hangsáv:";
    label.style.display = "inline-block";
    label.style.marginRight = ".5em";
    parent.appendChild(label);

    let list = document.createElement('div');
    list.classList.add("isRightAudio", "checkbox-list", "radiobtn");
    list.value = 0;
    let left = document.createElement('div');
    left.innerHTML = "L - bal";
    left.classList.add("checkedItem");
    left.style.marginRight = "2em";
    left.onclick = () => onClickRadioList(list, left, () => {
        list.value = 0;
        callback();
    });
    list.appendChild(left);
    let right = document.createElement('div');
    right.innerHTML = "R - jobb";
    right.onclick = () => onClickRadioList(list, right, () => {
        list.value = 1;
        callback();
    });
    list.appendChild(right);
    parent.appendChild(list);
}

function createMagicButton(strON, strOFF, defaultON, onButtonToggle)
{
    let btn = document.createElement('div');
    btn.strON = strON;
    btn.strOFF = strOFF;
    btn.classList.add("magic-button");
    btn.onclick = () => {
        if(btn.classList.contains("button-toggled-on"))
        {
            buttonToggleOFF(btn);
            onButtonToggle(false);
        }
        else
        {
            buttonToggleON(btn);
            onButtonToggle(true);
        }
    };

    if(defaultON) buttonToggleON(btn);

    return btn;
}

function buttonToggleON(btn)
{
    btn.classList.add("button-toggled-on");
    btn.innerHTML = btn.strON;
}

function buttonToggleOFF(btn)
{
    btn.classList.remove("button-toggled-on");
    btn.innerHTML = btn.strOFF;
}

function createSettingHeader(parent, name)
{
    let headDiv = createSettingContent(parent);
    headDiv.innerHTML = name;
    headDiv.classList.add("settings-header", "new-item");
    return headDiv;
}

function createSettingContent(parent)
{
    let div = document.createElement('div');
    div.style.maxHeight = 0;
    parent.appendChild(div);
    return div;
}

function animateShowNewItem(...divs)
{
    requestAnimationFrame(() => {
        for(let i = 0; i < divs.length; i++)
        {
            let div = divs[i];
            div.classList.remove("new-item");
            div.style.maxHeight = div.scrollHeight + "px";
        }
    });
}

function setCollapsable(head)
{
    head.classList.add("collapsible-header");
    head.onclick = () => collapse(head);
}

function collapse(head)
{
    let content = head.nextElementSibling;
    
    if(head.classList.toggle("collapsed"))
    {
        content.style.maxHeight = 0;
    }
    else
    {
        content.style.maxHeight = content.scrollHeight + "px";
    }
}
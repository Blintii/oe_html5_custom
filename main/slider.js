function initSliderEventHandlers()
{
    document.addEventListener('mousemove', sliderPointerMove);
    document.addEventListener('touchmove', sliderPointerMove);

    document.addEventListener('mouseup', sliderPointerRelease);
    document.addEventListener('touchend', sliderPointerRelease);
    document.addEventListener('touchcancel', sliderPointerRelease);
}

function createSlider(parent, onChangeVal, valStart = 0)
{
    let slider = document.createElement('div');
    slider.classList.add("slider");
    parent.appendChild(slider);
    let dot = document.createElement('div');
    dot.classList.add("slider-dot", "slider-start");
    slider.appendChild(dot);

    let pressHandler = e => {
        e.preventDefault();
        dot.classList.add("active-slider");
        sliderUpdateVal(getClickedXY(e), slider);
    }

    slider.onmousedown = pressHandler;
    slider.ontouchstart = pressHandler;
    slider.onChangeVal = () => onChangeVal(slider);
    slider.valStart = valStart;
    slider.style.setProperty("--var-slider-start", valStart);
    return slider;
}

function createDoubleSlider(parent, onChangeVal, valStart = 0, valEnd = .5)
{
    let slider = createSlider(parent, onChangeVal, valStart);
    slider.valEnd = valEnd;
    slider.style.setProperty("--var-slider-end", valEnd);
    let dot = document.createElement('div');
    dot.classList.add("slider-dot", "slider-end");
    slider.appendChild(dot);
    let fill = document.createElement('div');
    fill.classList.add("slider-fill");
    slider.appendChild(fill);

    let pressHandler = e => {
        e.preventDefault();
        let click = getClickedXY(e);
        let start = slider.querySelector(".slider-start");
        let startPos = start.getBoundingClientRect();
        let endPos = dot.getBoundingClientRect();
        let dStart = click.x - startPos.x - startPos.width/2;
        let dEnd = click.x - endPos.x - endPos.width/2;
        
        if(Math.abs(dStart) < Math.abs(dEnd)) start.classList.add("active-slider");
        else dot.classList.add("active-slider");

        sliderUpdateVal(click, slider);
    }

    slider.onmousedown = pressHandler;
    slider.ontouchstart = pressHandler;
}

function sliderPointerMove(e)
{
    let list = document.querySelectorAll(".active-slider");

    list.forEach(dot => {
        sliderUpdateVal(getClickedXY(e), dot.parentElement);
    });

    if(list.length > 0) e.preventDefault();
}

function sliderPointerRelease()
{
    let list = document.querySelectorAll(".active-slider");
    list.forEach(dot => {
        dot.classList.remove("active-slider");
    });
}

function sliderUpdateVal(click, slider)
{
    let start = slider.querySelector(".slider-start");
    let end = slider.querySelector(".slider-end");
    let sliderPos = slider.getBoundingClientRect();
    let minX = sliderPos.x + sliderPos.height/2;
    let scale = sliderPos.width - sliderPos.height;
    let cur = click.x - minX;
    cur /= scale;
    cur = cur < 0 ? 0 : cur > 1 ? 1 : cur;
    let changed = false;

    if(end == null)
    {
        if(slider.valStart != cur)
        {
            changed = true;
            slider.valStart = cur;
            slider.style.setProperty("--var-slider-start", cur);
        }
    }
    else
    {
        if(start.classList.contains("active-slider"))
        {
            if(slider.valStart != cur)
            {
                changed = true;

                if(slider.valEnd < cur)
                {
                    start.classList.remove("active-slider");
                    end.classList.add("active-slider");
                    slider.valStart = slider.valEnd;
                    slider.style.setProperty("--var-slider-start", slider.valStart);
                    slider.valEnd = cur;
                    slider.style.setProperty("--var-slider-end", cur);
                }
                else
                {
                    slider.valStart = cur;
                    slider.style.setProperty("--var-slider-start", cur);
                }
            }
        }
        else if(end.classList.contains("active-slider"))
        {
            if(slider.valEnd != cur)
            {
                changed = true;

                if(slider.valStart > cur)
                {
                    end.classList.remove("active-slider");
                    start.classList.add("active-slider");
                    slider.valEnd = slider.valStart;
                    slider.style.setProperty("--var-slider-end", slider.valEnd);
                    slider.valStart = cur;
                    slider.style.setProperty("--var-slider-start", cur);
                }
                else
                {
                    slider.valEnd = cur;
                    slider.style.setProperty("--var-slider-end", cur);
                }
            }
        }
    }

    if(changed) slider.onChangeVal();
}
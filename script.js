const data = aise;

function render() {
    //----------------------------------------------------------------------------------------------------
    // CONSTANTS

    const ITEM_COLORS = [
        "#00000080", "#0000ff80", "#03340380", "#8f00ff80", "#ff4d0080", "#00788080", "#ff000080",
        "#572A00ab", "#FF005C91", "#2D8C0091", "#56640080", "#12004691", "#ACAF00ba",
    ].sort(function () { return 0.5 - Math.random() });

    const GAP_ITEM_ELEMENT = 0.5;
    const GAP_ITEM_TYPE = 1;
    const ITEM_HEIGHT = 3;
    const ITEM_FONT_SIZE = ITEM_HEIGHT / 2;

    const EVENT_COLORS = [
        "#ff0000", "#00ff00", "#0000ff"
    ].sort(function () { return 0.5 - Math.random() });
    const EVENT_ICONS = [
        "&#9733", "&#9790", "&#9824", "&#9827", "&#9829", "&#9830"
    ].sort(function () { return 0.5 - Math.random() });

    //----------------------------------------------------------------------------------------------------
    // Preprocessing Items

    const nDays = (new Date(data.end) - new Date(data.start)) / (1000 * 60 * 60 * 24);

    let itemGroups = {};
    let colorOfType = {};
    let nContinued = 0;

    let parsedItems = data.items.map((item, id) => {
        const left = Math.max((new Date(item.start) - new Date(data.start)) / (1000 * 60 * 60 * 24), 0);
        const right = (new Date(item.end) - new Date(data.start)) / (1000 * 60 * 60 * 24);
        const duration = Math.min(right - left, nDays - left);
        const label = item.label;
        const existsBefore = new Date(item.start) < new Date(data.start);
        const existsAfter = right >= nDays;
        const type = item.type;
        let isContinued = item.continue == "true";
        let isSeparated = item.separate;
        let color = ITEM_COLORS[Object.keys(itemGroups).length % ITEM_COLORS.length];

        let group = type;
        if (isSeparated) {
            if (Object.keys(itemGroups).includes(type)) {
                let group_id = itemGroups[type]._assignedSeparation++;
                group = `${type}@${group_id}`;
                color = itemGroups[type].color;
            }
            else {
                isSeparated = false;
                colorOfType[type] = color;
            }
        }
        else {
            isSeparated = false;
            colorOfType[type] = color;
        }
        // or, ignore separation

        if (Object.keys(itemGroups).includes(group)) {
            itemGroups[group].ids.push(id);
        }
        else {
            isContinued = false;
            itemGroups[group] = {
                type,
                ids: [id],
                color,
                _assignedSeparation: 0
            }
        }

        if (isContinued) nContinued++;

        return {
            id, left, right, duration, label, existsBefore, existsAfter, type, isContinued
        }
    });
    const chartHeight = ((parsedItems.length - nContinued) * (ITEM_HEIGHT + GAP_ITEM_ELEMENT) + (Object.keys(itemGroups).length - 1) * GAP_ITEM_TYPE);

    //----------------------------------------------------------------------------------------------------
    // Preprocessing Events

    let eventGroups = {};
    let parsedEvents = data.events.map((event, id) => {
        const label = event.label;
        const date = event.date;
        const type = event.type;

        if (Object.keys(eventGroups).includes(type)) {
            eventGroups[type].ids.push(id);
        }
        else {
            eventGroups[type] = {
                type,
                ids: [id],
                color: EVENT_COLORS[Object.keys(eventGroups).length % EVENT_COLORS.length],
                icon: EVENT_ICONS[Object.keys(eventGroups).length % EVENT_ICONS.length]
            }
        }

        return {
            label, date, type
        }
    });

    //----------------------------------------------------------------------------------------------------
    // Title and Subtitle

    $("#title").text(data.title);
    $("#subtitle").text(data.subtitle);

    //----------------------------------------------------------------------------------------------------
    // Days

    $(".days").css("height", `${chartHeight}vh`)
    $(".days").html(`<div class="day"></div>`.repeat(nDays));

    //----------------------------------------------------------------------------------------------------
    // Dates

    $(".dates").html("");
    const dStart = new Date(data.start);
    const dEnd = new Date(data.end);
    for (let index = 0; dEnd >= dStart; dStart.setDate(dStart.getDate() + 7), index++) {
        const strMonth = String(dStart.getMonth() + 1).padStart(2, "0");
        const strDate = String(dStart.getDate()).padStart(2, "0");
        const strTime = `${strMonth}/${strDate}`;
        const strStyle = `left: calc(100% / ${nDays} * ${7 * index})`;
        $(".dates").append(`<div class="date" style="${strStyle}">${strTime}</div>`);
    }
    if (dEnd != dStart) {
        const strMonth = String(dEnd.getMonth() + 1).padStart(2, "0");
        const strDate = String(dEnd.getDate()).padStart(2, "0");
        const strTime = `${strMonth}/${strDate}`;
        const strStyle = `left: calc(100%)`;
        $(".dates").append(`<div class="date" style="${strStyle}">${strTime}</div>`);
    }

    //----------------------------------------------------------------------------------------------------
    // Items

    $(".items").html("");
    let index = 0;
    let currentTop = -chartHeight;
    Object.keys(itemGroups).forEach(type => {
        itemGroups[type].ids.forEach(id => {
            const item = parsedItems[id];

            if (item.isContinued) {
                currentTop -= (ITEM_HEIGHT + GAP_ITEM_ELEMENT);
            }

            const strStyle = `
            width: calc(100% / ${nDays} * ${item.duration} - 0.1vw); 
            
            left: calc(100% / ${nDays} * ${item.left} + 0.15vw);
            top: calc(${currentTop}vh);
            background-color: ${itemGroups[item.type].color};
            line-height:${ITEM_HEIGHT}vh;
            border-radius: ${ITEM_HEIGHT / 2}vh;
            font-size: ${ITEM_FONT_SIZE}vh;
            ${item.existsAfter ? `border-top-right-radius: 0; border-bottom-right-radius: 0;` : ""}
            ${item.xistsBefore ? `border-top-left-radius: 0; border-bottom-left-radius: 0;` : ""}
        `;

            $(".items").append(`
            <div class="item" style="${strStyle}">
                ${item.label}
            </div>
        `);

            currentTop += (ITEM_HEIGHT + GAP_ITEM_ELEMENT);
        });
        currentTop += GAP_ITEM_TYPE;
    });
    //----------------------------------------------------------------------------------------------------
    // Events

    $(".events").html("");
    data.events.forEach(event => {
        const nDayPassed = (dEnd - new Date(event.date)) / (1000 * 60 * 60 * 24);
        const strStyle = `color: ${eventGroups[event.type].color}; left: calc(100.2% / ${nDays} * ${nDayPassed}); top: calc(1vh)`;
        $(".events").append(`
        <div class="event" style="${strStyle}">
            ${eventGroups[event.type].icon}
            ${event.label ? `<div>${event.label}</div>` : ''}
        </div>
    `)
    })

    //----------------------------------------------------------------------------------------------------
    // Labels

    $(".labels").html("");
    $(".labels").css("top", `calc(-${chartHeight}vh + 3vh)`);
    Object.keys(colorOfType).forEach((type, index) => {
        const color = colorOfType[type];
        const strStyle = `
            font-size: ${ITEM_FONT_SIZE}vh;
            height: ${ITEM_HEIGHT}vh;
            line-height: ${ITEM_HEIGHT}vh;
            border-radius: ${ITEM_HEIGHT / 2}vh;
            margin-bottom: ${GAP_ITEM_TYPE}vh;
            background-color: ${color};
            top: ${(ITEM_HEIGHT + GAP_ITEM_TYPE) * index}vh;
        `;
        $(".labels").append(`<div class="label-item" style="${strStyle}">${type}</div>`);
    });
    Object.keys(eventGroups).forEach((type, index) => {
        const strStyle = `
            top: ${(ITEM_HEIGHT + GAP_ITEM_TYPE) * Object.keys(colorOfType).length + (ITEM_FONT_SIZE + GAP_ITEM_TYPE) * index}vh;
            height: ${ITEM_FONT_SIZE}vh;
            line-height: ${ITEM_FONT_SIZE}vh;
        `;
        $(".labels").append(`
        <div class="label-event" style="${strStyle}">
            <span style="color: ${eventGroups[type].color}">${eventGroups[type].icon}</span> ${type}
        </div>
    `)
    });
}

render();
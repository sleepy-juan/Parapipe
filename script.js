const data = aise;

/* initial size */
$(".days").css("height", `${data.items.length * 4}vh`)

/* title and subtitle */
$("#title").text(data.title);
$("#subtitle").text(data.subtitle);

/* days */
const nDays = (new Date(data.end) - new Date(data.start)) / (1000 * 60 * 60 * 24);
$(".days").html(`<div class="day"></div>`.repeat(nDays));

/* dates */
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

/* items */
data.items.forEach((item, index) => {
    const nLeft = Math.max((new Date(item.start) - new Date(data.start)) / (1000 * 60 * 60 * 24), 0);
    const nRight = (new Date(item.end) - new Date(data.start)) / (1000 * 60 * 60 * 24);

    const nDuration = Math.min(nRight - nLeft, nDays - nLeft);

    const strStyle = `
        width: calc(100% / ${nDays} * ${nDuration}); 
        height: 3vh;
        line-height: 3vh;
        left: calc(100% / ${nDays} * ${nLeft} + 2px);
        top: calc(4vh * ${index} - ${data.items.length * 4}vh);
        background-color: #0000ff80;
        ${nRight >= nDays ? `border-top-right-radius: 0; border-bottom-right-radius: 0;` : ""}
        ${new Date(item.start) < new Date(data.start) ? `border-top-left-radius: 0; border-bottom-left-radius: 0;` : ""}
    `;

    $(".items").append(`
        <div class="item" style="${strStyle}">
            ${item.label}
        </div>
    `)
})

/* events */
data.events.forEach(event => {
    const nDayPassed = (dEnd - new Date(event.date)) / (1000 * 60 * 60 * 24);
    const strStyle = `color: #0000ff; left: calc(100% / ${nDays} * ${nDayPassed}); top: calc(1vh)`;
    $(".events").append(`
        <div class="event" style="${strStyle}">
            &#9733
            ${event.label ? `<div>${event.label}</div>` : ''}
        </div>
    `)
})
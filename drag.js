
function allowDrop(ev) {
    ev.preventDefault();
  }
  
function drag(ev) {
ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    const strStyle = `
        width: calc(100% /1); 
        
        left: calc(100% / 1 + 0.2vw);
        top: calc(4vh *1 - 4*4vh);
        background-color: #0000ff80;
        ${1 >= 2 ? `border-top-right-radius: 0; border-bottom-right-radius: 0;` : ""}
        ${new Date(11/4) < new Date(11/5) ? `border-top-left-radius: 0; border-bottom-left-radius: 0;` : ""}
    `;

    $(".items").append(`
    <div class="item" style="${strStyle}">
        hello
    </div>
`)
}
window.onload = init;
var mouseX;
var mouseY;


function init() {
	if (window.Event) {
	document.captureEvents(Event.MOUSEMOVE);
	}
    document.onmousemove = getCursorXY;
}

var delta1 = 0.5;
var delta2 = 1.5;
var itemh =3;
var itemlen = data.items.length;
var formattedend;
var formattedstart;
var indexy;

function getCursorXY(e) {
    var w = jQuery(window).width()
    var h = jQuery(window).height()
    mouseX= (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
    var x= ((mouseX-w*0.05)/(w*0.9))
    document.getElementById('cursorX').value = x
    const nDays = (new Date(data.end) - new Date(data.start)) / (1000 * 60 * 60 * 24);

    const newday = Math.round(nDays*x)
    const startdate = new Date(data.start).getDate()+newday 
    const formattedstart = String(parseInt(startdate/31+10) + "/" +(startdate%31))
    const formattedend = String(parseInt((startdate+7)/31+10) + "/" +(startdate+7)%31)

    mouseY=(window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
    var y =((mouseY-h*0.18)/(0.52*h));
    document.getElementById('cursorY').value = y;
    var indexy = Math.round(itemlen*y+1.3)-1;
    var item={};
    item['type']='audio';
    item['label']='new item';
    item['start']=formattedstart;
    item['end']=formattedend;
    item['indexy']=indexy;
    return item;
}

function dropnew(ev){
    var item = getCursorXY(ev);
    indexy = item['indexy'];
    $('.item').remove();
    data.items.splice(indexy,0,item);
    render();

}
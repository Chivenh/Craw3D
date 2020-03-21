/**
 * index
 */
(function () {

    var Data = [{id: 1, title: '这是货架1', bg: 'bgs/1.jpg', cells: [9, 8, 8, 8]},
        {id: 1, title: '这是货架2', bg: 'bgs/2.jpg', cells: [9, 8, 8, 8]},
        {id: 1, title: '这是货架3', bg: 'bgs/3.jpg', cells: [9, 8, 8, 8]},
        {id: 1, title: '这是货架4', bg: 'bgs/4.jpg', cells: [9, 8, 8, 8]},
        {id: 1, title: '这是货架5', bg: 'bgs/5.jpg', cells: [9, 8, 8, 8]},
        {id: 1, title: '这是货架6', bg: 'bgs/6.jpg', cells: [9, 8, 7, 9]},
        {id: 1, title: '这是货架7', bg: 'bgs/7.jpg', cells: [9, 8, 8, 8]},
        {id: 1, title: '这是货架8', bg: 'bgs/8.jpg', cells: [9, 8, 9, 9]},
        {id: 1, title: '这是货架9', bg: 'bgs/3.jpg', cells: [9, 9, 8, 7]}];

    var floorCellsMaker = (floor, index) => {
        return floor.map((length, i) => {
            var cells = [];
            while (length-- > 0) {
                cells.push(`<li class="content-floor-cell"><p class="content-floor-cell-title">${(index+1) + "-" + (i+1) + "-" + (length+1)}</p></li>`);
            }
            return `<ul class="content-floor">
                    ${`<li class="content-floor-cell">${i+1}层</li>`+cells.reverse().join("")}
                </ul>`;
        }).join("");
    };

    var itemMaker = (item,index) => {
        var itemDiv = document.createElement("div");
        itemDiv.classList.add("wrap-item");
        itemDiv.innerHTML = `<img class="wrap-item-bg" src="${item.bg}"/>
            <h5 class="content-title">${item.title}</h5>
            <div class="wrap-content" data-id="${item.id}">
                ${floorCellsMaker(item.cells,index)}
            </div>`;
        return itemDiv;
    };

    /*初始化元素*/
    var wrapFragment = document.createDocumentFragment();
    Data.forEach((item,index) => wrapFragment.appendChild(itemMaker(item,index)));
    document.querySelector("#wrap").appendChild(wrapFragment);

    setTimeout(function () {

        var theWrapTest = Craw3DHelper('#wrap');
        var theWrapClassList = theWrapTest.wrapContainer.classList;
        /*点击时将当前项放大置前到整个视窗*/
        theWrapTest.wrapContainer.addEventListener("click", function (e) {
            var target = e.target, parentNode = target.parentNode;
            var theItem = (target.classList || []).contains("wrap-item") ? target : (parentNode.classList || []).contains("wrap-item") ? parentNode : false;
            if (theItem && !theItem.classList.contains("wrap-view")) {
                theItem.classList.add("wrap-view");
                theWrapClassList.replace("wrap", "wrap-vhidden");
                theWrapTest.mouseHandler.disableMouse();
            }
            e.stopPropagation();
        });
        /*按esc键时退出视窗*/
        document.addEventListener("keydown", (e) => {
            if ((e.code || e.key)==='Escape') {
                var wrapView = document.querySelector(".wrap-view");
                if (wrapView) {
                    wrapView.classList.replace("wrap-view", "wrap-transition");
                    theWrapClassList.replace("wrap-vhidden", "wrap");
                    setTimeout(function () {
                        wrapView.classList.remove("wrap-transition");
                    }, 1000);
                    theWrapTest.mouseHandler.enableMouse();
                }
            }
        });
    }, 500);

}());
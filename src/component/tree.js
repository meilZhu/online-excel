// 树的组件
//  TODOTREE
import { treeCellW, treeLevel, hasTree, treeContainerWith } from '../core/tree';


class Tree{
    constructor(el, data, cb) {
        this.el = el;
        this.data = data;
        this.cb = cb;
        // 拖拽移动时，按钮按下的数据信息
        this.move = {}
        this.renderFixHead();
    }

    // 渲染头部
    renderFixHead() {
        const { data } = this;
        const { settings } = data;
        // console.log(settings)
        if(hasTree(settings) && treeLevel(settings) > 0) {
            let content = `<ul class="fixedTreeLevel">`;
            for(let i=0; i < treeLevel(settings); i++){
                content += `<li>${i+1}</li>`;
            }
            content += `</ul>`;

            content += `<div class="tree-move" style='width: 15px; height: 15px; background: rgba(0,0,0,.5); position: absolute;
            display: none'></div>`;

            this.el.innerHTML = content;
        }
    }


    collapseTree(w, y, rowHeight, i) {
        // console.log(this)
        const { data } = this;
        const { settings } = data;

        // 创建树节点
        if(!this.el.contains(this.el.querySelector('.fixTree'))) {
            this.el.innerHTML = this.el.innerHTML + `<div class="fixTree"></div>`
        }

        let treeData =  settings.tree && settings.tree.data ? settings.tree.data: [];

        // 设置树内容
        let parentEl = this.el.querySelector('.fixTree');
        let childEl = this.el.querySelector(`[attr="${i}"]`);
        if(!childEl) {
            let item = treeData.filter(item => item.ri===i);
            if(item.length) {
                let content = '';
                content += 
                `<div class='treeNodeContent' data-index="${i}" style='width: ${settings.tree.maxLength * 25}px; top: ${y + 4 - rowHeight}px;'>
                    <div
                        attr="${i}"
                        class="treeNode"
                        style="
                            left: ${item[0].level * treeCellW + 4}px;
                            top: 0;
                        ">`;

                // 渲染线条
                for(let j=0; j<item[0].level;j++) {
                    
                    content += `
                        <span class="lineY"
                            style="
                                height: ${rowHeight}px;
                                left: ${j * treeCellW - item[0].level * treeCellW + 7 }px;
                                top: -4px;
                            "
                        ></span>
                    `;
                    if(item[0].lastChild && item[0].level - 1 === j) {
                        content += `
                        <span class="lineX"
                            style="
                                width: 12px;
                                left: ${j * treeCellW - item[0].level * treeCellW + 7 }px;
                                top: ${rowHeight - 5}px;
                            "
                        ></span>
                    `;
                    }
                }

                content += `
                        ${item[0].childrenLen ? 
                            '<span class="collpase">'
                            +(item[0].expand ? '-' : '+')+'<i class="line" style="width:'+ (settings.tree.maxLength - item[0].level) * 25 +'px"></i>'
                            +'</span>' : 
                            '<span class="circle">'
                            +(i === 0 ? '' : '.')+'<i class="line" style="width:'+ (settings.tree.maxLength - item[0].level) * 25 +'px"></i>'
                            +'</span>'}
                    </div>
                </div>
                `

                parentEl.innerHTML = parentEl.innerHTML + content;
            }
        }
    }

    // 清除内容
    clearAll() {
        let fixTreeEl = this.el.querySelector('.fixTree');

        if(fixTreeEl) this.el.removeChild(fixTreeEl);
    }

    // 点击事件
    clickEvt(ri, ci, top, height, width, offsetX, offsetY) {
        // 如果点击右侧 则阻止执行
        if(ci !== -1) return;
        const { data } = this;
        const { settings } = data;
        let child = settings.tree && settings.tree.data ? settings.tree.data.filter(item => item.ri === ri) : []; 
        this.move =  child[0];
        // 以下是对树形结构的处理
        if(child.length) {
            // 以下是对树形结构的处理
            let childEl = this.el.querySelector(`[attr="${ri}"]`);
            let left = parseInt(childEl.style.left);
            let top = parseInt(childEl.style.top) + 25;
            let container = {
                left: left,
                top: top,
                bottom: 16 + top,
                right: 16 + left
            }

            // 确定移动鼠标的位置
            if ((settings.tree && offsetX < 25 * settings.tree.maxLength) && !(offsetX < container.right && offsetX > container.left)) {
                const dom = document.querySelector('.x-spreadsheet-overlayer')
                dom.style.cursor = 'move'
                // 移动的块元素
                const move = this.el.querySelector('.tree-move');
                move.style.display = 'block';
                move.style.left= `${offsetX -8}px`;
                move.style.right = `${offsetY - 8}px`;

                document.onmousemove = function($event) {
                    move.style.left = `${$event.offsetX - 8}px`;
                    move.style.top = `${$event.offsetY-8}px`;
                }

                document.onmouseup = function() {
                    document.onmousemove  = null
                }
            }

            if(offsetX < container.right && offsetX > container.left){
                this.cb({mousedownItem: child[0], type: 'mousedown'});
            }
            return;
        }

        // 这里是对树形结构上方的层级的点击处理
        let level= Math.floor(offsetX/25)
        this.cb({mousedownData: this.data.settings.tree.data, type: 'levelMousedown', level: level})


    }

    moveEvt(ri, ci, top, height, width, offsetX, offsetY, flag) {
        // 如果点击右侧 则阻止执行
        if(ci !== -1) return;
        const { data } = this;
        const { settings } = data;
        let child = settings.tree && settings.tree.data ? settings.tree.data.filter(item => item.ri === ri) : [];

        if(child.length) {
            let childEl = this.el.querySelector(`[attr="${ri}"]`);
            if (!childEl) return;
            let left = parseInt(childEl.style.left);
            let top = parseInt(childEl.style.top) + 25;
            let container = {
                left: left,
                top: top,
                bottom: 16 + top,
                right: 16 + left
            }
            const dom = document.querySelector('.x-spreadsheet-overlayer')
            if((offsetX < container.right && offsetX > container.left) && !flag){
                dom.style.cursor = 'pointer';
            } else {
                dom.style.cursor = 'default';
            }
  
            // 拖拽是的下划线
            if (flag) {
                childEl.querySelector('.line').style.display='inline-block';
                this.removeLine(ri)
            }
           return;
        }

        const dom = document.querySelector('.x-spreadsheet-overlayer')
        dom.style.cursor = 'pointer'
    }

    // 移除多余的下划线
    removeLine(ri) {
        const { data } = this;
        const { settings } = data;
        settings.tree.data.forEach( it => {
            if (it.ri !== ri) {
                const childEle = this.el.querySelector(`[attr="${it.ri}"]`);
                if (!childEle) return;
                childEle.querySelector('.line').style.display='none';
            }
        })
    }


    // 鼠标放开事件
    mouseupEvt(ri, ci, top, height, width, offsetX, offsetY) {
        const { data } = this;
        const { settings } = data;
        if (!settings.tree) return;
        let child = settings.tree && settings.tree.data ? settings.tree.data.filter(item => item.ri === ri) : [];

        const dom = document.querySelector('.x-spreadsheet-overlayer')
        dom.style.cursor = 'default';

        const move =  this.el.querySelector('.tree-move');
        move.style.display = 'none'

        if (child.length && (settings.tree && offsetX < 25 * settings.tree.maxLength) && this.move && this.move.ri !== 0 && child[0].ri !== 0 && this.move.ri < settings.tree.data.length && child[0].ri < settings.tree.data.length &&  this.check(this.move, child[0])) {
            this.cb({mousedownItem: this.move, type: 'mouseup', mouseupItem: child[0]});
        }

        let childEl = this.el.querySelector(`[attr="${ri}"]`);
        if (!childEl) return;
        childEl.querySelector('.line').style.display='none';
    }

    // 校验操作是否规范
    check(old, news) {
        const { data } = this;
        const { settings } = data;
        let flag = true
        const oldId = old.id;
        const parentId = news.parent ? news.parent.id: '';
        if ( old.childrenLen > 0 ) {
            function doCheck(id) {
                if (!id) return;
                settings.tree.data.forEach( it => {
                    if (it.id === id) {
                        if (it.id === oldId) {
                            flag = false
                        }
                        doCheck(it.parent ? it.parent.id: '')
                    }
                })
            }
            doCheck(parentId)
        }
        return flag;
    }

    // 设置数据
    resetData(data) {
        this.data.settings.tree= data.tree;
        this.renderFixHead();
    }
}

export default Tree;
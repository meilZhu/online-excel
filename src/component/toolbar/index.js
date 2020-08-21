/* global window */

import Align from './align';
import Valign from './valign';
import Autofilter from './autofilter';
import Bold from './bold';
import Italic from './italic';
import Strike from './strike';
import Underline from './underline';
import Border from './border';
import Clearformat from './clearformat';
import Paintformat from './paintformat';
import TextColor from './text_color';
import FillColor from './fill_color';
import FontSize from './font_size';
import Font from './font';
import Format from './format';
import Formula from './formula';
import Freeze from './freeze';
import Merge from './merge';
import Redo from './redo';
import Undo from './undo';
import Print from './print';
import Textwrap from './textwrap';
import More from './more';
import Userdefine from './user_define';

import { h } from '../element';
import { cssPrefix } from '../../config';
import { bind } from '../event';

function buildDivider() {
  return h('div', `${cssPrefix}-toolbar-divider`);
}

function initBtns2() {
  this.btns2 = [];
  this.items.forEach((it) => {
    if (Array.isArray(it)) {
      it.forEach(({ el }) => {
        const rect = el.box();
        const { marginLeft, marginRight } = el.computedStyle();
        this.btns2.push([el, rect.width + parseInt(marginLeft, 10) + parseInt(marginRight, 10)]);
      });
    } else {
      const rect = it.box();
      const { marginLeft, marginRight } = it.computedStyle();
      this.btns2.push([it, rect.width + parseInt(marginLeft, 10) + parseInt(marginRight, 10)]);
    }
  });
}

function moreResize() {
  const {
    el, btns, moreEl, btns2,
  } = this;
  const { moreBtns, contentEl } = moreEl.dd;
  el.css('width', `${this.widthFn() - 60}px`);
  const elBox = el.box();

  let sumWidth = 160;
  let sumWidth2 = 12;
  const list1 = [];
  const list2 = [];
  btns2.forEach(([it, w], index) => {
    sumWidth += w;
    if (index === btns2.length - 1 || sumWidth < elBox.width) {
      list1.push(it);
    } else {
      sumWidth2 += w;
      list2.push(it);
    }
  });
  btns.html('').children(...list1);
  moreBtns.html('').children(...list2);
  contentEl.css('width', `${sumWidth2}px`);
  if (list2.length > 0) {
    moreEl.show();
  } else {
    moreEl.hide();
  }
}

export default class Toolbar {
  constructor(data, widthFn, isHide = false, defaultToolbar = [], defineToolbar = []) {
    this.data = data;
    this.change = () => {};
    this.widthFn = widthFn;
    this.isHide = isHide;
    // 自定义的属性 (默认工具栏)
    this.defaultToolbar = defaultToolbar;
     // 自定义的属性 (自定义工具栏)
    this.defaultToolbar = this.defineToolbar;
    const style = data.defaultStyle();
    this.items = [
      [
        this.undoEl = new Undo(),
        this.redoEl = new Redo(),
        new Print(),
        this.paintformatEl = new Paintformat(),
        this.clearformatEl = new Clearformat(),
      ],
      buildDivider(),
      [
        this.formatEl = new Format(),
      ],
      buildDivider(),
      [
        this.fontEl = new Font(),
        this.fontSizeEl = new FontSize(),
      ],
      buildDivider(),
      [
        this.boldEl = new Bold(),
        this.italicEl = new Italic(),
        this.underlineEl = new Underline(),
        this.strikeEl = new Strike(),
        this.textColorEl = new TextColor(style.color),
      ],
      buildDivider(),
      [
        this.fillColorEl = new FillColor(style.bgcolor),
        this.borderEl = new Border(),
        this.mergeEl = new Merge(),
      ],
      buildDivider(),
      [
        this.alignEl = new Align(style.align),
        this.valignEl = new Valign(style.valign),
        this.textwrapEl = new Textwrap(),
      ],
      buildDivider(),
      [
        this.freezeEl = new Freeze(),
        this.autofilterEl = new Autofilter(),
        this.formulaEl = new Formula(),
        this.moreEl = new More(),
      ],
    ];
    // 当自定义的默认工具栏有值
    if (defaultToolbar.length) {
      this.items = [];
      defaultToolbar.forEach( it => {
        if(typeof it === 'string') {
          switch(it) {
            case 'divider': this.items.push(buildDivider()); break
          }
        }else if(Array.isArray(it)) {
          let children = [];
          it.forEach(child => {
            switch(child) {
              case 'undo'       : children.push(this.undoEl = new Undo()); break;
              case 'redo'       : children.push(this.redoEl = new Redo()); break;
              case 'print'      : children.push(new Print()); break;
              case 'paintformat': children.push(this.paintformatEl = new Paintformat()); break;
              case 'clearformat': children.push(this.clearformatEl = new Clearformat()); break;
              case 'format'     : children.push(this.formatEl = new Format()); break;
              case 'font'       : children.push(this.fontEl = new Font()); break;
              case 'fontSize'   : children.push(this.fontSizeEl = new FontSize()); break;
              case 'bold'       : children.push(this.boldEl = new Bold()); break;
              case 'italic'     : children.push(this.italicEl = new Italic()); break;
              case 'underline'  : children.push(this.underlineEl = new Underline()); break;
              case 'strike'     : children.push(this.strikeEl = new Strike()); break;
              case 'textColor'  : children.push(this.textColorEl = new TextColor(style.color)); break;
              case 'fillColor'  : children.push(this.fillColorEl = new FillColor(style.bgcolor)); break;
              case 'border'     : children.push(this.borderEl = new Border()); break;
              case 'merge'      : children.push(this.mergeEl = new Merge()); break;
              case 'align'      : children.push(this.alignEl = new Align(style.align)); break;
              case 'valign'     : children.push(this.valignEl = new Valign(style.valign)); break;
              case 'textwrap'   : children.push(this.textwrapEl = new Textwrap()); break;
              case 'freeze'     : children.push(this.freezeEl = new Freeze()); break;
              case 'autofilter' : children.push(this.autofilterEl = new Autofilter()); break;
              case 'formula'    : children.push(this.formulaEl = new Formula()); break;
              case 'more'       : children.push(this.moreEl = new More()); break;
            }
          })
          this.items.push(children);
        }
      })
    }

    // 自定义工具栏
    if(defineToolbar.length) {
      defineToolbar.forEach(it => {
        if(typeof it === 'string') {
          switch(it) {
            case 'divider': this.items.push(buildDivider()); break
          }
        }else if(Array.isArray(it)) {
          let children = [];

          it.forEach(child => {
            children.push(new Userdefine(child.key, child.title, child.icon))
          });

          this.items.push(children);
        }
      })
    }

    this.el = h('div', `${cssPrefix}-toolbar`);
    this.btns = h('div', `${cssPrefix}-toolbar-btns`);

    this.items.forEach((it) => {
      if (Array.isArray(it)) {
        it.forEach((i) => {
          this.btns.child(i.el);
          i.change = (...args) => {
            this.change(...args);
          };
        });
      } else {
        this.btns.child(it.el);
      }
    });

    this.el.child(this.btns);
    if (isHide) {
      this.el.hide();
    } else {
      this.reset();
      setTimeout(() => {
        initBtns2.call(this);
        moreResize.call(this);
      }, 0);
      bind(window, 'resize', () => {
        moreResize.call(this);
      });
    }
  }

  paintformatActive() {
    return this.paintformatEl.active();
  }

  paintformatToggle() {
    this.paintformatEl.toggle();
  }

  trigger(type) {
    this[`${type}El`].click();
  }

  resetData(data) {
    this.data = data;
    this.reset();
  }

  reset() {
    if (this.isHide) return;
    const { data } = this;
    const style = data.getSelectedCellStyle();
    // console.log('canUndo:', data.canUndo());
    this.undoEl.setState(!data.canUndo());
    this.redoEl.setState(!data.canRedo());
    this.mergeEl.setState(data.canUnmerge(), !data.selector.multiple());
    this.autofilterEl.setState(!data.canAutofilter());
    // this.mergeEl.disabled();
    // console.log('selectedCell:', style, cell);
    const { font, format } = style;
    this.formatEl.setState(format);
    this.fontEl.setState(font.name);
    this.fontSizeEl.setState(font.size);
    this.boldEl.setState(font.bold);
    this.italicEl.setState(font.italic);
    this.underlineEl.setState(style.underline);
    this.strikeEl.setState(style.strike);
    this.textColorEl.setState(style.color);
    this.fillColorEl.setState(style.bgcolor);
    this.alignEl.setState(style.align);
    this.valignEl.setState(style.valign);
    this.textwrapEl.setState(style.textwrap);
    // console.log('freeze is Active:', data.freezeIsActive());
    this.freezeEl.setState(data.freezeIsActive());
  }
}

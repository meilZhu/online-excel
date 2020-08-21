import { h } from './element';
import { bindClickoutside, unbindClickoutside } from './event';
import { cssPrefix } from '../config';
import { tf } from '../locale/locale';

const menuItems = [
  { key: 'copy', title: tf('contextmenu.copy'), label: 'Ctrl+C' },
  { key: 'cut', title: tf('contextmenu.cut'), label: 'Ctrl+X' },
  { key: 'paste', title: tf('contextmenu.paste'), label: 'Ctrl+V' },
  { key: 'paste-value', title: tf('contextmenu.pasteValue'), label: 'Ctrl+Shift+V' },
  { key: 'paste-format', title: tf('contextmenu.pasteFormat'), label: 'Ctrl+Alt+V' },
  { key: 'divider' },
  { key: 'insert-row', title: tf('contextmenu.insertRow') },
  { key: 'insert-column', title: tf('contextmenu.insertColumn') },
  { key: 'divider' },
  { key: 'delete-row', title: tf('contextmenu.deleteRow') },
  { key: 'delete-column', title: tf('contextmenu.deleteColumn') },
  { key: 'delete-cell-text', title: tf('contextmenu.deleteCellText') },
  { key: 'hide', title: tf('contextmenu.hide') },
  { key: 'divider' },
  { key: 'validation', title: tf('contextmenu.validation') },
  { key: 'divider' },
  { key: 'cell-printable', title: tf('contextmenu.cellprintable') },
  { key: 'cell-non-printable', title: tf('contextmenu.cellnonprintable') },
  { key: 'divider' },
  { key: 'cell-editable', title: tf('contextmenu.celleditable') },
  { key: 'cell-non-editable', title: tf('contextmenu.cellnoneditable') },
];

function buildMenuItem(item) {
  if (item.key === 'divider') {
    return h('div', `${cssPrefix}-item divider`);
  }
  return h('div', `${cssPrefix}-item`)
  .on('click', () => {
    this.itemClick(item.key, item.trigger);
    this.hide();
  })
  .children(
    typeof item.title === 'string' ? item.title : item.title(),
    h('div', 'label').child(item.label || ''),
  );
}

function buildMenu() {
  let menus = [];
  // 设置默认的菜单
  if(this.defaultContextMenu.length) {
    this.defaultContextMenu.forEach(it => {
      menus.push(buildMenuItem.call(this, menuItems.filter(nd => nd.key === it)[0]));
    })
  }else {
    menuItems.forEach(it => {
      menus.push(buildMenuItem.call(this, it));
    })
  }
  // 设置用户自定义的菜单
  if(this.defineContentMenu.length) {
    this.defineContentMenu.forEach(it => {
      menus.push(buildMenuItem.call(this, it));
    })
  }
  // console.log(menus)
  return menus;
}

export default class ContextMenu {
  constructor(viewFn, isHide = false, defaultContextMenu = [], defineContentMenu = []) {
    // 设置默认菜单
    this.defaultContextMenu = defaultContextMenu;
    // 设置自定义菜单
    this.defineContentMenu = defineContentMenu;
    this.menuItems = buildMenu.call(this);
    this.el = h('div', `${cssPrefix}-contextmenu`)
      .children(...this.menuItems)
      .hide();
    this.viewFn = viewFn;
    this.itemClick = () => {};
    this.isHide = isHide;
    this.setMode('range');
  }

  // row-col: the whole rows or the whole cols
  // range: select range
  setMode(mode) {
    // console.log(this.menuItems)
    const hideEl = this.menuItems[this.menuItems.length -1];
    // console.log(hideEl)
    // console.log(mode)
    if (mode === 'row-col') {
      hideEl.show();
    } else {
      hideEl.hide();
    }
  }

  hide() {
    const { el } = this;
    el.hide();
    unbindClickoutside(el);
  }

  setPosition(x, y) {
    if (this.isHide) return;
    const { el } = this;
    const { width } = el.show().offset();
    const view = this.viewFn();
    const vhf = view.height / 2;
    let left = x;
    if (view.width - x <= width) {
      left -= width;
    }
    el.css('left', `${left}px`);
    if (y > vhf) {
      el.css('bottom', `${view.height - y}px`)
        .css('max-height', `${y}px`)
        .css('top', 'auto');
    } else {
      el.css('top', `${y}px`)
        .css('max-height', `${view.height - y}px`)
        .css('bottom', 'auto');
    }
    bindClickoutside(el);
  }
}

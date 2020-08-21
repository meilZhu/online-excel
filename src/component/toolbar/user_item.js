/*
 * @file: 
 * @Date: 2020-07-28 10:08:44
 * @author: manyao.zhu
 */ 
import { cssPrefix } from '../../config';
import tooltip from '../tooltip';
import { h } from '../element';
import { t } from '../../locale/locale';

export default class UserItem {
  constructor(tag, shortcut, icon) {
    this.tip = t(`toolbar.${tag.replace(/-[a-z]/g, c => c[1].toUpperCase())}`);
    if (shortcut) this.tip += ` ${shortcut}`;
    this.tag = tag;
    this.shortcut = shortcut;
    this.icon = icon;
    this.el = this.element();
    this.change = () => {};
  }

  element() {
    const { tip } = this;
    return h('div', `${cssPrefix}-toolbar-btn`)
      .on('mouseenter', (evt) => {
        tooltip(tip, evt.target);
      })
      .attr('data-tooltip', tip);
  }

  setState() {}
}

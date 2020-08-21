import UserItem from './user_item';
import Icon from '../icon';
import { h } from '../element';
import { cssPrefix } from '../../config';

export default class UserIconItem extends UserItem {
    element() {
      // 创建图标元素
      const el = this.createIcon(this.tag);

      return super.element()
        .child(el)
        .on('click', () => this.change(this.tag));
    }
  
    setState(disabled) {
      this.el.disabled(disabled);
    }

    // 创建图标
    createIcon(tag) {
      let el = document.createElement('div')

      el.style.cssText = `
        text-align: center;
        display: inline-block;
        vertical-align: middle;
        height: 18px; 
        width: 18px;
        background-size: 100% 100%;
        opacity: 0.56;
        background-image:url(${this.icon});`;

      return el;
    }

    
}

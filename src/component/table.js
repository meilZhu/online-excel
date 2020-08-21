import { stringAt } from '../core/alphabet';
import { getFontSizePxByPt } from '../core/font';
import _cell from '../core/cell';
import { formulam } from '../core/formula';
import { formatm } from '../core/format';
//  TODOTREE
import { treeContainerWith, hasTree } from '../core/tree';

import {
  Draw, DrawBox, thinLineWidth, npx,
} from '../canvas/draw';
// gobal var
const cellPaddingWidth = 5;
const tableFixedHeaderCleanStyle = { fillStyle: '#f4f5f8' };
const tableGridStyle = {
  fillStyle: '#fff',
  lineWidth: thinLineWidth,
  strokeStyle: '#e6e6e6',
};
function tableFixedHeaderStyle() {
  return {
    textAlign: 'center',
    textBaseline: 'middle',
    font: `500 ${npx(12)}px Source Sans Pro`,
    fillStyle: '#585757',
    lineWidth: thinLineWidth(),
    strokeStyle: '#e6e6e6',
  };
}

function getDrawBox(data, rindex, cindex, yoffset = 0) {
  const {
    left, top, width, height,
  } = data.cellRect(rindex, cindex);
  return new DrawBox(left, top + yoffset, width, height, cellPaddingWidth);
}
/*
function renderCellBorders(bboxes, translateFunc) {
  const { draw } = this;
  if (bboxes) {
    const rset = new Set();
    // console.log('bboxes:', bboxes);
    bboxes.forEach(({ ri, ci, box }) => {
      if (!rset.has(ri)) {
        rset.add(ri);
        translateFunc(ri);
      }
      draw.strokeBorders(box);
    });
  }
}
*/

export function renderCell(draw, data, rindex, cindex, yoffset = 0) {
  const { sortedRowMap, rows, cols } = data;
  if (rows.isHide(rindex) || cols.isHide(cindex)) return;
  let nrindex = rindex;
  if (sortedRowMap.has(rindex)) {
    nrindex = sortedRowMap.get(rindex);
  }

  const cell = data.getCell(nrindex, cindex);
  if (cell === null) return;
  let frozen = false;
  if ('editable' in cell && cell.editable === false) {
    frozen = true;
  }

  const style = data.getCellStyleOrDefault(nrindex, cindex);
  const dbox = getDrawBox(data, rindex, cindex, yoffset);
  dbox.bgcolor = style.bgcolor;
  if (style.border !== undefined) {
    dbox.setBorders(style.border);
    // bboxes.push({ ri: rindex, ci: cindex, box: dbox });
    draw.strokeBorders(dbox);
  }
  draw.rect(dbox, () => {
    // render text
    let cellText = _cell.render(cell.text || '', formulam, (y, x) => (data.getCellTextOrDefault(x, y)));
    if (style.format) {
      // console.log(data.formatm, '>>', cell.format);
      cellText = formatm[style.format].render(cellText);
    }
    const font = Object.assign({}, style.font);
    font.size = getFontSizePxByPt(font.size);
    // console.log('style:', style);
    draw.text(cellText, dbox, {
      align: style.align,
      valign: style.valign,
      font,
      color: style.color,
      strike: style.strike,
      underline: style.underline,
    }, style.textwrap);
    // error
    const error = data.validations.getError(rindex, cindex);
    if (error) {
      // console.log('error:', rindex, cindex, error);
      draw.error(dbox);
    }
    if (frozen) {
      draw.frozen(dbox);
    }
  });
}

function renderAutofilter(viewRange) {
  const { data, draw } = this;
  if (viewRange) {
    const { autoFilter } = data;
    if (!autoFilter.active()) return;
    const afRange = autoFilter.hrange();
    if (viewRange.intersects(afRange)) {
      afRange.each((ri, ci) => {
        const dbox = getDrawBox(data, ri, ci);
        draw.dropdown(dbox);
      });
    }
  }
}

function renderContent(viewRange, fw, fh, tx, ty) {
  const { draw, data } = this;
  // TODOTREE
  const treeW = treeContainerWith(data.settings);
  draw.save();
  draw.translate(fw, fh)
    .translate(tx, ty);

  const { exceptRowSet } = data;
  // const exceptRows = Array.from(exceptRowSet);
  const filteredTranslateFunc = (ri) => {
    const ret = exceptRowSet.has(ri);
    if (ret) {
      const height = data.rows.getHeight(ri);
      draw.translate(treeW, -height);
    }
    return !ret;
  };

  const exceptRowTotalHeight = data.exceptRowTotalHeight(viewRange.sri, viewRange.eri);
  // 1 render cell
  draw.save();
  draw.translate(treeW, -exceptRowTotalHeight);
  viewRange.each((ri, ci) => {
    renderCell(draw, data, ri, ci);
  }, ri => filteredTranslateFunc(ri));
  draw.restore();


  // 2 render mergeCell
  const rset = new Set();
  draw.save();
  draw.translate(treeW, -exceptRowTotalHeight);
  data.eachMergesInView(viewRange, ({ sri, sci, eri }) => {
    if (!exceptRowSet.has(sri)) {
      renderCell(draw, data, sri, sci);
    } else if (!rset.has(sri)) {
      rset.add(sri);
      const height = data.rows.sumHeight(sri, eri + 1);
      draw.translate(treeW, -height);
    }
  });
  draw.restore();

  // 3 render autofilter
  renderAutofilter.call(this, viewRange);

  draw.restore();
}

function renderSelectedHeaderCell(x, y, w, h) {
  const { draw, data } = this;
  draw.save();
  // TODOTREE 设置左侧的渲染边界
  const treeW = treeContainerWith(data.settings); 
  draw.attr({ fillStyle: 'rgba(75, 137, 255, 0.08)' })
    .fillRect(treeW, y, w - treeW, h);
  draw.restore();
}

// viewRange
// type: all | left | top
// w: the fixed width of header
// h: the fixed height of header
// tx: moving distance on x-axis
// ty: moving distance on y-axis
// TODOTREE
function renderFixedHeaders(type, viewRange, w, h, tx, ty) {
  const { draw, data, tree } = this;
  const sumHeight = viewRange.h; // rows.sumHeight(viewRange.sri, viewRange.eri + 1);
  const sumWidth = viewRange.w; // cols.sumWidth(viewRange.sci, viewRange.eci + 1);
  const nty = ty + h;
  const ntx = tx + w;
  // TODOTREE 设置tree的宽度
  const treeW = treeContainerWith(data.settings);

  draw.save();
  // draw rect background
  draw.attr(tableFixedHeaderCleanStyle);
  // TODOTREE 绘制左侧背景
  if (type === 'all' || type === 'left') {
    if(hasTree(data.settings)) {
      draw.fillRect(0, nty, treeW, sumHeight);
      draw.fillRect(treeW, nty, w - treeW - 1, sumHeight);
    }else {
      draw.fillRect(0, nty, w, sumHeight)
    }
  }
  if (type === 'all' || type === 'top') draw.fillRect(ntx, 0, sumWidth, h);

  const {
    sri, sci, eri, eci,
  } = data.selector.range;
  // console.log(data.selectIndexes);
  // draw text
  // text font, align...
  draw.attr(tableFixedHeaderStyle());
  // y-header-text
  if (type === 'all' || type === 'left') {
    data.rowEach(viewRange.sri, viewRange.eri, (i, y1, rowHeight) => {
      const y = nty + y1;
      const ii = i;
      
      // TODOTREE 设置左侧线条位置
      // draw.line([0, y], [w, y]);
      draw.line([treeW, y], [treeW, rowHeight]);
      tree.collapseTree(w, y, rowHeight, i);


      if (sri <= ii && ii < eri + 1) {
        renderSelectedHeaderCell.call(this, 0, y, w, rowHeight);
      }

      // TODOTREE 设置行号的位置
      // draw.fillText(ii + 1, w / 2, y + (rowHeight / 2));
      draw.fillText(ii + 1, (w - treeW) / 2 + treeW, y + (rowHeight / 2));

      if (i > 0 && data.rows.isHide(i - 1)) {
        draw.save();
        draw.attr({ strokeStyle: '#c6c6c6' });
        draw.line([5, y + 5], [w - 5, y + 5]);
        draw.restore();
      }
    });
    draw.line([0, sumHeight + nty], [w, sumHeight + nty]);
    draw.line([w, nty], [w, sumHeight + nty]);
  }
  // x-header-text
  if (type === 'all' || type === 'top') {
    data.colEach(viewRange.sci, viewRange.eci, (i, x1, colWidth) => {
      const x = ntx + x1;
      const ii = i;
      
      // TODO 设置表头内容
      draw.line([x, 0], [x, h]);

      
      if (sci <= ii && ii < eci + 1) {
        renderSelectedHeaderCell.call(this, x, 0, colWidth, h);
      }
      // TODO 此处设置表头文字内容
      draw.fillText(stringAt(ii), x + (colWidth / 2), h / 2);

      if (i > 0 && data.cols.isHide(i - 1)) {
        draw.save();
        draw.attr({ strokeStyle: '#c6c6c6' });
        draw.line([x + 5, 5], [x + 5, h - 5]);
        draw.restore();
      }
    });
    draw.line([sumWidth + ntx, 0], [sumWidth + ntx, h]);
    draw.line([0, h], [sumWidth + ntx, h]);
  }
  draw.restore();
}

// 设置左上角的单元格
function renderFixedLeftTopCell(fw, fh) {
  const { draw, data } = this;

  // TODOTREE 设置tree的宽度
  const treeW = treeContainerWith(data.settings);

  draw.save();
  // left-top-cell
  draw.attr({ fillStyle: '#f4f5f8' })
    .fillRect(treeW, 0, fw, fh);
  draw.restore();
}

function renderContentGrid({
  sri, sci, eri, eci, w, h,
}, fw, fh, tx, ty) {
  const { draw, data } = this;
  const { settings } = data;

  // TODOTREE 设置tree的宽度
  const treeW = treeContainerWith(settings);

  draw.save();
  draw.attr(tableGridStyle)
    .translate(fw + tx, fh + ty);
  // const sumWidth = cols.sumWidth(sci, eci + 1);
  // const sumHeight = rows.sumHeight(sri, eri + 1);
  // console.log('sumWidth:', sumWidth);
  draw.clearRect(0, 0, w, h);
  if (!settings.showGrid) {
    draw.restore();
    return;
  }

  // TODOTREE 渲染内容区域的border
  // console.log('rowStart:', rowStart, ', rowLen:', rowLen);
  data.rowEach(sri, eri, (i, y, ch) => {
    // console.log('y:', y);
    if (i !== sri) draw.line([treeW, y], [w + treeW, y]);
    if (i === eri) draw.line([treeW, y + ch], [w + treeW, y + ch]);
  });
  data.colEach(sci, eci, (i, x, cw) => {
    if (i !== sci) draw.line([x + treeW, 0], [x + treeW, h]);
    if (i === eci) draw.line([x + cw + treeW, 0], [x + cw + treeW, h]);
  });
  draw.restore();
}

/**
 * 设置冻结区域的位置
 */
function renderFreezeHighlightLine(fw, fh, ftw, fth) {
  const { draw, data } = this;
  
  // TODOTREE 设置tree的宽度
  const treeW = treeContainerWith(data.settings);

  const twidth = data.viewWidth() - fw;
  const theight = data.viewHeight() - fh;
  draw.save()
    .translate(fw, fh)
    .attr({ strokeStyle: 'rgba(75, 137, 255, .6)' });
  draw.line([treeW, fth], [twidth + treeW, fth]);
  draw.line([ftw + treeW, 0], [ftw + treeW, theight]);
  draw.restore();
}

/** end */
// TODOTREE 画树
class Table {
  constructor(el, data, tree) {
    this.el = el;
    this.draw = new Draw(el, data.viewWidth(), data.viewHeight());
    this.data = data;
    this.tree = tree;
  }

  resetData(data) {
    this.data = data;
    // console.log('table', data)
    this.render();
  }

  render() {
    // resize canvas
    const { data } = this;
    // console.log(data)
    const { rows, cols } = data;
    // fixed width of header
    const fw = cols.indexWidth;
    // fixed height of header
    const fh = rows.height;

    // TODOTREE 设置tree的宽度
    const treeW = treeContainerWith(data.settings);

    this.draw.resize(data.viewWidth(), data.viewHeight());
    this.clear();

    const viewRange = data.viewRange();
    // renderAll.call(this, viewRange, data.scroll);
    const tx = data.freezeTotalWidth();
    const ty = data.freezeTotalHeight();
    const { x, y } = data.scroll;
    
    // 清除树的内容 TODOTREE
    this.tree.clearAll();

    // 1
    renderContentGrid.call(this, viewRange, fw, fh, tx, ty);
    renderContent.call(this, viewRange, fw, fh, -x, -y);
    // TODOTREE
    renderFixedHeaders.call(this, 'all', viewRange, fw + treeW, fh, tx, ty);
    renderFixedLeftTopCell.call(this, fw, fh);
    const [fri, fci] = data.freeze;
    if (fri > 0 || fci > 0) {
      // 2
      if (fri > 0) {
        const vr = viewRange.clone();
        vr.sri = 0;
        vr.eri = fri - 1;
        vr.h = ty;
        renderContentGrid.call(this, vr, fw, fh, tx, 0);
        renderContent.call(this, vr, fw, fh, -x, 0);
        // TODOTREE
        renderFixedHeaders.call(this, 'top', vr, fw + treeW, fh, tx, 0);
      }
      // 3
      if (fci > 0) {
        const vr = viewRange.clone();
        vr.sci = 0;
        vr.eci = fci - 1;
        vr.w = tx;
        renderContentGrid.call(this, vr, fw, fh, 0, ty);
        // TODOTREE
        renderFixedHeaders.call(this, 'left', vr, fw + treeW, fh, 0, ty);
        renderContent.call(this, vr, fw, fh, 0, -y);
      }
      // 4
      const freezeViewRange = data.freezeViewRange();
      renderContentGrid.call(this, freezeViewRange, fw, fh, 0, 0);
      // TODOTREE
      renderFixedHeaders.call(this, 'all', freezeViewRange, fw + treeW, fh, 0, 0);
      renderContent.call(this, freezeViewRange, fw, fh, 0, 0);
      // 5
      renderFreezeHighlightLine.call(this, fw, fh, tx, ty);
    }

    //TODOTREE 6 左上角单元格编码显示
		const style = {
			textAlign: 'center',
			textBaseline: 'middle',
			font: `500 ${npx(12)}px Source Sans Pro`,
			fillStyle: '#585757',
			lineWidth: thinLineWidth(),
      strokeStyle: '#e6e6e6'
		};
		this.draw.attr(style);
		this.draw.fillText(stringAt(this.data.selector.ci) + (this.data.selector.ri + 1), fw / 2 + treeW, (25 / 2));
  }

  clear() {
    this.draw.clear();
  }
}

export default Table;

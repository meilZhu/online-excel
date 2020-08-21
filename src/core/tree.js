/*
 * @file: 
 * @Date: 2020-07-29 13:42:09
 * @author: manyao.zhu
 */ 
//  TODOTREE
// 每个单元格占的宽度
const treeCellW = 25;

// 获取树的宽度
function treeContainerWith(settings) {
    return (settings && settings.tree && settings.tree.show) ? settings.tree.maxLength * treeCellW : 0;
}


// 获取最大层级树
function treeLevel(settings) {
    return (settings && settings.tree && settings.tree.maxLength) ? settings.tree.maxLength : 0;
}

// 是否有树
function hasTree(settings) {
    return settings.tree && settings.tree.show
}


export default {};
export {
    treeCellW,
    treeContainerWith,
    hasTree,
    treeLevel
};
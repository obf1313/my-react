/**
 * @description: render 阶段
 * @author: cnn
 * @createTime: 2022/6/6 16:30
 **/
import React from 'react';
/**
 * render 阶段开始于 performSyncWorkOnRoot 或 PerformConcurrentWorkOnRoot 方法的调用。
 * 这取决于本次更新是同步更新还是异步更新。
 * 我们现在还不需要学习这两个方法，只需要知道在这两个方法中会调用如下两个方法：
**/
// 同步
// performSyncWorkOnRoot 会调用该方法
// function workLoopSync() {
//     while (workInProgress !== null) {
//         performUnitOfWork(workInProgress);
//     }
// }

// 并发
// performConcurrentWorkOnRoot 会调用该方法
// function workLoopConcurrent() {
//     while (workInProgress !== null && !shouldYield()) {
//         performUnitOfWork(workInProgress);
//     }
// }
/**
 * 可以看到，他们唯一的区别是是否调用 shouldYield。
 * 如果当前浏览器帧没有剩余时间，shouldYield 会中止循环，直到浏览器有空闲时间后再继续遍历。
 * workInProgress 代表当前已创建的 workInProgress fiber。
 * performUnitOfWork 方法会创建下一个 Fiber 节点并赋值给 workInProgress，并将 workInProgress 与已创建的 Fiber 节点连接起来构成 Fiber 树。
 * https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1599
 * 我们知道 Fiber Reconciler 是从 Stack Reconciler 重构而来，通过遍历的方式实现可中断的递归，所以 performUnitOfWork 的工作可以分为两部分：“递” 和 “归”。
**/
// "递"阶段
/**
 * 首先从 rootFiber 开始向下深度优先遍历。为遍历到的每个 Fiber 节点调用 beginWork 方法。
 * https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L3058
 * 该方法会根据传入的 Fiber 节点创建子 Fiber 节点，并将这两个 Fiber 节点连接起来。
 * 当遍历到叶子节点（即没有子组件的组件）时就会进入“归”阶段。
**/
// "归"阶段
/**
 * 在“归”阶段会调用 completeWork 处理 Fiber 节点。
 * 当某个 Fiber 节点执行完 completeWork，如果其存在兄弟 Fiber 节点（即 fiber.sibling !== null），会进入其兄弟 Fiber 的“递”阶段。
 * 如果不存在兄弟 Fiber，会进入父级 Fiber 的“归”阶段。
 * “递”和“归”阶段会交错执行直到“归”到 rootFiber。至此，render 阶段的工作就结束了。
**/
function App() {
    return (
        <div>
            i am
            <span>CNN</span>
        </div>
    );
}
export default App;
/**
 * render 阶段会依次执行：
 * 1. rootFiber beginWork
 * 2. App Fiber beginWork
 * 3. div Fiber beginWork
 * 4. "i am" Fiber beginWork
 * 5. "i am" Fiber completeWork
 * 6. span Fiber beginWork
 * 7. span Fiber completeWork
 * 8. div Fiber completeWork
 * 9. App Fiber completeWork
 * 10. rootFiber completeWork
**/
/**
 * 注意：
 * 之所以没有 “CNN” Fiber 的 beginWork/completeWork，是因为作为一种性能优化手段，
 * 针对只有单一文本子节点的 Fiber，React 会特殊处理。
**/
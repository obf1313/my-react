/**
 * @description: Fiber 架构的工作原理
 * Fiber 节点可以保存对应的 DOM 节点。
 * 相应的，Fiber 节点构成的 Fiber 树就对应 DOM 树。
 * 那么如何更新 DOM 呢？这需要用到被称为“双缓存”的技术。
 * @author: cnn
 * @createTime: 2022/5/26 15:56
 **/
import React, { useState } from 'react';
// 什么是 “双缓存”
/**
 * 当我们用 canvas 绘制动画，每一帧绘制前都会调用 ctx.clearRect 清除上一帧的画面。
 * 如果当前帧画面计算量比较大，导致清除上一帧画面到绘制当前帧画面之间有较长间隙，就会出现白屏。
 * 为了解决这个问题，我们可以在内存中绘制当前帧动画，绘制完毕后直接用当前帧替换上一帧画面，
 * 由于省去了两帧替换间的计算时间，不会出现从白屏到出现画面的闪烁情况。
 * 这种在内存中构建并直接替换的技术叫做双缓存。
 * React 使用“双缓存”来完成 Fiber 树的构建与替换——对应着 DOM 树的创建与更新。
 **/
// 双缓存 Fiber 树
/**
 * 在 React 中最多会同时存在两棵 Fiber树。
 * 当前屏幕上显示内容对应的 Fiber 树称为 current Fiber 树，
 * current Fiber 树中的 Fiber 节点被称为 current fiber。
 * 正在内存中构建的 Fiber 树称为 workInProgress Fiber 树，
 * workInProgress Fiber 树中的 Fiber 节点被称为 workInProgress fiber。
 * 他们通过 alternate 属性连接。
 **/
// currentFiber.alternate === workInProgressFiber;
// workInProgressFiber.alternate === currentFiber;
/**
 * React 应用的根节点通过使 current 指针在不同 Fiber 树的 rootFiber 间切换来完成 current Fiber 树指向的切换。
 * （这里就跟调试源码那里能够结合起来看了，当时就有看到 root.current）
 * 即当 workInProgress Fiber 树构建完成交给 Renderer 渲染在页面上后，
 * 应用根节点的 current 指针指向 workInProgress Fiber 树，
 * 此时 workInProgress Fiber 树就变为 current Fiber 树。
 * 每次状态更新都会产生新的 workInProgress Fiber 树，通过 current 与 workInProgress 的替换，完成 DOM 更新。
 * 接下来我们以具体例子讲解 mount 时、update 时的构建/替换流程。
 **/
function APP() {
	const [num, add] = useState(0);
	return (
		<p onClick={() => add(num + 1)}>{num}</p>
	)
}
export default APP;
// mount 时
/**
 * 1. 首次执行 ReactDOM.render 会创建 fiberRootNode（源码中叫 fiberRoot，整个应用的根节点）和 rootFiber（<App/>所在组件树的根节点）。
 *    之所以要区分 fiberRootNode（整个应用的根节点） 与 rootFiber
 *    是因为在应用中我们可以多次调用 ReactDOM.render 渲染不同的组件树，他们会拥有不同的 rootFiber。
 *    但是整个应用的根节点只有一个，那就是 fiberRootNode。
 *    fiberRootNode 的 current 会指向当前页面上已渲染内容对应 Fiber 树，即 current Fiber 树。
 *    fiberRootNode.current = rootFiber;
 *    由于是首屏渲染，页面中还没有挂载任何 DOM，所以 fiberRootNode.current 指向的 rootFiber 没有任何子 Fiber 节点（即 current Fiber 树为空）。
 * 2. 接下来进入 render 阶段，根据组件返回的 JSX 在内存中依次创建 Fiber 节点并连接在一起构建 Fiber 树，被称为 workInProgress Fiber 树。
 *    （下图中右侧为内存中构建的树，左侧为页面显示的树）
 *    在构建 workInProgress Fiber 树时会尝试复用 current Fiber 树中已有的 Fiber 节点内的属性，在首屏渲染时只有 rootFiber 存在对应的 current fiber（即 rootFiber.alternate）。
 *    fiberRootNode.current = rootFiber;
 *    rootFiber.alternate = rootFiber(内存中构建的) -> APP -> p -> 0;
 * 3. 图中右侧已构建完的 workInProgress Fiber 树在 commit 阶段渲染到页面。
 *    此时 DOM 更新为右侧树对应的样子。fiberRootNode 的 current 指针指向 workInProgress Fiber 树使其变为 current Fiber 树。
 *    fiberRootNode.current = rootFiber(workInProgress Fiber) -> APP -> p -> 0;
 **/
// update 时
/**
 * 1. 接下来我们点击 p 节点触发状态改变，这会开启一次新的 render 阶段并构建一棵新的 workInProgress Fiber 树。
 *       fiberRootNode.current = rootFiber -> App -> p -> 0
 *   （workInProgress Fiber）rootFiber -> App -> p -> 1
 *   （workInProgress Fiber）rootFiber.alternate = rootFiber
 *   rootFiber.alternate = （workInProgress Fiber）rootFiber
 *   ...其余同上，除了0 和 1 todo why
 *   和 mount 时一样，workInProgress fiber 的创建可以复用 current Fiber 树对应的节点数据。
 *   （这个决定是否复用的过程就是 Diff 算法，后面章节会详细讲解）
 * 2. workInProgress Fiber 树在 render 阶段完成构建后进入 commit 阶段渲染到页面上。
 *    渲染完毕后，workInProgress Fiber  树变为 current Fiber 树。
 *    fiberRootNode.current = rootFiber(workInProgress Fiber) -> APP -> p -> 1;
 **/
// 总结
/**
 * 本文介绍了 Fiber 树的构建与替换过程，这个过程伴随着 DOM 的更新。
 * 那么在构建过程中每个 Fiber 节点具体是如何创建的呢？我们会在架构篇的 render 阶段讲解。
 **/
// 第一章完成，介绍术语：
/**
 * Reconciler 工作的阶段被称为 render 阶段，因为在该阶段会调用组件的 render 方法。
 * Renderer 工作的阶段被称为 commit 阶段。就像你完成一个需求的编码后执行 git commit 提交代码。commit 阶段会把 render 阶段提交的信息渲染在页面上。
 * render 与 commit 阶段统称为 work，即 React 在工作中。相对应的，如果任务正在 Scheduler 内调度，就不属于 work。
 **/
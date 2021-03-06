/**
 * @description: Fiber 架构的实现原理
 * 在新的 React 架构一节中，我们提到的虚拟 DOM 在 React 中有个正式的称呼——Fiber。
 * @author: cnn
 * @createTime: 2022/5/26 13:54
 **/
// Fiber 的起源
/**
 * 在 React15 及以前，Reconciler 采用递归的方式创建虚拟 DOM，递归过程是不能中断的。如果组件树的层级很深，递归会占用线程很多时间，造成卡顿。
 * 为了解决这个问题，React16 将递归的无法中断的更新重构为异步的可中断更新，由于曾经用于递归的虚拟 DOM 数据结构已经无法满足需要。
 * 于是，全新的 Fiber 架构应运而生。
 **/

// Fiber 的含义
/**
 * Fiber包含三层含义：
 * 1. 作为架构来说，之前 React15 的 Reconciler 采用递归的方式执行，数据保存在递归调用栈中，所以被称为 stack Reconciler。
 *    React16 的 Reconciler 基于 Fiber 节点实现，被称为 Fiber Reconciler。
 * 2. 作为静态的数据结构来说
 *    每个 Fiber 节点对应一个 React element，保存了该组件的类型（函数组件/类组件/原生组件...）、对应的 DOM 节点等信息。
 * 3. 作为动态的工作单元来说
 *    每个 Fiber 节点保存了本次更新中该组件改变的状态、要执行的工作（需要被删除/被插入页面中/被更新...）。
 **/

/**
 * Fiber 的结构
 * 你可以从这里看到 Fiber 节点的属性定义。
 * https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiber.new.js#L117
 * 虽然属性很多，但我们可以按三层含义将他们分类来看：
 **/
// function FiberNode(
// 	tag: WorkTag,
// 	pendingProps: mixed,
// 	key: null | string,
// 	mode: TypeOfMode
// ) {
// 	// 作为静态数据结构的属性
// 	this.tag = tag; // Fiber 对应组件的类型 Function/Class/Host...
// 	this.key = key; // key 属性，有助于渲染？
// 	this.elementType = null; // 大部分情况同 type，某些情况不同，比如 FunctionComponent 使用 React.memo 包裹。
// 	this.type = null; // 对于 FunctionComponent，指函数本身，对于 ClassComponent，指 class，对于 HostComponent，指 DOM 节点 tagName。
// 	this.stateNode = null; // Fiber 对应的真实 DOM 节点。
//
// 	// 用于连接其他 Fiber 节点形成 Fiber 树
// 	// 为什么父级指针叫做 return 而不是 parent 或者 father 呢？
// 	// 因为作为一个工作单元，return 指节点执行完 completeWork（本章后面会介绍）后会返回的下一个节点。
// 	// 子 Fiber 节点及其兄弟节点完成工作后会返回其父级节点，所以用 return 指代父级节点。
// 	this.return = null; // 父级 Fiber 节点
// 	this.child = null; // 子节点
// 	this.sibling = null; // 右边第一个兄弟节点
// 	this.index = 0; // ?
// 	this.ref = null; // dom 结构？
//
// 	// 作为动态的工作单元的属性
// 	this.pendingProps = pendingProps; // ?
// 	this.memoizedProps = null; // ?
// 	this.updateQueue = null; // ?
// 	this.memoizedState = null; // ?
// 	this.dependencies = null; // ?
// 	this.mode = mode; // ?
// 	this.effectYag = null; // ?
// 	this.nextEffect = null; // ?
// 	this.firstEffect = null; // ?
// 	this.lastEffect = null; // ?
//
// 	// 调度优先级相关
// 	// 如下两个字段保存调度优先级相关的信息，会在讲解 Scheduler 时介绍。todo callback
// 	this.lanes = NoLanes; // ?
// 	this.childLanes = NoLanes; // ?
//
// 	// 指向该 fiber 在上一个更新时对应的 fiber
// 	this.alternate = null;
// }

// 作为架构来说
/**
 * 每个Fiber节点有个对应的 React element，多个 Fiber 节点是如何连接形成树呢？靠如下三个属性：
 **/
this.return = null; // 父级 Fiber 节点
this.child = null; // 子节点
this.sibling = null; // 右边第一个兄弟节点
// 举个例子，如下的组件结构：
function APP() {
	return (
		<div>
			i am
			<span>KaSong</span>
		</div>
	)
}
// APP.child = div;
// div.return = APP;
// div.child = (i am);
// (i am).return = div;
// (i am).sibling = span;
// span.return = div;
// span.child = (KaSong);
// (KaSong).return = span;

/**
 * 作为静态的数据结构
 * 作为一种静态的数据结构，保存了组件相关的信息：
 **/
this.tag = tag; // Fiber 对应组件的类型 Function/Class/Host...
this.key = key; // key 属性，有助于渲染？
this.elementType = null; // 大部分情况同 type，某些情况不同，比如 FunctionComponent 使用 React.memo 包裹。
this.type = null; // 对于 FunctionComponent，指函数本身，对于 ClassComponent，指 class，对于 HostComponent，指 DOM 节点 tagName。
this.stateNode = null; // Fiber 对应的真实 DOM 节点。


/**
 * 作为动态的工作单元
 * 作为动态的工作单元，Fiber 中如下参数保存了本次更新相关的信息，我们会在后续的更新流程中使用到具体属性时再详细介绍。todo callback
 **/
// 保存本次更新造成的状态改变相关信息
this.pendingProps = pendingProps; // ?
this.memoizedProps = null; // ?
this.updateQueue = null; // ?
this.memoizedState = null; // ?
this.dependencies = null; // ?
this.mode = mode; // ?

// 保存本次更新会造成的 DOM 操作
this.effectYag = null; // ?
this.nextEffect = null; // ?
this.firstEffect = null; // ?
this.lastEffect = null; // ?

/**
 * 注意
 * 在 2020 年 5 月，调度优先级策略经历了比较大的重构。
 * 以 expirationTime 属性为代表的优先级模型被 lane 取代。详见这个 PR
 * https://github.com/facebook/react/pull/18796
 * 如果你的源码中 fiber.expirationTime 仍存在，请参照调试源码章节获取最新代码。
 **/

/**
 * 总结
 * 本节我们了解了 Fiber 的起源与架构，其中 Fiber 节点可以构成 Fiber 树。
 * 参考资料：https://www.bilibili.com/video/BV1it411p7v6?from=search&seid=3508901752524570226
 **/
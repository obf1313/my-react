/**
 * @description: 新的 React 架构
 * @author: cnn
 * @createTime: 2022/5/26 12:09
 **/
// React 16 架构
/**
 * Scheduler 调度器 --- 调度任务的优先级，高优任务优先进入 Reconciler
 * Reconciler 协调器 --- 找出变化的组件
 * Renderer 渲染器 --- 负责将变化的组件渲染到页面上
 * 可以看到，相较于 React15，React16 中新增了 Scheduler（调度器），让我们来了解下他。
 **/
// Scheduler 调度器
/**
 * 既然我们以浏览器是否有剩余时间作为任务中断的标准，那么我们需要一种机制，当浏览器有剩余时间时通知我们。
 * requestIdleCallback，浏览器已经实现了这个 API，但是由于以下因素，React 放弃使用：
 * 1. 浏览器兼容性。
 * 2. 触发频率不稳定，受很多因素影响。比如当我们的浏览器切换 tab 后，之前 tab 注册的 requestIdleCallback 触发的频率会变得很低。
 * 基于以上原因，React 实现了功能更完备的 requestIdleCallbackpolyfill，这就是 Scheduler。
 * 除了在空闲时触发回调的功能外，Scheduler 还提供了多种调度优先级供任务设置。
 * （原来如此，结果没用这个了呀）
 **/
// Reconciler 协调器
/**
 * 在 React15 中 Reconciler 是递归处理虚拟 DOM 的。
 * React 16 中的 Reconciler：
 * 我们可以看见，更新工作从递归变成了可以中断的循环过程。
 **/
// function workLoopConcurrent() {
// 	// Perform work until Scheduler asks us to yield
// 	// 每次循环都会调用 shouldYield 判断当前是否有剩余时间
// 	while(workInProgress !== null && !shouldYield()) {
// 		workInProgress = performUnitOfWork(workInProgress);
// 	}
// }
/**
 * 那么 React16 是如何解决中断更新时 DOM 渲染不完全的问题呢？
 * 在 React16 中，Reconciler 与 Renderer 不再是交替工作。
 * 当 Scheduler 将任务交给 Reconciler 后，Reconciler 会为变化的虚拟 DOM 打上代表增/删/更新的标记，类似这样：
 * 全部标记见：
 * https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactSideEffectTags.js
 **/
export const Placement = /*             */ 0b0000000000010;
export const Update = /*                */ 0b0000000000100;
export const PlacementAndUpdate = /*    */ 0b0000000000110;
export const Deletion = /*              */ 0b0000000001000;
/**
 * 整个 Scheduler 与 Reconciler 的工作都在内存中进行。
 * 只有当所有组件都完成 Reconciler 的工作，才会统一交给 Renderer。
 **/

// Renderer 渲染器
/**
 * Renderer 根据 Reconciler 为虚拟 DOM 打的标记，同步执行对应的 DOM 操作。
 * react 16.12.0
 * react-dom 16.12.0
 * react-scripts 3.0.1
 **/
export default class APP extends React.Component {
	constructor() {
		super();
		this.state = {
			count: 1
		};
	}
	onClick() {
		this.setState({
			count: this.state.count + 1
		});
	}
	render() {
		return (
			<ul>
				<button onClick={() => this.onClick()}>乘以{this.state.count}</button>
				<li>{1 * this.state.count}</li>
				<li>{2 * this.state.count}</li>
				<li>{3 * this.state.count}</li>
			</ul>
		);
	}
}
// 整个流程为：
/**
 * 1. 点击 button，产生一个更新，更新内容为 state.count 从 1 变 2。
 * 2. Scheduler 接收到更新，查看是否有其他更高休闲级需要先执行。
 *    没有，将 state.count 从 1 变 2，交给 Reconciler。
 * 3. Reconciler 接收到更新，diff 哪些更新会造成 虚拟 DOM 变化？
 *    li > 1 变成 li > 2，打上 UPDATE 标记，以此类推，直到没有其他变化，将打了标记的 虚拟 DOM 交给 Renderer。
 * 4. 接受到通知，遍历虚拟 DOM，将打了标记的所有节点进行 更新 DOM 的操作。
 **/
/**
 * 2，3 步骤随时可能由于以下原因被中断：
 * ① 有其他更高优任务需要先更新。
 * ② 当前帧没有剩余时间。
 * 由于红框中的工作都在内存中进行，不会更新页面上的 DOM，所以即使反复中断，用户也不会看见更新不完全的 DOM（即上一节演示的情况）。
 **/
// 实际上，由于 Scheduler 和 Reconciler 都是平台无关的，所以 React 为他们单独发了一个包 react-Reconciler。
// https://www.npmjs.com/package/react-reconciler
// 你可以用这个包自己实现一个 ReactDOM，具体见下方视频。
// https://www.youtube.com/watch?v=CGpMlWVcHok&list=PLPxbbTqCLbGHPxZpw4xj_Wwg8-fdNxJRh&index=7

// 总结
/**
 * React16 采用 Fiber Reconciler。
 * todo 作者有个 同步/Debounce/Throttle/并发 情况下性能对比 Demo
 * https://codesandbox.io/s/concurrent-3h48s?file=/src/index.js
 **/
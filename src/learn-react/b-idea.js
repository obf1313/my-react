/**
 * @description: React 理念
 * @author: cnn
 * @createTime: 2022/5/25 23:08
 **/
/**
 * 官网理念：
 * 我们认为，React 是用 JavaScript 构建快速响应的大型 Web 应用程序的首选方式。
 * 它在 Facebook 和 Instagram 上表现优秀。
 *
 * 关键是 快速响应
 * 制约快速响应的因素：
 * 1. 当遇到大计算量的操作或者设备性能不足使页面掉帧，导致卡顿。（CPU 的瓶颈）
 * 2. 发送网络请求后，由于需要等待数据返回才能进一步操作导致不能快速响应。（IO 的瓶颈）
 **/

// CPU 瓶颈
/**
 * 当项目变得庞大、组件数量繁多时，就容易遇到 CPU 的瓶颈。
 * 考虑如下 Demo，我们向视图中渲染 3000 个 li：
 * 主流浏览器刷新频率为 60Hz，即每（1000ms / 60Hz）16.6ms 浏览器刷新一次。
 * JS 可以操作 DOM，GUI 渲染线程与 JS 线程是互斥的。
 * 所以 JS 脚本执行和浏览器布局、绘制不能同时执行。
 * 在每 16.6ms 时间内，需要完成如下工作：
 * JS 脚本执行 -----  样式布局 ----- 样式绘制
 * 当 JS 执行时间过长，超出了16.6ms，这次刷新就没有时间执行样式布局和样式绘制了。
 * 在 Demo 中，由于组件数量繁多（3000个），JS 脚本执行时间过长，页面掉帧，造成卡顿。
 * 使用 performance 查看堆栈图 Evaluate Script 占据了 160ms，远远多于一帧的时间。
 **/
 // 如何解决这个问题呢？
 /**
 * 在浏览器每一帧的时间中，预留一些时间给 JS 线程，React 利用这部分时间更新组件（可以看到，在源码中，预留的初始时间是 5ms）。
 * https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/scheduler/src/forks/SchedulerHostConfig.default.js#L119
 * 当预留的时间不够用时，React 将线程控制权交还给浏览器使其有时间渲染 UI，React 则等待下一帧时间到来继续被中断的工作。
 **/
// 这种将长任务分拆到每一帧中，像蚂蚁搬家一样一次执行一小段任务的操作，被称为时间切片（time slice）
/**
 * 通过 React 提供的 ReactDOM.createRoot(root).render(node)，开启 Concurrent Mode。
 * 此时我们的长任务被拆分到每一帧不同的 task 中，JS 脚本执行时间大体在 5ms 左右。
 * 这样浏览器就有剩余时间执行样式布局和样式绘制，减少掉帧的可能性。 todo 因为我用不了这个方法所以无法测试。
 * 但是在我看 React 18+ 新特性时开启并发并不会直接这样，需要配合并发特性使用 useTransition / useDeferredValue。
 * 所以，解决 CPU 瓶颈的关键是实现时间切片，而时间切片的关键是：将同步的更新变为可中断的异步更新。
 **/
function App() {
	const len = 3000;
	return (
		<ul>
			{Array(len).fill(0).map((_, i) => <li>{i}</li>)}
		</ul>
	);
}
export default App;

// IO 的瓶颈
/**
 * 网络延迟是前端开发者无法解决的。如何在网络延迟客观存在的情况下，减少用户对网络延迟的感知？
 * React 给出的答案是将人机交互研究的结果整合到真实的 UI 中。
 * https://17.reactjs.org/docs/concurrent-mode-intro.html#putting-research-into-production
 * 这里我们以业界人机交互最顶尖的苹果举例，在 IOS 系统中：
 * 设置”面板中的“通用”，进入“通用”界面：
 * 作为对比，再点击“设置”面板中的“Siri与搜索”，进入“Siri与搜索”界面：
 * （好吧我试了感觉不到区别）
 * 事实上，点击“通用”后的交互是同步的，直接显示后续界面。
 * 而点击“Siri与搜索”后的交互是异步的，需要等待请求返回后再显示后续界面。
 * 但从用户感知来看，这两者的区别微乎其微。
 * 这里的窍门在于：点击“Siri与搜索”后，先在当前页面停留了一小段时间，这一小段时间被用来请求数据。
 * 为此，React 实现了Suspense 功能及配套的 hook —— useDeferredValue。todo 原来这两个是配套的？
 * 而在源码内部，为了支持这些特性，同样需要将同步的更新变为可中断的异步更新。todo How?
 **/
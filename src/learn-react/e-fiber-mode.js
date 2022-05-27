/**
 * @description: Fiber 架构的心智模型
 * React 核心团队成员 Sebastian Markbåge （React Hooks 的发明者）曾说：
 * 我们在 React 中做的就是践行代数效应（Algebraic Effects）。
 * @author: cnn
 * @createTime: 2022/5/26 12:56
 **/
// 什么是代数效应
/**
 * 代数效应 是 函数式编程 中的一个概念，用于将副作用从函数调用中分离。
 * 接下来我们用 虚构的语法 来解释。
 * 假设我们有一个函数 getTotalPicNum，传入 2 个用户名称后，分别查找该用户在平台保存的图片数量，最后将图片数量相加后返回。
 **/
/**
 * 在 getTotalPicNum 中，我们不关注 getPicNum 的实现，只在乎“获取到两个数字后将他们相加的结果返回”这一过程。
 * 接下来我们来实现 getPicNum。
 * "用户在平台保存的图片数量"是保存在服务器中的。
 * 所以，为了获取该值，我们需要发起异步请求。
 * 为了尽量保持 getTotalPicNum 的调用方式不变，我们首先想到了使用 async await：
 * 但是，async await 是有传染性的 —— 当一个函数变为 async 后，
 * 这意味着调用他的函数也需要是 async，这破坏了getTotalPicNum 的同步特性。
 * 有没有什么办法能保持 getTotalPicNum 保持现有调用方式不变的情况下实现异步请求呢？
 * 没有。不过我们可以虚构一个。(也没有啊，async 返回一个 promise，个人见解)
 * 我们虚构一个类似 try...catch 的语法 —— try...handle 与两个操作符 perform、resume。
 **/
// function getTotalPicNum(user1, uer2) {
// 	const picNum1 = getPicNum(user1);
// 	const picNum2 = getPicNum(user2);
// 	return picNum1 + picNum2;
// }
// function getPicNum(name) {
// 	const picNum = perform name;
// 	return picNum;
// }
// try {
// 	getTotalPicNum('one', 'two');
// } handle (who) {
// 	switch (who) {
// 		case 'one':
// 			resume with 230;
// 		case 'weo':
// 			resume with 122;
// 		default:
// 			resume with 0;
// 	}
// }
/**
 * 虚构的流程如下：
 * 1. 当执行到 getTotalPicNum 内部的 getPicNum 方法时，会执行 perform name。
 *    此时函数调用栈会从 getPicNum 方法内跳出，被最近一个 try...handle 捕获。
 *    类似 throw Error 后被最近一个 try...catch 捕获。
 *    类似throw Error 后 Error 会作为 catch 的参数，perform name 后 name 会作为 handle 的参数。
 * 2. 与 try...catch 最大的不同在于：当 Error 被 catch 捕获后，之前的调用栈就销毁了。
 *    而 handle 执行 resume 后会回到之前 perform 的调用栈。
 *    对于 case 'kaSong'，执行完 resume with 230; 后调用栈会回到 getPicNum，此时 picNum === 230。
 **/
/**
 * 总结一下：
 * 代数效应 能够将 副作用（例子中为请求图片数量）从函数逻辑中分离，使函数关注点保持纯粹。
 * 并且，从例子中可以看出，perform resume 不需要区分同步异步。
 **/

// 代数效应在 React 中的应用
/**
 * 那么代数效应与 React 有什么关系呢？最明显的例子就是 Hooks。
 * 对于类似 useState、useReducer、useRef 这样的 Hook，我们不需要关注 FunctionComponent 的 state 在 Hook 中是如何保存的，React 会为我们处理。
 * 我们只需要假设 useState 返回的是我们想要的 state，并编写业务逻辑就行。
 **/
function APP() {
	// state 和函数无关，通过 useState 实现。
	const [num, setNum] = useState(0);
	return (
		<button onClick={() => setNum(num => num + 1)}>{num}</button>
	)
}
/**
 * 如果这个例子还不够明显，可以看看官方的 Suspense Demo。
 * 在 Demo 中 ProfileDetails 用于展示用户名称。而用户名称是异步请求的。
 * 但是 Demo 中完全是同步的写法。
 * （看了一下，貌似这种同步的写法是依赖于 Suspense 的）
 * https://codesandbox.io/s/frosty-hermann-bztrp?file=/src/index.js:152-160
 **/
// function ProfileDetails() {
// 	const user = resource.user.read();
// 	return <h1>{user.name}</h1>;
// }

// 代数效应与 Generator
/**
 * 从 React15 到 React16，协调器（Reconciler）重构的一大目的是：将老的同步更新的架构变为异步可中断更新。
 * 异步可中断更新可以理解为：更新在执行过程中可能会被打断（浏览器时间分片用尽或有更高优任务插队），当可以继续执行时恢复之前执行的中间状态。
 * 这就是代数效应中 try...handle 的作用。
 * 其实，浏览器原生就支持类似的实现，这就是 Generator。（拥有一个函数块内暂停和恢复代码执行的能力）。
 * 但是 Generator 的一些缺陷使 React 团队放弃了他：
 * 1. 类似 async，Generator 也是传染性的，使用了 Generator 则上下文的其他函数也需要作出改变。这样心智负担比较重。
 * 2. Generator 执行的中间状态是上下文关联的。
 **/
// function * doWork(A, B, C) {
// 	var x = doExpensiveWorkA(A);
// 	yield;
// 	var y = x + doExpensiveWorkB(B);
// 	yield;
// 	var z = y + doExpensiveWorkB(C);
// 	return z;
// }
/**
 * 每当浏览器有空闲时间都会依次执行其中一个 doExpensiveWork，当时间用尽则会中断，当再次恢复时会从中断位置继续执行。
 * 只考虑“单一优先级任务的中断与继续”情况下 Generator 可以很好的实现异步可中断更新。
 * 但是当我们考虑“高优先级任务插队”的情况，如果此时已经完成 doExpensiveWorkA 与 doExpensiveWorkB 计算出 x 与 y。
 * 此时 B 组件接收到一个高优更新，由于 Generator 执行的中间状态是上下文关联的，所以计算 y 时无法复用之前已经计算出的 x，需要重新计算。
 * 如果通过全局变量保存之前执行的中间状态，又会引入新的复杂度。
 * https://github.com/facebook/react/issues/7942#issuecomment-254987818
 * 基于这些原因，React 没有采用 Generator 实现协调器。
 **/
// 代数效应与 Fiber
/**
 * Fiber 并不是计算机术语中的新名词，他的中文翻译叫做纤程，与进程（Process）、线程（Thread）、协程（Coroutine）同为程序执行过程。
 * 协程：协程并没有增加线程数量，只是在线程的基础之上通过分时复用的方式运行多个协程。
 * 在很多文章中将纤程理解为协程的一种实现。在 JS 中，协程的实现便是 Generator。
 * 所以，我们可以将纤程(Fiber)、协程(Generator)理解为代数效应思想在 JS 中的体现。
 * React Fiber 可以理解为：
 * React 内部实现的一套状态更新机制。
 * 支持任务不同优先级，可中断与恢复，并且恢复后可以复用之前的中间状态。
 * 其中每个任务更新单元为 React Element 对应的 Fiber 节点。
 **/
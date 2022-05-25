/**
 * @description: 构造 DOM 节点，渲染使用 Fiber，可以使用函数组件，且能使用带状态的如 useState。
 * https://pomb.us/build-your-own-react/
 * @author: cnn
 * @createTime: 2022/5/22 22:41
 **/
const Didact = {
	createElement,
	render,
	useState
};

function createElement(type, props, ...children) {
	const el = {
		type,
		props: {
			...props,
			// React 不会包装原始值或创建空数组当这里不是 children 的时候。
			children: children.map(child => {
				return typeof child === 'object' ? child : createTextElement(child);
			})
		}
	};
	return el;
}
//
function createTextElement(text) {
	return {
		type: 'TEXT_ELEMENT',
		props: {
			nodeValue: text,
			children: []
		}
	}
}

// 使用 createElement 生成 element
// const element = Didact.createElement(
// 	'div',
// 	{ id: 'foo' },
// 	Didact.createElement('a', null, 'bar'),
// 	Didact.createElement('b')
// );

// 但如果我们还想使用 JSX 怎么办？
// 使用这样的注解就可以告诉 babel 我们这里用了 JSX，当 babel 翻译 JSX 的时候就会用我们定义的函数了。
// /** @jsx Didact.createElement */
// const element = (
// 	<div id="foo">
// 		<a>bar</a>
// 		<b />
// 	</div>
// );

/**
 * React 渲染方法实现
 **/
// function render(element, container) {
// 	// 如果是文本元素，则创建文本元素
// 	// 构建元素
// 	const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);
// 	const isProperty = key => key !== 'children';
// 	// 过滤是 children 的元素属性
// 	Object.keys(element.props).filter(isProperty).forEach(name => {
// 		dom[name] = element.props[name];
// 	});
// 	// 为子元素每一个构建元素
// 	element.props.children.forEach(child => render(child, dom));
// 	// 添加到容器元素中
// 	container.appendChild(dom);
// }

// render(element, container);
// --------------------------------------------------------------------------------------

// 这里使用递归是有问题的，一旦我们开始渲染，直到完成整棵 dom 树之前我们都无法停止
// 如果这棵 dom 树很大，将会阻止主线程很长一段时间，如果浏览器要做一些高优先级的事
// 比如处理用户输入，保持动画流畅，当前方法不得不等到渲染完成才能做

// 所以我们将工作拆分成更小的单元
// 当我们完成任意一单元后可以让浏览器打断 rendering 如果他有任何需要做的。

let nextUnitOfWork = null;
let wipRoot = null;
// 目前为止我们只能对 DOM 进行添加操作，那更新和删除应该如何进行呢？
// 我们需要将 render 接收到的 element 和上一次 fiber tree 提交到 DOM 中的进行比较。
// 所以我们需要保存一个上一次提交的 root
let currentRoot = null;
let deletions = null;

function workLoop(deadline) {
	let shouldYield = false;
	while (nextUnitOfWork && !shouldYield) {
		// 为了使用 loop 我们需要设置 work 的第一单元。
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
		shouldYield = deadline.timeRemaining() < 1;
	}
	if (!nextUnitOfWork && wipRoot) {
		commitRoot();
	}
	// window.requestIdleCallback() 方法插入一个函数，这个函数将在浏览器空闲时期被调用。
	// 这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。
	// 函数一般会按先进先调用的顺序执行，然而，如果回调函数指定了执行超时时间timeout，则有可能为了在超时前执行函数而打乱执行顺序。
	// 我们使用 requestIdleCallback 进行一次循环，你可以将它想象成 setTimeout
	// 但是并不是我们告诉它什么时候运行，而是当主线程空闲的时候浏览器将运行一个回调告诉它什么时候运行。
	// React 不再使用 requestIdleCallback，现在使用 scheduler package，但是本例中我们仍使用 requestIdleCallback。
	// requestIdleCallback 也给我们一个 deadline 参数，我们可以使用它去检查在浏览器需要再采取控制之前有多少时间。
	requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

// 为了组织不同的工作单元，我们需要一种数据架构：fiber tree
// 每个元素都需要有一个 fiber 节点，每个 fiber 节点都是一个工作单元。
// 假设我们想要渲染一个 element tree 如下：
// Didact.render(
// 	<div>
// 		<h1>
// 			<p />
// 			<a />
// 		</h1>
// 		<h2 />
// 	</div>,
// 	container
// );
function createDom(fiber) {
	const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);
	updateDom(dom, {}, fiber.props);
	return dom;
}
// 事件监听属性我们要用不同的方式处理它
const isEvent = key => key.startsWith('on');
const isProperty = key => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);
function updateDom(dom, prevProps, nextProps) {
	// 移除或者改变事件监听器，后面那个 isNew()() 啥意思啊
	Object.keys(prevProps).filter(isEvent).filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key)).forEach(name => {
		const eventType = name.toLowerCase().substring(2);
		dom.removeEventListener(eventType, prevProps[name]);
	});
	// 移除在新 prop 中没有的属性
	Object.keys(prevProps).filter(isProperty).filter(isGone(prevProps, nextProps)).forEach(name => {
		dom[name] = '';
	});
	// 设置新属性
	Object.keys(nextProps).filter(isProperty).filter(isNew(prevProps, nextProps)).forEach(name => {
		dom[name] = nextProps[name]
	});
	// 添加事件监听器
	Object.keys(nextProps).filter(isEvent).filter(isNew(prevProps, nextProps)).forEach(name => {
		const eventType = name.toLowerCase().substring(2);
		// React 实际上还有事件机制，并不会挂载到这上面。
		dom.addEventListener(eventType, nextProps[name]);
	})
}
// 一旦我们完成整个工作（next unit of work 不存在的时候）
// 我们将提交整个 fiber tree 到 dom 中
// 这里才是真的将所有节点渲染到 DOM 上的地方
function commitRoot() {
	// 这里是为啥啊？是因为被删除了，所以 wipRoot 里就没有这个节点了。
	deletions.forEach(commitWork);
	// 这个不就足够了吗？
	commitWork(wipRoot.child);
	currentRoot = wipRoot;
	wipRoot = null;
}
function commitWork(fiber) {
	if (!fiber) {
		return;
	}
	// 现在我们有一些 fibers（函数组件节点）没有 DOM nodes，我们需要改两点。
	// 首先，要找 parent DOM 节点，我们需要向上回溯 fiber tree
	// 直到我们找到一个 fiber 有 DOM node。
	// const domParent = fiber.parent.dom;
	let domParentFiber = fiber.parent;
	while (!domParentFiber.dom) {
		domParentFiber = domParentFiber.parent;
	}
	const domParent = domParentFiber.dom;
	// 创建新节点
	if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
		domParent.appendChild(fiber.dom);
	} else if (fiber.effectTag === 'DELETION') {
		// 当我们移除节点时我们也需要向下找到 child 有 DOM node 的。
		commitDeletion(fiber, domParent);
		// domParent.removeChild(fiber.dom);
	} else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
		updateDom(fiber.dom, fiber.alternate.props, fiber.props);
	}
	commitWork(fiber.child);
	commitWork(fiber.sibling);
}
function commitDeletion(fiber, domParent) {
	if (fiber.dom) {
		domParent.removeChild(fiber.dom);
	} else {
		commitDeletion(fiber.child, domParent);
	}
}
// 在 render 函数中，我们将创建 root fiber，然后设置它为 nextUnitWork。
function render(element, container) {
	// 相反的，我们需要保留追踪 fiber tree 的根。
	// nextUnitOfWork = {
	wipRoot = {
		dom: container,
		props: {
			children: [element]
		},
		// 一个找到 old fiber 的属性，上一次我们提交到 DOM 的 fiber root。
		alternate: currentRoot,
	};
	deletions = [];
	nextUnitOfWork = wipRoot;
}
// fiber tree 的数据结构的其中一个目标是找到下一个工作单元
// 这也是为什么每一个 fiber 中都有其 first child，next sibling 和 parent 的 link。
// 当我们完成一个 fiber 的执行工作时，子节点将成为下一个工作单元的 fiber。
// 比如例子中，完成 div fiber，下一个就是 h1 fiber。
// 如果没有子节点，则兄弟节点成为下一个工作单元。
// 比如 p fiber 完成后，将完成 a fiber。
// 当有没有子节点也没有兄弟节点时，就去找叔叔节点。
// 比如 a fiber 完成后去找 h2 fiber。
// 如果也没有叔叔节点了，我们将通过父节点们一直找，直到到了 root 节点。
// 如果我们接触到 root 节点，那意味着我们完成了这次的所有渲染工作。
// 剩下的工作都交给了performUnitOfWork 函数，这里有三件事是我们要做的。
// 1. 将 element 加到 DOM 中。
// 2. 为 element's children 创建 fibers。
// 3. 选择下一个工作单元。
// 执行工作单元，且返回下一工作单元
function performUnitOfWork(fiber) {
	// 处理函数组件
	// 1. 函数组件的 fiber 没有 DOM node，即 fiber.dom 并不是真的 dom。
	// 2. 函数组件的 children 也不是直接从 props 中直接取的。
	const isFunctionComponent = fiber.type instanceof Function;
	if (isFunctionComponent) {
		updateFunctionComponent(fiber);
	} else {
		updateHostComponent(fiber);
	}
	// 3. 返回下一个工作单元
	// 有儿子返回儿子
	if (fiber.child) {
		return fiber.child;
	}
	let nextFiber = fiber;
	while (nextFiber) {
		// 没儿子返回兄弟
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		}
		// 没兄弟返回爸爸的兄弟
		nextFiber = nextFiber.parent;
	}
	// 都没了就不返回了
}
// 当前运行的 fiber
let wipFiber = null;
let hookIndex = null;
// 处理函数组件
function updateFunctionComponent(fiber) {
// 当前运行的 fiber
	wipFiber = fiber;
	// hookIndex 追踪当前的 hook Index
	hookIndex = 0;
	// 给 fiber 添加 hooks 数组支持同时建立多个 useState 在一个组件中。
	wipFiber.hooks = [];
	// 获取 children，为什么这么取？todo 是因为 JSX 解析吗
	// 那里能证明 type 是我们的 App Function，因为标签是 App 吗。
	// 在我们的例子中，fiber.type 是 App Function，当我们 run 它的时候，将会返回 h1 element。
	// 所以当我们得到 children 时，将会以之前的方式同样操作。
	const children = [fiber.type(fiber.props)];
	reconcileChildren(fiber, children);
	// 注意，函数节点没有建立 dom 节点。
}
function useState(initial) {
	// 当函数组件调用 useState 我们检查是否有旧的 hook。
	const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];
	// 如果有，我们直接使用 state 值，没有就使用初始值。
	const hook = {
		state: oldHook ? oldHook.state : initial,
		queue: []
	};
	// 但是我们还没有运行 action。
	// 我们在下一次渲染组件时运行，我们从 hook.queue 中获取所有的 actions
	// 然后依次运行它们以获得新的值，所以当我们返回 state 的时候它们已经更新了。
	// useState 也应该返回一个函数去更新其值，所以我们定义 setState 函数，接收一个 action。
	const actions = oldHook ? oldHook.queue : [];
	actions.forEach(action =>{
		hook.state = action(hook.state);
	});
	const setState = action => {
		// 我们将 action push 进 hook.queue 中。
		hook.queue.push(action);
		console.log(hook.queue);
		// 然后我们做一些在 render 中做的相同的事情
		// 设置一个新的 work 在 progress root 作为下一个工作单元
		// 所以 work loop 可以开始一次新的渲染阶段
		wipRoot = {
			dom: currentRoot.dom,
			props: currentRoot.props,
			alternate: currentRoot
		};
		nextUnitOfWork = wipRoot;
		deletions = [];
	};
	// 可能有多个 hook
	wipFiber.hooks.push(hook);
	hookIndex++;
	// 然后我们将新的 hook 添加到 fiber 中，将 hookIndex 加 1，然后返回 state。
	return [hook.state, setState];
}
// 处理普通组件
function updateHostComponent(fiber) {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber);
	}
	const elements = fiber.props.children;
	reconcileChildren(fiber, elements);
}
// 此处我们将调和 old fibers 和 新的 elements
function reconcileChildren(wipFiber, elements) {
	let index = 0;
	let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
	let prevSibling = null;
	// 上一个孩子的兄弟
	// let prevSibling = null;
	// while (index < elements.length) {
	while (index < elements.length || oldFiber != null) {
		// 我们需要比较 old fibers 和 elements 之间改变
		const element = elements[index];
		let newFiber = null;
		const sameType = oldFiber && element && element.type === oldFiber.type;
		// 此处 React 使用了 keys，能够让调和器更好，比如，当 children 改变位置在数组中。
		// 1. 如果 old fiber 和 新的 element 是同一 type，我们保留 DOM node 仅仅更新 props。
		if (sameType) {
			newFiber = {
				type: oldFiber.type,
				props: element.props,
				dom: oldFiber.dom,
				parent: wipFiber,
				alternate: oldFiber,
				// 我们将在 commit 阶段使用它
				effectTag: 'UPDATE'
			};
		}
		// 2. 如果 type 不同且有一个新的 element，这就意味着我们需要创建一个新的 DOM 节点。
		if (element && !sameType) {
			newFiber = {
				type: element.type,
				props: element.props,
				dom: null,
				parent: wipFiber,
				alternate: null,
				// 我们将在 commit 阶段使用它
				effectTag: 'PLACEMENT'
			};
		}
		// 3. 如果 type 不同，但又有一个 old fiber，我们需要移除 old node。
		if (oldFiber && !sameType) {
			oldFiber.effectTag = 'DELETION';
			deletions.push(oldFiber);
		}
		// 这个是为什么？todo
		if (oldFiber) {
			oldFiber = oldFiber.sibling;
		}
		// 第一个儿子作为儿子
		if (index === 0) {
			wipFiber.child = newFiber;
		}
		// 之后的都是作为上一个孩子的兄弟
		else if (element) {
			prevSibling.sibling = newFiber;
		}
		prevSibling = newFiber;
		index++;
	}
}
// 实现 Hooks，让我们的函数组件能够拥有状态。
// ----------------------------------使用--------------------------------------
/** @jsxRuntime classic */
/** @jsx Didact.createElement */
function Counter() {
	const [state, setState] = Didact.useState(1);
	const [aa, setAA] = Didact.useState(1);
	return (
		<h1 onClick={() => setState(c => c + 1)}>
			<button onClick={() => {
				setAA(a => a + 'a');
				setAA(a => a + 'a');
				setAA(a => a + 'a');
			}}>+a</button>
			Count: { state }
			Test: { aa }
		</h1>
	)
}
const element = <Counter />;
const container = document.getElementById('root');
Didact.render(element, container);
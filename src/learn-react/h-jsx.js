/**
 * @description: JSX 简介
 * @author: cnn
 * @createTime: 2022/5/30 22:38
 **/
import React from 'react';
// JSX 简介
/**
 * JSX 在编译时会被 Babel 编译为 React.createElement 方法。
 * 这也是为什么在每个使用JSX的JS文件中，你必须显式的声明。
 * 可以通过设置改变，且 17 后不需要显示引入了。
 * https://zh-hans.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html
 * JSX 并不是只能被编译为 React.createElement 方法，你可以通过 @babel/plugin-transform-react-jsx 插件显式告诉 Babel 编译时需要将 JSX 编译为什么函数的调用（默认为 React.createElement）。
 **/
// React.createElement

/**
 * 既然 JSX 会被编译为 React.createElement，让我们看看他做了什么：
 **/
// export function createElement(type, config, children) {
// 	let propName;
// 	const props = {};
// 	let key = null;
// 	let ref = null;
// 	let self = null;
// 	let source = null;
// 	if (config != null) {
// 		// 将 config 处理后赋值给 props
// 		// ...
// 	}
// 	const childrenLength = arguments.length - 2;
// 	// 处理 children，会被赋值给 props.children
// 	// ...
// 	// 处理 defaultProps
// 	// ...
// 	// React.createElement 最终会调用 ReactElement 方法返回一个包含组件数据的对象，
// 	// 该对象有个参数 $$typeof: REACT_ELEMENT_TYPE 标记了该对象是个 React Element。
// 	return ReactElement(
// 		type,
// 		key,
// 		ref,
// 		self,
// 		source,
// 		ReactCurrentOwner.current,
// 		props
// 	);
// }
// const ReactElement = function (type, key, ref, self, source, owner, props) {
// 	const element = {
// 		// 标记这是个 React Element
// 		$$typeof: REACT_ELEMENT_TYPE,
// 		type,
// 		key,
// 		ref,
// 		props,
// 		_owner: owner
// 	};
// 	return element;
// };
// React 提供了验证合法 React Element 的全局 API React.isValidElement
// 可以看到，$$typeof === REACT_ELEMENT_TYPE 的非 null 对象就是一个合法的 React Element
// export function isValidElement(object) {
// 	return (
// 		typeof object === 'object' &&
// 			object !== null &&
// 			object.$$typeof === REACT_ELEMENT_TYPE
// 	)
// }
// React Component
/**
 * 在 React 中，我们常使用 ClassComponent 与 FunctionComponent 构建组件。
 **/
export class AppClass extends React.Component {
	render() {
		return <p>13</p>;
	}
}
console.log('这是 ClassComponent:', AppClass);
console.log('这是 Element:', <AppClass />);

export function AppFunc() {
	return <p>13</p>;
}
console.log('这是 FunctionComponent:', AppFunc);
console.log('这是 Element:', <AppFunc />);
/**
 * ClassComponent 对应的 Element 的 type 字段为 AppClass 自身。
 * FunctionComponent 对应的 Element 的 type 字段为 AppFunc 自身。
 * 值得注意的一点，由于无法通过引用类型区分 ClassComponent 和 FunctionComponent。
 * AppClass instanceof Function === true;
 * AppFunc instanceof Function === true;
 * React 通过 ClassComponent 实例原型上的 isReactComponent 变量判断是否是 ClassComponent。
 * ClassComponent.prototype.isReactComponent = {}
 **/
// JSX 与 Fiber 节点
/**
 * 从上面的内容我们可以发现，JSX 是一种描述当前组件内容的数据结构，他不包含组件 schedule、reconcile、render 所需的相关信息。
 * 比如如下信息就不包括在 JSX 中：
 * 1. 组件在更新中的优先级。
 * 2. 组件的 state。
 * 3. 组件被打上的用于 Renderer 的标记。
 * 这些内容都包含在 Fiber 节点中。
 * 所以，在组件 mount 时，Reconciler 根据 JSX 描述的组件内容生成组件对应的 Fiber 节点。
 * 在 update 时，Reconciler 将 JSX 与 Fiber 节点保存的数据对比，生成组件对应的 Fiber 节点，并根据对比结果为 Fiber 节点打上标记。
 **/

/**
 * @description: 老的 React 架构
 * @author: cnn
 * @createTime: 2022/5/25 23:51
 **/
import React from 'react';
/**
 * React 从 v15 升级到 v16 后重构了整个架构。
 * 接下来聊聊 V15，Stack reconciler。
 * React15 架构可以分为两层：
 * 1. Reconciler（协调器）—— 负责找出变化的组件
 * 2. Renderer（渲染器）—— 负责将变化的组件渲染到页面上
 **/
// Reconciler（协调器）
/**
 * 我们知道，在 React 中可以通过 this.setState、this.forceUpdate、ReactDOM.render 等 API 触发更新。
 * 每当有更新发生时，Reconciler 会做如下工作：
 * 1. 调用函数组件，class 组件 的 render 方法，将返回的 JSX 转化为虚拟 DOM。
 * 2. 将虚拟 DOM 和上次更新时的虚拟 DOM 对比。
 * 3. 通过对比找出本次更新中变化的虚拟 DOM。
 * 4. 通知 Renderer 将变化的虚拟 DOM 渲染到页面上。
 * https://zh-hans.reactjs.org/docs/codebase-overview.html#reconcilers
 **/
// Renderer（渲染器）
/**
 * 渲染器用于管理一棵 React 树，使其根据底层平台进行不同的调用。
 * 由于 React 支持跨平台，所以不同平台有不同的 Renderer。
 * 我们前端最熟悉的是负责在浏览器环境渲染的 Renderer —— ReactDOM (opens new window)。
 * 除此之外，还有：
 * 1. ReactNative 渲染器，渲染 App 原生组件。
 * 2. ReactTest 渲染器，渲染出纯 JS 对象用于测试。
 * 3. ReactArt 渲染器，渲染到 Canvas / SVG 或 VML（VML 相当于 IE 里面的画笔 IE8）。
 * 在每次更新发生时，Renderer 接到 Reconciler 通知，将变化的组件渲染在当前宿主环境。
 * https://zh-hans.reactjs.org/docs/codebase-overview.html#renderers
 **/
// React15 架构的缺点
/**
 * 在 Reconciler 中，mount 的组件会调用mountComponent，update 的组件会调用 updateComponent。
 * 这两个方法都会递归更新子组件。
 * https://github.com/facebook/react/blob/15-stable/src/renderers/dom/shared/ReactDOMComponent.js#L498
 * https://github.com/facebook/react/blob/15-stable/src/renderers/dom/shared/ReactDOMComponent.js#L877
 **/
// 递归更新的缺点
/**
 * 由于递归执行，所以更新一旦开始，中途就无法中断。
 * （递归会不断向函数调用栈 push 函数上下文，且无法终端）
 * 当层级很深时，递归更新时间超过了16ms，用户交互就会卡顿。
 * 用 可中断的异步更新 代替 同步更新，那么 R15 支持吗？
 * 这货同一个例子用了两次，一次在 老的架构 一次在 新的架构。
 * updateComponent _updateDOMChildren 这个方法（只是我个人看调用栈得出的结果）
 * react 15.0.1
 * react-dom 15.0.1
 * react-scripts 2.0.1
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
/**
 * 因为 Reconciler 和 Renderer 是交替工作的，所以一旦中断更新，页面显示就不会同步。
 **/
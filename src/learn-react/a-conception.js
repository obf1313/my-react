/**
 * @description: react 学习
 * @author: cnn
 * @createTime: 2022/5/25 20:03
 **/
import { useState } from 'react';
// 以下三个都是独立的 npm 包可以独立使用。
/**
 * 1. schedule 调度，更新优先级排序，高优先级进入 render。
 * scheduler 与平台无关
 * 优先级队列，用到的数据结构是“小顶堆”
 * 需要了解浏览器渲染原理，需要了解宏任务微任务区别（用到的 API 是 MessageChannel）
 * MessageChannel: MessageChannel 接口允许我们创建一个新的消息通道，并通过它的两个 MessagePort 属性发送数据。
 * 优先级模型：lane 模型，调度更新优先级，需要了解 二进制掩码。
 **/
/**
 * 2. render 协调，根据更新决定要改变哪些视图。
 * reconciler 与平台无关（fiber）
 * dfs 深度优先遍历
 * update 用的单向链表，单向有环列表。
 * fiber 并发模型，类似于 Generator，React 自己写了个 Generator。
 **/
/**
 * 3. commit 渲染，把需要改变的视图做具体的操作。
 * renderer 与平台相关
 * 浏览器对应的就是：ReactDOM
 * React-Native 对应的是：ReactNative
 * 渲染成 SVG 或者 Canvas：ReactArt
 * 通过浏览器使用 performance 查看调用栈后发现有 commitRoot 方法
 * 该方法打断点后发现 commit 阶段是以同步的方式进行更新的。
 **/

/**
 * 类比
 * hooks 相当于能使开发者操作底层的一些流程。
 * classComponent 相当于强行增加了一层。
 **/
// view 视图               软件、应用
// class 生命周期函数                 -> 符合人脑认知
// hooks                   操作系统
// React 底层运行流程      硬件

// 建议看看 hooks 源码，对日常开发很有用。
// 推荐这本书：https://react.iamkasong.com

// 探索前端边界，遇到瓶颈怎么做呢。
// IM（即时通讯）应用，富文本编辑器，可视化方向，工程化，前端框架。

/**
 * 理解 React 思想
 * ClassComponent --- 面向对象
 * FunctionComponent --- 函数式编程
 * 代数效应：解决函数式编程里副作用的问题，Hooks 的出现，其实是因为要解决 React 函数式编程中没有状态的问题。
 * state -> view
 **/

/**
 * 简单 React demo 读源码。
 **/
export default function App() {
	const [num, updateNum] = useState(0);
	const increment = () => {
		// dispatchAction 的上一层调用堆栈就是 increment 里的 updateNumber
		// 也就是说 updateNumber 调用的就是 dispatchAction
		updateNum(num + 1);
	};
	return (
		<div>
			<p onClick={increment}>{num}</p>
		</div>
	)
}
/**
 * 以下方法都可以在 react.development.js 中找到。
 * commit 阶段的 commitRoot 方法参数 root
 * root - 指向根 fiber
 * root.current - 指向当前执行到的 fiber
 * root.current.nextEffect - 指向下一个 fiber 节点（如果有其他 fiber 节点也发生了变化）
 * 这是个链表，如果还有下一个就指向再下一个。
 * 最终会把这条链表给 commit 阶段，commit 遍历这条链表看他要执行哪些操作。
 **/
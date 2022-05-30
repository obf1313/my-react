/**
 * @description: 渲染入口
 * @author: cnn
 * @createTime: 2022/5/25 20:54
 **/
import React from 'react';
import ReactDOM from 'react-dom';
// import App from './learn-react/a-conception';
// import App from './learn-react/b-idea';
// import App from './learn-react/c-old';
// import App from './learn-react/d-new';
import App from './learn-react/g-fiber-work';
import { AppClass } from './learn-react/h-jsx';

const root = document.getElementById('root');

// a-conception
// ReactDOM.render(<App />, root);

// b-idea
// 接下来我们开启 Concurrent Mode（后续章节会讲到，当前你只需了解开启后会启用时间切片）
// 这里不知道为什么没办法用，先跳过 todo
// const { unstable_createRoot: createRoot } = ReactDOM;
// createRoot(root).render(<App />);

// c-old，stack
ReactDOM.render(<App />, root);

/**
 * FiberRootNode
 **/
// ReactDOM.render(<A />, domA); // rootFiberA <FiberRootNode>
// ReactDOM.render(<B />, domB); // rootFiberB
// ReactDOM.render(<C />, domC); // rootFiberC
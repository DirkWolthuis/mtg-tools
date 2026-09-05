import { render } from 'preact';
import { App } from './App.js';
import './styles/index.css';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Missing #app root element');
}

render(<App />, container);

import { drawSVG } from './svg';

drawSVG();

const darkModeInput = document.getElementById('darkMode');
darkModeInput?.addEventListener('change', (event) => {
  const isCheked = (event.target as HTMLInputElement).checked;

  document.documentElement.style.setProperty('--color-scheme', isCheked ? 'dark' : 'light');
  document.documentElement.style.setProperty('--blue', isCheked ? 'lightblue' : 'blue');
  document.documentElement.style.setProperty('--green', isCheked ? 'lightgreen' : 'green');
  document.documentElement.style.setProperty('--red', isCheked ? 'lightcoral' : 'red');
  document.documentElement.style.setProperty('--gray', isCheked ? 'lightgray' : 'gray');
  document.documentElement.style.setProperty('--grid', isCheked ? 'gray' : 'lightgray');
  document.documentElement.style.setProperty('--content', isCheked ? 'white' : 'black');
});

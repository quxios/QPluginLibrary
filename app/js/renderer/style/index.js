import themes from './themes'

let themeElements = [];
themes.forEach((theme) => {
  let link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = `css/${theme}.css`;
  link.id = theme;
  link.disabled = true;
  document.head.appendChild(link);
  themeElements.push(link);
})

export { themeElements }
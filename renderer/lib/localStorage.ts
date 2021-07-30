export const getItem = (key: string) => {
  if (localStorage && localStorage.getItem(key)) {
    console.log(localStorage.getItem(key));
    return JSON.parse(localStorage.getItem(key));
  } return undefined;
}

export const setItem = (key: string, value: any) => {
  if (localStorage) {
    localStorage.setItem(key, JSON.stringify(value));
  }
} 
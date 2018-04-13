
export const Logger = {
  log: (msg: any) => {
    const txtarea: HTMLTextAreaElement | null = document.querySelector('#log');
    if (!txtarea) {
      return;
    }
    txtarea.value += JSON.stringify(msg) + "\n";
    txtarea.scrollTop = txtarea.scrollHeight;
    console.log(msg);
  }
};


export const pixelInputToCanvasCoord = (event: any, canvas: HTMLCanvasElement) => {
  var x = event.clientX,
    y = event.clientY,
    rect = event.target.getBoundingClientRect();
  x = x - rect.left;
  y = rect.bottom - y;
  return { x, y };
};

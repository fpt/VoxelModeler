
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


export const pixelInputToCanvasCoord = (clientX: number, clientY: number, canvas: HTMLCanvasElement) => {
  let x = clientX;
  let y = clientY;
  const rect = canvas.getBoundingClientRect();

  x = x - rect.left;
  y = rect.bottom - y;

  return { x, y };
};

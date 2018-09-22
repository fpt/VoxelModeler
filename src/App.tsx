import * as React from "react";
import * as ReactDOM from "react-dom";
import { withState, compose, lifecycle } from "recompose";
import styled, { injectGlobal } from 'styled-components'

import { VoxmoCanvas } from './Canvas';
import { ColorPicker } from './ColorPicker';
import { IState, state } from './State';

injectGlobal`
  body {
    margin: 0;
    padding: 0;
  }
`;

const LogArea = styled.textarea`
  width: 50%;
  height: 100px;
`;

const CanvasOuter = styled.div`
  width: 100%;
  height: 80%;
`;

const ColorBoxOuter = styled.div`
  display: flex;
  flex-direction: row;
`;

const ColorBox = styled.div`
  width: 32px;
  height: 32px;
  background-color: ${props => props.color};
  margin: 3px;
`;

const ActiveColorBox = styled.div`
  width: 32px;
  height: 32px;
  background-color: ${props => props.color};
  border: 3px solid black;
`;

const colorsList: Array<[string, number]> = [
  ['white', 0xFFFFFF],
  ['silver', 0x808080],
  ['black', 0x000000],
  ['red', 0xFF0000],
  ['green', 0x00FF00],
  ['blue', 0x0000FF],
  ['yellow', 0xFFFF00],
  ['bisque', 0xFFE4C4],
  ['brown', 0xA52A2A],
];

const colorToCode: (color: string) => number = (color) => {
  const col = colorsList.find(k => k[0] === color);
  return col ? col[1] : colorsList[0][1];
}

const VoxmoAppBase: React.StatelessComponent<{ selectedColor: string, setSelectedColor: (color: string) => string }> =
  ({ selectedColor, setSelectedColor }) => (
    <>
      <ColorPicker colorsList={colorsList} selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
      <CanvasOuter>
        <VoxmoCanvas colorCode={colorToCode(selectedColor)} />
      </CanvasOuter>
      <div>
        <h4>Usage:</h4>
        <ul>
          <li>Select and click to add a cube</li>
          <li>Press 'x' to delete</li>
        </ul>
      </div>
    </>
  );
// <LogArea id="log" />

const VoxmoApp = withState<{}, string, 'selectedColor', 'setSelectedColor'>('selectedColor', 'setSelectedColor', colorsList[0][0])(VoxmoAppBase);

// main

ReactDOM.render(
    <VoxmoApp />,
    document.querySelector("#root")
);

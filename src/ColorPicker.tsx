import * as React from "react";
import * as ReactDOM from "react-dom";
import { withState, compose, lifecycle } from "recompose";
import styled from 'styled-components'


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

interface OuterProps {
  colorsList: Array<[string, number]>;
  selectedColor: string;
  setSelectedColor: (color: string) => string;
}

export const ColorPicker: React.StatelessComponent<OuterProps> =
  ({ colorsList, selectedColor, setSelectedColor }) => (
    <ColorBoxOuter>
      {colorsList.map(k => selectedColor === k[0] ? (
          <ActiveColorBox
            key={k[0]}
            color={k[0]}
          />
        ) : (
          <ColorBox
            key={k[0]}
            color={k[0]}
            onClick={() => setSelectedColor(k[0])}
          />
        )
      )}
    </ColorBoxOuter>
  );

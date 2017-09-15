import { PUTextArea } from '../components/textarea';
import * as React from 'react';

interface IHelloProps {};

interface IHelloState {};

export class Hello extends React.Component<IHelloProps, IHelloState> {
  render() {
    return (
      <div>
        <PUTextArea />
      </div>
    );
  }
}

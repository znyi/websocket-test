import { Button } from 'antd'
import { useSerial } from './providers/SerialProvider';

function App() {

  const {
    portState,
    connect,
    disconnect,
    writePort,
  } = useSerial()

  return (
    <>
      <Button onClick={connect} disabled={portState === "open" ? true : false}>connect (serial port)</Button>
      <Button onClick={disconnect} disabled={portState === "closed" ? true : false}>disconnect (serial port)</Button>
      

      <Button onClick={async () => {
        await writePort([
          2,
          21,
          3,
          0,
          13,
          1,
          1,
          44,
          1,
          0,
          3,
          1,
          1,
          0,
          0,
          14,
          1,
          1,
          0
      ])
        await writePort([
          2,
          21,
          5,
          2,
          1,
          1,
          1,
          1,
          2,
          3,
          1,
          1,
          0,
          2,
          4,
          1,
          3,
          0,
          4,
          0,
          21,
          0,
          24,
          2,
          6,
          1,
          1,
          1,
          2,
          7,
          1,
          1,
          35
      ])
      await writePort([
        2,
        21,
        2,
        0,
        1,
        1,
        1,
        2,
        2,
        1,
        1,
        1,
        2
    ])
      }} disabled={portState === "closed" ? true : false}>try commutation setting start (serial port)</Button>
      <Button onClick={async () => {
        await writePort([
          2,
          20,
          2,
          0,
          14,
          1,
          1,
          2
      ])
      }} disabled={portState === "closed" ? true : false}>try commutation setting set negative (serial port)</Button>
    </>
  )
}

export default App

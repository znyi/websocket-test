import useWebSocket from 'react-use-websocket'
import { Button } from 'antd'

function App() {
    const socketUrl = 'ws://localhost:8082';

    const {
      sendMessage,
      sendJsonMessage,
      lastMessage,
      lastJsonMessage,
      readyState,
      getWebSocket,
    } = useWebSocket(socketUrl, {
      onOpen: () => console.log('opened'),
      shouldReconnect: (closeEvent) => true,
    });

    return (
      <>
        <Button onClick={()=>getWebSocket().send('Client say hello')}>hello</Button>
      </>
    )
  }

export default App

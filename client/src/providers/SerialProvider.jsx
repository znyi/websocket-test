import useWebSocket from 'react-use-websocket'
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import LineBreakTransformer from "../utils/LineBreakTransformer"

const defaultPortSettings = {
    baudRate: 115200,
    bufferSize: 255,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: 'none',
}

export const SerialContext = createContext();

export const useSerial = () => useContext(SerialContext);

const SerialProvider = ({
    children,
}) => {

    const socketUrl = 'ws://localhost:8082';
    const {
      getWebSocket,
    } = useWebSocket(socketUrl, {
      onOpen: () => console.log('websocket opened'),
      onMessage: (msgEvent) => console.log(msgEvent.data),
      shouldReconnect: (closeEvent) => true,
    });

    const [canUseSerial] = useState(() => "serial" in navigator);

    const [portState, setPortState] = useState("closed");

    const portRef = useRef(null);
    const readerRef = useRef(null);
    const readerClosedPromiseRef = useRef(Promise.resolve());

    /**
     * Reads from the given port until it's been closed.
     *
     * @param port the port to read from
     */
    const readUntilClosed = async (port) => {
        if (port.readable) {
            const lineBreakTransformStream = new TransformStream(
                new LineBreakTransformer()
            )
            const readableStreamClosed = port.readable.pipeTo(lineBreakTransformStream.writable);
            readerRef.current = lineBreakTransformStream.readable.getReader();

            try {
                console.log('start reading')
                while (true) {
                    const { value, done } = await readerRef.current.read();
                    if (done) {
                        break;
                    }
                    getWebSocket().send(value)
                }
            } catch (error) {
                console.error(error);
            } finally {
                readerRef.current.releaseLock();
            }

            await readableStreamClosed.catch(() => { }); // Ignore the error
            console.log('stop reading')
        }
    };

    /**
     * Attempts to open the given port.
     */
    const openPort = async (port) => {
        try {
            await port.open(defaultPortSettings);
            portRef.current = port;
            setPortState("open");
        } catch (error) {
            setPortState("closed");
            console.error("Could not open port");
        }
    };

    const manualConnectToPort = async () => {
        if (canUseSerial && portState === "closed") {
            setPortState("opening");
            try {
                const port = await navigator.serial.requestPort();
                await openPort(port);
                return true;
            } catch (error) {
                setPortState("closed");
                console.error("User did not select port");
            }
        }
        return false;
    };

    const manualDisconnectFromPort = async () => {
        if (canUseSerial && portState === "open") {
            const port = portRef.current;
            if (port) {
                setPortState("closing");

                // Cancel any reading from port
                readerRef.current?.cancel();
                await readerClosedPromiseRef.current;
                readerRef.current = null;

                // Close and nullify the port
                await port.close();
                portRef.current = null;

                // Update port state
                setPortState("closed");
            }
        }
    };

    /**
     * Event handler for when the port is disconnected unexpectedly.
     */
    const onPortDisconnect = async () => {
        // Wait for the reader to finish it's current loop
        await readerClosedPromiseRef.current;
        // Update state
        readerRef.current = null;
        readerClosedPromiseRef.current = Promise.resolve();
        portRef.current = null;
        setPortState("closed");
    };

    // Handles attaching the reader and disconnect listener when the port is open
    useEffect(() => {
        const port = portRef.current;
        if (portState === "open" && port) {
            // When the port is open, read until closed
            const aborted = { current: false };
            readerRef.current?.cancel();
            readerClosedPromiseRef.current.then(() => {
                if (!aborted.current) {
                    readerRef.current = null;
                    readerClosedPromiseRef.current = readUntilClosed(port);
                }
            });

            // Attach a listener for when the device is disconnected
            navigator.serial.addEventListener("disconnect", onPortDisconnect);

            return () => {
                aborted.current = true;
                navigator.serial.removeEventListener("disconnect", onPortDisconnect);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [portState]);

    const writePort = async (bufferToWrite) => {
        const writer = portRef.current.writable.getWriter()
        try {
            var mybuf = new Uint8Array(bufferToWrite)
            await writer.write(mybuf)
            console.log('write value -', mybuf)
        } catch (error) {
            console.error('Error in writePort:', error)
        } finally {
            writer.releaseLock()
        }
    }

    const contextValue = {
        canUseSerial,
        portState,
        connect: manualConnectToPort,
        disconnect: manualDisconnectFromPort,
        writePort,
    }
    
    return (
        <SerialContext.Provider
            value={contextValue}
        >
            {children}
        </SerialContext.Provider>
    );
};

export default SerialProvider;
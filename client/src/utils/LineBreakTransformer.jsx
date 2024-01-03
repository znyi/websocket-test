import filterEvenElements from "./filterEvenElements"

class LineBreakTransformer {
    terminator = [0x0d, 0x0a] //\r\n
    terminatorIndex

    constructor() {
        this.container = []
    }

    transform(chunk, controller) {
        chunk.forEach((elem) => this.container.push(elem))
        this.terminatorIndex = this.indexOfSubarray(
            this.container,
            this.terminator
        )
        while (this.terminatorIndex !== -1) {
            const line = this.container.slice(
                0,
                this.terminatorIndex + this.terminator.length
            )
            
            controller.enqueue(filterEvenElements(line.slice(0, -2))) //parse as normal array, take even elems, exclude \r and \n  
            //controller.enqueue(filterEvenElements(Uint8Array.from(line.slice(0, -2)))) //parse as uint8 array, take even elems, exclude \r and \n  

            this.container = this.container.slice(
                this.terminatorIndex + this.terminator.length
            )
            this.terminatorIndex = this.indexOfSubarray(
                this.container,
                this.terminator
            )
        }
    }

    flush(controller) {
        if (this.container.length > 0) {
            controller.enqueue(new Uint8Array(this.container))
        }
    }

    indexOfSubarray(array, subArray) {
        for (let i = 0; i <= array.length - subArray.length; i++) {
            if (
                this.arraysEqual(array.slice(i, i + subArray.length), subArray)
            ) {
                return i
            }
        }
        return -1
    }

    arraysEqual(arr1, arr2) {
        return (
            arr1.length === arr2.length &&
            arr1.every((value, index) => value === arr2[index])
        )
    }
}

export default LineBreakTransformer
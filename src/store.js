import once_cell from 'once_cell'
import { ref } from 'vue'

export const Store = once_cell('store', () => ref({
    self_code: rand_code(),
    peer_code: '000'
}).value)

export function rand_code() {
    return new Array(3)
        .fill(0)
        .map(() => Math.floor(Math.random() * 10))
        .join('')
}
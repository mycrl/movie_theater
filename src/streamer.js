'use strict'

import EventEmitter from './events'

/**
 * 设备类型
 * 
 * @readonly
 */
export const DeviceKind = {
    Audio: 'audioinput',
    Video: 'videoinput',
}

/**
 * 默认请求媒体类型配置
 * 
 * @readonly
 */
export const DefaultConstraints = {
    video: true,
    audio: true,
}

/**
 * 系统设备ID
 * 
 * @readonly
 */
export const SystemDeviceIds = [
    'default', 
    'communications',
]

/**
 * 媒体流
 * 
 * @class
 */
export class Streamer extends EventEmitter {
    
    /**
     * @param {object} options
     * @constructor
     */ 
    constructor(options) {
        super()
        this._to = null
        this._options = options
        this._ws = new WebSocket(this._options.signaling)
        this._connection = new RTCPeerConnection(this._options.rtc)
        this._init()
    }
    
    /**
     * @param {string} label
     * @retutns {string}
     * @public
     */
    static getDeviceName(label) {
        const name = label.replace(/\(([0-9]|[a-z]){4}:([0-9]|[a-z]){4}\)/g, '')
        return name.includes('(') ? name.match(/(?<=\()(.+?)(?=\))/g)[0] : name
    }
    
    /**
     * @param {object} constraints
     * @returns {Promise<MediaStream>}
     * @public
     */
    static async getMedia(constraints = DefaultConstraints) {
        return await navigator.mediaDevices.getUserMedia(constraints)
    }

    /**
     * @param {DeviceKind} kind
     * @returns {Promise<Device[]>}
     * @public
     */
    static async getInputDevices(kind) {
        return (await navigator.mediaDevices.enumerateDevices())
            .filter(device => device.kind === kind)
            .filter(({ deviceId }) => !SystemDeviceIds.includes(deviceId))
    }

    /**
     * @returns {void}
     * @private
     */ 
    _init() {
        this._ws.onmessage = this._onMessage.bind(this)
        this._connection.addEventListener('track', this._onTrack.bind(this))
        this._connection.addEventListener('icecandidate', this._onIceCandidate.bind(this))
        this._connection.addEventListener('connectionstatechange', this._onConnectionstatechange.bind(this))
        this._connection.addEventListener('negotiationneeded', this._onNegotiationneeded.bind(this))
    }
    
    /**
     * send data to server.
     * @param {string} type
     * @param {any} payload
     * @returns {void}
     * @private
     */
    _send(type, payload) {
        const to = this._to
        const from = this._options.code
        this._ws.send(JSON.stringify({ from, to, type, payload }))
    }
    
    /**
     * @returns {void}
     * @private
     */ 
    async _onNegotiationneeded() {
        await this._connection.setLocalDescription()
        this._send('offer', {
            sdp: this._connection.localDescription.sdp,
            tracks: this._options.tracks
        })
    }
    
    /**
     * @param {Event} event
     * @returns {void}
     * @private
     */ 
    _onConnectionstatechange(_event) {
        this.emit('stateChange', this._connection.connectionState)
    }
    
    /**
     * @param {MediaSteamTrack} track
     * @returns {void}
     * @private
     */ 
    _onTrack({ track }) {
        this.emit('track', track)
    }
    
    /**
     * @param {RTCIceCandidate} [candidate]
     * @returns {void}
     * @private
     */ 
    _onIceCandidate({ candidate }) {
        this._send('candidate', candidate)
    }
    
    /**
     * handle message.
     * @param {Event} event
     * @returns {void}
     * @private
     */
    _onMessage({ data }) {
        const { from, type, payload } = JSON.parse(data)
        type === 'connect' && this._onConnect(from)
        type === 'candidate' && this._onCandidate(payload)
        type === 'answer' && this._onAnswer(payload)
        type === 'offer' && this._onOffer(payload)
        
    }
    
    /**
     * @param {string} from
     * @returns {void}
     * @public
     */ 
    _onConnect(from) {
        this._to = from
    }
    
    /**
     * @param {RTCIceCandidate} candidate
     * @returns {Promise<void>}
     * @public
     */ 
    _onCandidate(candidate) {
        this._connection.addIceCandidate(candidate)
    }
    
    /**
     * @param {RTCSessionDescriptionInit} answer
     * @returns {Promise<void>}
     * @public
     */ 
    _onAnswer(sdp) {
        this._connection.setRemoteDescription({ type: 'answer', sdp })
    }
    
    /**
     * @param {RTCSessionDescriptionInit} answer
     * @returns {Promise<RTCSessionDescriptionInit>}
     * @public
     */ 
    async _onOffer({ sdp, tracks }) {
        this._connection.setRemoteDescription({ type: 'offer', sdp })
        await this._connection.setLocalDescription()
        this._send('answer', this._connection.localDescription.sdp)
        this.emit('tracks', tracks)
    }
    
    /**
     * @returns {Promise<RTCSessionDescriptionInit>}
     * @public
     */ 
    async createOffer() {
        this._send('connect')
        await this._connection.createOffer()
    }
    
    /**
     * @param {MediaStream} stream
     * @returns {void}
     * @public
     */
    addStream(stream) {
        for (const track of stream.getTracks())
            this._connection.addTrack(track, stream)
    }
    
    /**
     * @param {string} to
     * @returns {void}
     * @public
     */
    setTo(to) {
        this._to = to
    }
    
    /**
     * @returns {Promise<RTCStateReport>}
     * @public
     */
    getStats() {
        return this._connection.getStats()
    }
}
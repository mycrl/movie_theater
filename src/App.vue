<template>
    <div class="Main">
        <Devices
            :devices="selectDevices.devices"
            @device="selectDevice"
        />
        
        <!--
        连接报告
        -->
        <div 
            class="Report box"
            v-show="connecting"
            :style="{
                backgroundColor: connecting && mousemove.sleep ? 'rgba(0, 0, 0, 0)' : null,
                border: connecting && mousemove.sleep ? 'rgba(0, 0, 0, 0)' : '1px solid #ddd',
                color: connecting && mousemove.sleep ? '#999' : null,
            }"
        >
            
            <!--
            指示灯
            -->
            <div class="indicator_light">
                <div 
                    class="light"
                    :style="{ backgroundColor: ({
                        'checking': '#0c9cf8',
                        'connected': '#00b150',
                        'disconnected': '#f00222',
                        'closed': '#999',
                        'failed': '#f00222'
                    })[connectionState] }"
                ></div>
                <span>{{ ({
                        'checking': '连接中...',
                        'connected': '连接完成',
                        'disconnected': '连接断开',
                        'closed': '连接关闭',
                        'failed': '连接失败'
                    })[connectionState] }}
                </span>
            </div>
            
            <!--
            信息列表
            -->
            <div 
                class="info"
                v-show=" report.state === 'succeeded' "
            >
                <p>发送: {{ report.packetsSent }} byte/s</p>
                <p>接收: {{ report.packetsReceived }} byte/s</p>
                <p>延迟: {{ report.totalRoundTripTime }} ms</p>
            </div>
        </div>
        
        <!--
        连接窗口
        用户连接对端
        -->
        <div 
            class="Connection box"
            v-show="!connecting"
        >
            <input 
                type="text" 
                placeholder="对方号码"
                v-model="peer"
            />
            <div>
                <div>
                    <span>你的号码:</span>
                    <p>{{ code }}</p>
                </div>
                <button @click="connection">
                    连接
                </button>
            </div>
        </div>
        
        <!--
        输入管理
        -->
        <div 
            class="Input box"
            v-show="!connecting || !mousemove.sleep"
        >
            <div class="option">
                
                <!--
                音频输入设备列表
                -->
                <p class="title">音频</p>
                
                <!--
                添加音频输入设备
                -->
                <div 
                    class="add hover"
                    @click="addAudioInputDevice"
                >
                    <img src="@/assets/addto.svg"/>
                </div>
                <p 
                    class="none" 
                    v-show="inputs.audios.length == 0"
                >没有音频输入设备...</p>
                <AudioDevice 
                    class="audio" 
                    v-for="audio of inputs.audios"
                    :key="audio.deviceId"
                    :device="audio"
                    :canplay="false"
                />
            </div>
            <div class="option">
                
                <!--
                视频输入设备
                -->
                <p 
                   class="title" 
                   style="margin-top: 10px;"
                >视频</p>
                <VideoDevice 
                    class="video hover"
                    :adder="true"
                    :stream="inputs.video"
                    @add="addVideoInputDevice"
                />
            </div>
        </div>
        
        <!--
        输出管理
        -->
        <div 
            class="Output box"
            v-show=" outputs.audios.length > 0 && !mousemove.sleep "
        >
            
            <!--
            音频输入设备列表
            -->
            <AudioDevice 
                class="audio" 
                v-for="audio of outputs.audios"
                :key="audio.deviceId"
                :device="audio"
            />
        </div>
        
        <!--
        播放器
        -->
        <div 
            class="Player"
            v-show=" connectionState === 'connected' "
        >
            <video 
                autoplay 
                :srcObject="outputs.video"
            />
        </div>
    </div>
</template>

<script>
    import Devices from '@/components/Devices'
    import AudioDevice from '@/components/AudioDevice'
    import VideoDevice from '@/components/VideoDevice'
    import { Streamer, DeviceKind } from '@/streamer'
    
    export default {
        components: {
            AudioDevice,
            VideoDevice,
            Devices
        },
        data() {
            let code = this.getCode()
            let tracks = {}
            
            return {
                code,
                tracks,
                report: {},
                peer: null,
                connecting: false,
                connectionState: 'new',
                streamer: new Streamer({
                    signaling: `wss://psyai.net/signaling/${code}?dev`,
                    tracks,
                    code
                }),
                selectDevices: {
                    devices: [],
                    kind: null,
                },
                inputs: {
                    audios: [],
                    video: null
                },
                outputs: {
                    audios: [],
                    video: null
                },
                mousemove: {
                    rc: 0,
                    sleep: false,
                }
            }
        },
        methods: {
            
            /**
             * 连接音频输入设备
             * 
             * @returns {Promise<void>}
             * @private
             */
            async addVideoInputDevice() {
                this.selectDevices.kind = DeviceKind.Video
                this.selectDevices.devices = (await Streamer.getInputDevices(this.selectDevices.kind))
                    .map(device => Object.assign(device, {
                        name: Streamer.getDeviceName(device.label)
                    }))
            },
            
            /**
             * 连接视频输入设备
             * 
             * @returns {Promise<void>}
             * @private
             */
            async addAudioInputDevice() {
                this.selectDevices.kind = DeviceKind.Audio
                this.selectDevices.devices = (await Streamer.getInputDevices(this.selectDevices.kind))
                    .map(device => Object.assign(device, {
                        name: Streamer.getDeviceName(device.label)
                    }))
            },
            
            /**
             * 选择设备
             * 弹窗选择设备
             * 如果是视频则渲染到主播放器
             * 
             * @param {Device} device
             * @returns {Promise<void>}
             * @private
             */
            async selectDevice(device) {
                if (!this.selectDevices.kind) {
                    return
                }
                
                if (this.selectDevices.kind === DeviceKind.Audio) {
                    const stream = await Streamer.getMedia({audio: device, video: false})
                    this.inputs.audios.push(Object.assign(device, { stream }))
                    this.streamer.addStream(stream)
                    this.tracks[device.id] = device.name
                }
                
                if (this.selectDevices.kind === DeviceKind.Video) {
                    this.inputs.video = await Streamer.getMedia({audio: false, video: device})
                    this.outputs.video = this.inputs.video
                    this.streamer.addStream(this.outputs.video)
                }
                
                this.selectDevices.devices = []
                this.selectDevices.kind = null
            },
            
            /**
             * 获取Code
             * 随机6位数字
             * 
             * @returns {string}
             * @private
             */
            getCode() {
                return new Array(6)
                    .fill(0)
                    .map(() => Math.floor(Math.random() * 10))
                    .join('')
            },
            
            /**
             * 建立rtc连接
             * 
             * @returns {Promise<void>}
             * @private
             */
            async connection() {
                this.streamer.setTo(this.peer)
                await this.streamer.createOffer()
            },
            
            /**
             * 处理对端音视频轨道
             * 
             * @param {MediaStreamTrack} track
             * @returns {void}
             * @private
             */
            onTrack(track) {
                const stream = new MediaStream()
                stream.addTrack(track, stream)
                
                if (track.kind === 'audio') {
                    this.outputs.audios.push({
                        name: this.tracks[track.id],
                        stream 
                    })
                }
                    
                if (track.kind === 'video')
                    this.outputs.video = stream
            },
            
            /**
             * 主循环
             * 
             * @returns {Promise<void>}
             * @private
             */
            async pool() {
                for (const [_, report] of await this.streamer.getStats()) {
                    if (report.type === 'candidate-pair' && report.nominated) {
                        this.report = report 
                    }
                }
                
                if (!this.mousemove.sleep) {
                    if (this.mousemove.rc < 5) {
                        this.mousemove.rc += 1
                    } else {
                        this.mousemove.sleep = true
                    }   
                }
            },

            /**
             * 处理轨道列表信息
             * 
             * @returns {void}
             * @private
             */
            onTracks(tracks) {
                Object.assign(this.tracks, tracks)
            },
            
            /**
             * 处理连接状态变更信息
             * 
             * @returns {void}
             * @private
             */
            onStateChange(state) {
                this.connectionState = state === 'failed' ? 'new' : state
                this.connecting = state != 'new'
            },
            
            /**
             * 处理鼠标移动
             * 
             * @returns {void}
             * @private
             */
            onMousemove() {
                this.mousemove.sleep = false
                this.mousemove.rc = 0
            }
        },
        mounted() {
            document.addEventListener('mousemove', this.onMousemove.bind(this), false)
            this.streamer.on('track', this.onTrack.bind(this))
            this.streamer.on('tracks', this.onTracks.bind(this))
            this.streamer.on('stateChange', this.onStateChange.bind(this))
            setInterval(this.pool.bind(this), 1000)
        }
    }
</script>

<style scoped>
    .Main {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }
    
    .Connection {
        position: absolute;
        top: 20px;
        left: 20px;
        width: 200px;
        z-index: 3;
    }
    
    .Connection input {
        width: 100%;
        line-height: 40px;
        border: 1px solid #eee;
        font-size: 13px;
        border-radius: 5px;
        text-indent: 15px;
    }
    
    .Connection > div {
        margin-top: 10px;
        display: flex;
    }
    
    .Connection > div > * {
        flex: 1;
    }
    
    .Connection div button {
        line-height: 35px;
        background-color: #fff;
        border: 1px solid #6D84DC;
        color: #6D84DC;
        border-radius: 5px;
    }
    
    .Connection div span {
        font-size: 0.8rem;
        color: #999;
    } 
    
    .Connection div p {
        font-weight: bold;
        color: #555;
        margin-top: 5px;
    }
    
    .Input {
        position: absolute;
        width: 200px;
        bottom: 20px;
        left: 20px;
        z-index: 2;
    }
    
    .Input .option .title {
        margin-bottom: 10px;
    }
    
    .Input .option .add {
        position: absolute;
        top: 13px;
        right: 15px;
    }
    
    .Input .option .add img {
        width: 25px;
    }
    
    .Input .option .audio {
        padding: 10px 0;
    }
    
    .Input .option .none {
        line-height: 40px;
        color: #999;
    }
    
    .Input .option .video {
        margin-top: 10px;
    }
    
    .Output {
        position: absolute;
        width: 200px;
        bottom: 20px;
        right: 20px;
        z-index: 2;
    }
    
    .Player {
        z-index: 1;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
    }
    
    .Player video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    
    .Report {
        position: absolute;
        top: 20px;
        left: 20px;
        width: 200px;
        z-index: 3;
    }
    
    .Report .indicator_light {
        margin-bottom: 10px;
    }
    
    .Report .indicator_light .light {
        width: 15px;
        height: 15px;
        border-radius: 50%;
        float: left;
    }
    
    .Report .indicator_light span {
        margin-left: 10px;
    }
</style>

<style>
    * {
        margin: 0;
        padding: 0;
        font-size: 12px;
        font-family: FMBook, FMMedium, Microsoft YaHei, sans-serif;
    }
    
    body {
        background-color: #efefef;
    }
    
    a {
        text-decoration: none;
        vertical-align: baseline;
    }
    
    input, select {
        outline: none;
    }
    
    button, .hover {
        cursor: pointer;
        outline: none;
    }
    
    .v-shadow {
        box-shadow: 0px 1px 2px 0px rgba(60, 64, 67, 0.3), 
            0px 2px 6px 2px rgba(60, 64, 67, 0.15);
        background-color: #fff;
    }
    
    .scroll::-webkit-scrollbar { width: 0 !important; }
    .scroll { overflow: -moz-scrollbars-none; }
    .scroll { -ms-overflow-style: none; }
    .uncopy {
        user-select: none;
    }
    
    .disable {
        filter: grayscale(100%);
    }
    
    .box {
        background-color: #fff;
        border-radius: 7px;
        border: 1px solid #ddd;
        padding: 15px;
    }
</style>

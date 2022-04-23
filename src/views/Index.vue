<template>
    <div class="Index">
        <div class="line"></div>
        
        <!--
        连接窗口
        -->
        <div 
            class="Connect"
            :style="{
                top: connect_wrap ? '0' : '-80px'        
            }"
        >
            
            <!--
            打开连接窗口
            -->
            <div class="connect-icon hover">
                <img 
                    v-show="!connect_wrap" 
                    src="@/assets/cast-connected.svg"
                    @click="wrap_connect"
                />
                <img
                    v-show="connect_wrap"
                    style="transform: rotate(-90deg);"
                    src="@/assets/top-right.svg"
                    @click="unwrap_connect"
                />
            </div>
            
            <!--
           连接配置
            -->
            <div class="config">
                <svg class="background">
                    <polygon 
                        :points="`0,0 ${width},0 ${width / 2 + 56},80 ${width / 2 - 56},80`"
                        fill="#fff"
                    />
                </svg>
                <div class="body">
                    <div class="option">
                        <div class="self-code">
                            <span>{{ store.self_code }}</span>
                        </div>
                    </div>
                    <div class="option">
                        <div class="peer-code">
                            <input
                                type="text"
                                placeholder="0" 
                                v-for="(_, i) of [0, 1, 2]"
                                :id=" 'peer_code_' + i "
                                @input="peer_code_input(i)"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!--
        添加输入窗口
        -->
        <!--
            :style="{
                width: add_stream_wrap ? '110px' : '20px',
                backgroundColor: add_stream_wrap ? '#fff' : '#4755ff',
                borderRadius: `0 ${connect_wrap ? '75px' : '20px'} 0 0`
            }"
-->
        
        <div class="AddStream">
            <div class="add-icon hover">
                <img
                    v-show="!add_stream_wrap"
                    src="@/assets/live-fill.svg"
                    @click="wrap_add_stream"
                />
            </div>
            <div 
                class="add"
                v-show="add_stream_wrap"
            >
                <div class="option">
                    <img src="@/assets/video.svg"/>
                </div>
                <div class="option">
                    <img src="@/assets/audio.svg"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { defineComponent } from 'vue'
    
    export default defineComponent({
        inject: [
            'store' 
        ],
        data() {
            return {
                width: 0,
                connect_wrap: true,
                add_stream_wrap: false,
            }
        },
        methods: {
            wrap_connect() {
                this.connect_wrap = true
            },
            unwrap_connect() {
                this.connect_wrap = false
            },
            peer_code_input(i) {
                const current = document.getElementById(`peer_code_${i}`)
                const next = document.getElementById(`peer_code_${i + 1}`)
                
                this.store.peer_code[i] = current.value
                if (i < 2) {
                    next.value = null
                    next.focus()
                }
            },
            wrap_add_stream() {
                this.add_stream_wrap = true
            }
        },
        mounted() {
            this.width = document.documentElement.clientWidth
        }
    })
</script>

<style scoped>
    .line {
        height: 100vh;
        width: 2px;
        background-color: #000;
        margin: 0 auto;
    }
    
    .Index {
        background-color: #ddd;
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }
    
    .Connect {
        position: absolute;
        left: 0;
        transition: 0.5s;
        width: 100%;
    }
    
    .Connect .connect-icon {
        margin: 0 auto;
        width: 80px;
        height: 80px;
        text-align: center;
        background-color: #4755ff;
        border-radius: 0 0 20px 0;
        transform: rotate(45deg);
        position: relative;
        top: 40px;
        right: 0px;
    }
    
    .Connect .connect-icon img {
        width: 20px;
        height: 20px;
        transform: rotate(-45deg);
        position: relative;
        top: 45px;
        right: -15px;
    }
    
    .Connect .config {
        position: absolute;
        top: 0;
        height: 100%;
        width: 100%;
        left: 0;
    }
    
    .Connect .config .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }
    
    .Connect .config .body {
        display: flex;
        z-index: 2;
    }
    
    .Connect .config .body .option {
        width: 50%;
        flex: 1;
        z-index: 2;
    }
    
    .Connect .config .body .option:first-of-type div {
        float: right;
    }
    
    .Connect .config .body .option .self-code span {
        font-weight: bold;
        font-size: 30px;
        color: #fff;
        margin-right: 40px;
        line-height: 50px;
    }
    
    .AddStream {
        position: absolute;
        bottom: -80px;
        left: 0;
        transition: 0.5s;
        width: 100%;
    }
    
    .AddStream .add-icon {
        margin: 0 auto;
        width: 80px;
        height: 80px;
        text-align: center;
        background-color: #4755ff;
        border-radius: 20px 0 0 0;
        transform: rotate(45deg);
        position: relative;
        top: -40px;
        right: 0px;
    }
    
    .AddStream .add-icon img {
        width: 20px;
        height: 20px;
        transform: rotate(-45deg);
        position: relative;
        top: 13px;
        right: 13px;
    }
    
    .AddStream .add {
        display: table;
        width: 100px;
    }
    
    .AddStream .add .option {
        width: 40px;
        height: 40px;
        background-color: #4755ff;
        border-radius: 40px;
        float: left;
        text-align: center;
    }
    
    .AddStream .add .option:last-of-type {
        margin-left: 10px;
    }
    
    .AddStream .add .option img {
        width: 20px;
    }
</style>
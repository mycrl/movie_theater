<template>
    
    
    <!--
    视频设备
    -->
    <div 
        class="VideoDevice"
        v-show="adder || !!stream"
    >
        
        <!--
        添加视频设备
        -->
        <div 
            class="add"
            v-show="adder && !stream"
            @click="$emit('add')"
        >
            <img src="@/assets/video.svg"/>
        </div>
        
        <!--
        播放器
        预览视频画面
        -->
        <video 
            autoplay 
            v-show="!!stream"
            :srcObject="stream"
        />
    </div>
</template>

<script>
    export default {
        name: 'VideoDevice',
        props: {
            stream: Object,
            adder: {
                type: Boolean,
                default: false
            }
        }
    }
</script>

<style scoped>
    .VideoDevice {
        width: 100%;
        height: 200px;
        position: relative;
    }
    
    .VideoDevice .add {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        border-radius: 10px;
        text-align: center;
        background-color: #eee;
    }
    
    .VideoDevice .add img {
        width: 30px;
        margin-top: 80px;
    }
    
    .VideoDevice video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
        border-radius: 10px;
    }
</style>
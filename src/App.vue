<template>
    <router-view/>
</template>

<style>
    * {
        margin: 0;
        padding: 0;
        font-size: 12px;
        font-family: FMBook, FMMedium, Microsoft YaHei, sans-serif;
    }
    
    body {
        background-color: #f8f9fa;
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
</style>

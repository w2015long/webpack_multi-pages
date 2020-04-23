<template>
    <div id="app">
        <h1>开不开心</h1>
        <div class="img-wrapper">
            <img :src="src" alt="">
        </div>
        <img src="../../assets/images/wx@2x.png" alt="">
    </div>
</template>

<script>
    const imgUrl  = require('../../assets/images/wx@2x.png')
    export default {
        name: 'app',
        components: {

        },
        data() {
            return {
                src:imgUrl
            }

        },
        mounted() {
            
        },
        methods: {

        }

    }
</script>

<style scoped lang="less">
    @import "demo.less";
</style>

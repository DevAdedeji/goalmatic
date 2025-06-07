<template>

    <div class="lg:hidden small-screen">

        <ConsultingHeader></ConsultingHeader>

        <div class="flex flex-col items-center md:gap-4 gap-4 z-30  mt-[80px] relative">


            <h1 ref="headline"
                class="text-headline font-bold text-[49px] md:text-[62px] lg:max-w-[800px] text-center leading-[40px] md:leading-[80px] md:px-4">
                <div class="lg:whitespace-nowrap">AI Agents & Workflows Built</div>
                <div class="">for Business Growth</div>
            </h1>

            <p ref="paragraph"
                class="text-sm md:text-[19px] font-medium  text-dark text-center  md:max-w-[760px] leading-[30px] md:px-4">
                Empower your teams—sales, marketing, customer service, IT—with intelligent automation that works
                24/7.
                We provide both the software and the strategic guidance.
            </p>

            <div class="flex gap-4 mt-2 flex-wrap justify-center">
                <div class="button-margin-div mt-6 rounded-[10px]">
                    <nuxt-link to="/auth/login" class="btn-primary ">
                        Get Started for Free →
                    </nuxt-link>
                </div>
                <nuxt-link to="/use-cases" class="btn2 bg-light mt-6">
                    Find your use case
                </nuxt-link>

            </div>

          
            <img src="../../../public/Sample (1).png" alt="hero-bg" class=" mt-24 ">
        </div>
    </div>

    <div class="">


        <main class=" hidden lg:flex md:px-9 px-4 relative overflow-hidden flex flex-col items-center main-section">

            <ConsultingHeader></ConsultingHeader>
        


            <div class="flex flex-col items-center md:gap-4 gap-4 z-30  mt-[140px] relative">


                <h1 ref="headline"
                    class="text-headline font-bold text-[49px] md:text-[72px] lg:max-w-[800px] text-center leading-[40px] md:leading-[80px] md:px-4">
                    <div class="lg:whitespace-nowrap">AI Agents & Workflows Built</div>
                    <div class="hidden lg:block">for Business Growth</div>
                </h1>

                <p ref="paragraph"
                    class="text-sm md:text-[19px] font-medium  text-dark text-center  md:max-w-[760px] leading-[30px] md:px-4">
                    Empower your teams—sales, marketing, customer service, IT—with intelligent automation that works
                    24/7.
                    We provide both the software and the strategic guidance.
                </p>

                <div class="flex gap-4 mt-2 flex-wrap justify-center">
                    <div class="button-margin-div mt-6 rounded-[10px]">
                        <nuxt-link to="/auth/login" class="btn-primary ">
                            Get Started for Free →
                        </nuxt-link>
                    </div>
                    <nuxt-link to="/use-cases" class="btn2 bg-light mt-6">
                        Find your use case
                    </nuxt-link>




                </div>

                <!-- <img src="/hero.svg" alt="hero-bg" class="heroBox mt-24 "> -->
                <img src="../../../public/Sample.png" alt="hero-bg" class=" mt-24 ">
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { watchUserStateChange } from '@/firebase/auth'
import { useUser } from '@/composables/auth/user'
import ConsultingHeader from '../consultingpages.vue/ConsultingHeader.vue';

const isOpen = ref(false)

const { isLoggedIn } = useUser()
gsap.registerPlugin(SplitText)

definePageMeta({
    layout: false
})

const headline = ref<HTMLHeadingElement | null>(null)
const paragraph = ref<HTMLParagraphElement | null>(null)
const ctaButton = ref<HTMLElement | null>(null)

onMounted(() => {
    watchUserStateChange()
})

</script>

<style>
.main-section {

    background-image: url('/Background.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    /* margin: 0;
    padding: 0; */
    height: 200vh;
    width: 100%;
}

.textHero {
    background: linear-gradient(180deg, #000 54.17%, #6403F8 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* 
.small-screen {
    background-image: url('/Background (1).png');
    background-size: contain;
   
    background-repeat: no-repeat;
    background-position: top left;

    height: 200vh;
    width: 100%;

   
} */
.small-screen {
    background-image: url('/Background%20(1).png');
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-position: top left;
    height: 200vh;
    width: 100vw;
    overflow: hidden;
}



/* .heroBox {
    @apply md:rounded-t-[26px] border hidden md:block absolute -bottom-[180px] inset-x-0 md:relative md:inset-x-auto md:bottom-auto border-white/10 shadow-[0px_-20px_70px_0px_rgba(140, 69, 255, 0.25), _0px_-19px_70px_0px_rgba(140, 69, 255, 0.40)];
    /* border-radius: 26px; */
/* border: 1px solid rgba(255, 255, 255, 0.10); */
/* box-shadow: 0px -20px 70px 0px rgba(140, 69, 255, 0.25), 0px -19px 70px 0px rgba(140, 69, 255, 0.40); */
/* } */

.heroBox {
    @apply md:rounded-t-[26px] border hidden md:block absolute -bottom-[180px] inset-x-0 md:relative md:inset-x-auto md:bottom-auto border-white/10;

    box-shadow: 0px -20px 70px 0px rgba(140, 69, 255, 0.25), 0px -19px 70px 0px rgba(140, 69, 255, 0.40);
}
</style>

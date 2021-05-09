
var tl = gsap.timeline();

tl.from('.nav-items',{
    stagger:.3,
    duration:2,
    y:20,
    ease:'Expo.easeInOut',
    opacity:0
})
.from('.smline',{
width:0,
duration:1,
ease:'Expo.easeInOut'
},'-=2')
.from('.left-item',{
    stagger:.3,
    duration:2,
    y:20,
    ease:'Expo.easeInOut',
    opacity:0,
},'-=2')
.from('.right-item',{
    stagger:.4,
    duration:2,
    x:50,
    ease:'Expo.easeInOut',
    opacity:0,
},'-=2')

const tl2 = gsap.timeline({
    scrollTrigger:{
        trigger:"#Features",
        start:"top center",
        toggleActions:"play pause resume reverse"
    }
});
tl2.from('#feature-h1',{
    duration:2,
    opacity:0,
    ease:'Expo.easeInOut',
})
.from('.img1',{
    scale:1.05,
    duration:2,
    ease:'Expo.easeInOut',
    opacity:0,

},'-=2')
.from(".list-item",{
    stagger:.5,
    x:100,
    opacity:0,
    delay:1,
    duration:2,
    ease:'Expo.easeInOut',


},'-=2')
const tl3 = gsap.timeline({
    scrollTrigger:{
        trigger:"#Impress",
        start:"top center",
        toggleActions:"play pause resume reverse"
    }
});
tl3.from("#reveal",{
    scale:0.5,
    duration:2,
    ease:'Expo.easeInOut',
    opacity:0,
})
.from("#mid",{
    x:500,
    duration:2,
    delay:0.3,
    ease:'Expo.easeInOut',
    opacity:0,
},"-=2")
.from("#story",{
    scale:0.5,
    duration:2,
    delay:0.5,
    ease:'Expo.easeInOut',
    opacity:0,
},"-=2")

const tl4 = gsap.timeline({
    scrollTrigger:{
        trigger:"#Contact",
        start:"top center",
        toggleActions:"play pause resume reverse"
    }
})
tl4.from(".content h1",{
    duration:1,
    ease:'Expo.easeInOut',
    opacity:0,
})
.from(".waysToContact",{
    stagger:.3,
    duration:1,
    ease:'Expo.easeInOut',
    opacity:0,
})
.from("#circle",{
    scale:0,
    duration:1,
    ease:'Expo.easeInOut',
    opacity:0,
},'-=1')
.from(".contact-form-text",{
    stagger:.3,
    x:100,
    opacity:0,
    delay:1,
    duration:1,
    ease:'Expo.easeIn',
},'-=2')
.from(".contact-form button",{
   y:-100,
    opacity:0,
    delay:1,
    duration:1,
    ease:'Expo.easeInOut',
},'-=2')

var ts = gsap.timeline();
ts.from('.ts',{
    delay:1,
    stagger:.3,
    duration:2,
    y:20,
    ease:'Expo.easeInOut',
    opacity:0,
})
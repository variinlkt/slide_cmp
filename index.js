import Slide from './slide';
new Slide({
    container: 'slide_container1',
    list: 'slide_list',
    item: 'slide_item',
    footer: 'slide_footer_item',
    auto: false,
    touch: true,
    time: 2000,
    infinite: true
});
new Slide({
    container: 'slide_container2',
    list: 'slide_list',
    item: 'slide_item',
    footer: 'slide_footer_item',
    auto: false,
    touch: true,
    time: 2000,
    infinite: false
});
new Slide({
    container: 'slide_container3',
    list: 'slide_list',
    item: 'slide_item',
    footer: 'slide_footer_item',
    auto: true,
    touch: true,
    time: 2000,
    infinite: true
});
new Slide({
    container: 'slide_container4',
    list: 'slide_list',
    item: 'slide_item',
    footer: 'slide_footer_item',
    auto: true,
    touch: false,
    time: 2000,
    direction: 'v'
});
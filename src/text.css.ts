import {
    fontFace
} from '@vanilla-extract/css';

export const neueMontreal = fontFace([
    {
        src: 'url("fonts/PPNeueMontreal-Thin.otf") format("opentype")',
        fontWeight: '100'
    },
    {
        src: 'url("fonts/PPNeueMontreal-Book.otf") format("opentype")',
        fontWeight: '400'
    },
    {
        src: 'url("fonts/PPNeueMontreal-Medium.otf") format("opentype")',
        fontWeight: '500'
    },
    {
        src: 'url("fonts/PPNeueMontreal-SemiBold.otf") format("opentype")',
        fontWeight: '600'
    },
    {
        src: 'url("fonts/PPNeueMontreal-Bold.otf") format("opentype")',
        fontWeight: '700'
    },
    {
        src: 'url("fonts/PPNeueMontreal-Italic.otf") format("opentype")',
        fontStyle: 'italic'
    },
]);

export const glook = fontFace({
    src: 'url("fonts/GlookRegular.ttf") format("truetype")',
})

export const lilitaOne = fontFace({
    src: 'url("fonts/LilitaOne-Regular.ttf") format("truetype")',
})
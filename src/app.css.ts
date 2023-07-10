import { globalStyle } from '@vanilla-extract/css';
import theme from "./theme.css";

globalStyle('html, body', {
    fontFamily: theme.font.body,
    background: theme.colours.background,
    fontWeight: 400,
});

globalStyle('html, body, h1, h2, h3, h4, h5, h6, ul, p', {
    margin: 0,
});

globalStyle('ul', {
    listStyle: 'none'
})
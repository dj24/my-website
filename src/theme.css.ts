import {createGlobalTheme} from '@vanilla-extract/css';
import { neueMontreal} from "./text.css";

export default createGlobalTheme(':root', {
    font: {
        body: neueMontreal,
    },
    spacing: {
        1: '0.5rem',
        2: '1rem',
        3: '1.5rem',
        4: '2rem',
        6: '3rem',
        8: '4rem',
    },
    colours : {
        background: '#FAEDCD',
        accent: '#c58544',
    }
});
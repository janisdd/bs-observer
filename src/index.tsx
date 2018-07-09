import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./components/App";
import axios from 'axios'

import {configure} from "mobx"
import {appState} from "./state/appState";


//from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength: number,padString: string) {
    targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
    padString = String((typeof padString !== 'undefined' ? padString : ' '));
    if (this.length > targetLength) {
      return String(this);
    }
    else {
      targetLength = targetLength-this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
      }
      return padString.slice(0,targetLength) + String(this);
    }
  };
}

configure({enforceActions: true})

const allStyles = require('./styles/allStyles.styl')
import 'react-notifications/lib/notifications.css';

ReactDOM.render(
  <App appState={appState} />
  ,
  document.getElementById("root")
)
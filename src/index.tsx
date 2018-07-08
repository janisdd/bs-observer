import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./components/App";
import axios from 'axios'

import {configure} from "mobx"
import {appState} from "./state/appState";


configure({enforceActions: true})

const allStyles = require('./styles/allStyles.styl')
import 'react-notifications/lib/notifications.css';

ReactDOM.render(
  <App appState={appState} />
  ,
  document.getElementById("root")
)
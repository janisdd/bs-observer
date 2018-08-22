import * as React from "react";
import {observer} from "mobx-react";

export interface MyProps {
  //readonly test: string
}


const Loader: React.SFC<MyProps> = (props) => {
  return (
    <div className="ui dimmer inverted active">
      <div className="ui semantic-loader ">
        <div>Lade...</div>
      </div>
    </div>
  )
}

export default Loader
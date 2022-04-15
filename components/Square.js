import * as React from "react";

export default function Square(props) {
  let sizeInRow = 100 /props.boardSize;

if(props.value[1] ==0 && props.value[0] !=0){
  return (
<button className="flex-item place-center" style={{flex: `1 0 ${sizeInRow}%`
}}>{props.value[0]}
</button>
  )
}else if(props.value[1] !=0 && props.value[0] ==0){
  return (
    <button className="flex-item place-center" style={{flex: `1 0 ${sizeInRow}%`
    }}>{(props.value[1] + 9).toString(36).toUpperCase()}
    </button>
      )

}else{
  return (
    <button className="flex-item" style={{flex: `1 0 ${sizeInRow}%`
    }} onClick={props.onClick}>
    </button>
  );
}  
}
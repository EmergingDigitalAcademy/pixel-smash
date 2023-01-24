export default function Pixel({socket, pixel, gameState, scale=360, offset=100}) {

   const mouseHandler = (event) => {
      if (event.buttons > 0) {
         socket.emit('set-pixel', [
            {x: pixel.x, y: pixel.y, state: {color: pixel.state.color+2 % gameState.colors}},
            {x: pixel.x+1, y: pixel.y, state: {color: pixel.state.color+1 % gameState.colors}},
            {x: pixel.x-1, y: pixel.y, state: {color: pixel.state.color+1 % gameState.colors}},
            {x: pixel.x, y: pixel.y+1, state: {color: pixel.state.color+1 % gameState.colors}},
            {x: pixel.x, y: pixel.y-1, state: {color: pixel.state.color+1 % gameState.colors}},
         ]);
         // socket.emit('set-phaser', {
         //    x: pixel.x,
         //    y: pixel.y,
         //    payload:[{x: 1, y: 0, color: 1}, {x: 1, y: 0, color: 1}, {x: 1, y: 0, color: 1}, {x: 1, y: 0, color: 1}]
         // })
      }
   }
   return (
      <div
         draggable={false}
         onMouseMove={mouseHandler}
         // onClick={mouseHandler}
         className={`pixel`}
         style={{
            width: `${100 / gameState.width}%`,
            paddingBottom: `${100 / gameState.width}%`,
            backgroundColor: `hsl(${(pixel.state.color / gameState.colors) * scale + offset}, 100%, 50%)`
         }}
      >
         {/* {pixel.state.color} */}
      </div>
   )
}
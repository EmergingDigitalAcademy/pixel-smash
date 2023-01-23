export default function Pixel({pixel, gameState, scale=360, offset=100}) {
   return (
      <div
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
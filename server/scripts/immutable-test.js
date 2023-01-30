const Immutable = require('immutable');

const Pixels1 = Immutable.List([Immutable.Map({x: 0, y: 0, state: Immutable.Map({ color: 0 })})])
const Pixels2 = Immutable.List([Immutable.Map({x: 0, y: 0, state: Immutable.Map({ color: 0 })})])

console.log(Pixels1.equals(Pixels2));

console.log(Pixels1.get(0).get('state').get('color'));
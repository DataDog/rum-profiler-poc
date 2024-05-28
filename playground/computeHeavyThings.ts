function functionA() {
  return functionB()
}

function functionB() {
  return functionC()
}

function functionC() {
  return functionD()
}

function functionD() {
  let j = 0
  performance.mark('start heavy')
  for (let i = 0; i < 1e9; i++) {
    j += (i % 21) + 5
  }
  performance.mark('end heavy')
  performance.measure('heavy', 'start heavy', 'end heavy')
  return j
}

export { functionA as computeHeavyThings }

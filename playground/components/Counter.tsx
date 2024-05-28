import React, { useState } from 'react'
import { computeHeavyThings } from '../computeHeavyThings'

export function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)
  }

  const heavyCount = React.useMemo(() => {
    return computeHeavyThings()
  }, [count])

  return (
    <button onClick={handleClick}>
      Clicked {count} times (heavy count to {heavyCount})
    </button>
  )
}

import React from 'react'

export function Card({ children, className = '', ...rest }) {
  const cls = `bg-white ${className}`.trim()
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  )
}

export function CardContent({ children, className = '', ...rest }) {
  const cls = `${className}`.trim()
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  )
}

export default Card

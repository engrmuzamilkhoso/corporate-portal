import React, { useState } from 'react'

interface HoverBootstrapIconProps {
  defaultIcon: string // Bootstrap class for default icon
  hoverIcon?: string // Bootstrap class for hover icon
  style?: React.CSSProperties // Optional style prop
  onClick?: () => void
  role?: string // Optional role for accessibility
  disabled?: boolean
}

const HoverBootstrapIcon: React.FC<HoverBootstrapIconProps> = ({
  defaultIcon,
  hoverIcon,
  style,
  onClick,
  role = 'button', // Default role to 'button' for better accessibility
  disabled = false, // Default disabled state to false
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }
  return (
    <i
      className={`bi ${isHovered && hoverIcon ? hoverIcon : defaultIcon}`} // Switch icon on hover if hoverIcon is provided
      onMouseEnter={() => !disabled && setIsHovered(true)} // Only allow hover if not disabled
      onMouseLeave={() => !disabled && setIsHovered(false)} // Reset hover state on mouse leave
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }} // Change cursor and opacity if disabled
      onClick={handleClick} // Only allow click if not disabled
      role={role} // Apply role, default is 'button'
      aria-disabled={disabled} // Add aria-disabled for accessibility
      {...rest} // Spread any additional props
    ></i>
  )
}

export default HoverBootstrapIcon

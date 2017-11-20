import React from 'react'

const Icon = ({ icon, onClick }) => {
  const cls = 'fa fa-' + icon;
  const onClick2 = (e) => {
    if (onClick) onClick(e);
  }
  return <i className={cls} onClick={onClick2} />
}

export default Icon
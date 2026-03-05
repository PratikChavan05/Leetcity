import React from 'react';
import Building from './Building.jsx';

export default function CityGrid({ buildings, onBuildingClick, nightMode, focusedUsername }) {
  if (!buildings || buildings.length === 0) return null;

  return (
    <group>
      {buildings.map((user) => (
        <Building
          key={user._id || user.username}
          userData={user}
          onClick={onBuildingClick}
          nightMode={nightMode}
          focused={
            focusedUsername === null || focusedUsername === undefined
              ? undefined
              : focusedUsername === user.username
                ? true
                : false
          }
        />
      ))}
    </group>
  );
}

import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { DlicomUser, ViewportTransform } from '../../types/circle';
import { FriendNode } from '../FriendNode/FriendNode';
import { ConnectionLine } from '../ConnectionLine/ConnectionLine';

interface FriendMapProps {
  currentUser: DlicomUser;
  friends: DlicomUser[];
  selectedUser: DlicomUser | null;
  onSelectUser: (user: DlicomUser) => void;
  filteredUserIds: Set<string>;
  showOrbits: boolean;
  transform: ViewportTransform;
  onTransformChange: (transform: ViewportTransform) => void;
}

export const FriendMap: React.FC<FriendMapProps> = ({
  currentUser,
  friends,
  selectedUser,
  onSelectUser,
  filteredUserIds,
  showOrbits,
  transform,
  onTransformChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredUser, setHoveredUser] = useState<DlicomUser | null>(null);

  // Background ambient stars (generated once for stable display)
  const [stars] = useState(() => {
    return Array.from({ length: 65 }).map((_, i) => ({
      id: i,
      x: (Math.sin(i * 99) * 0.5 + 0.5) * 2000 - 1000,
      y: (Math.cos(i * 77) * 0.5 + 0.5) * 2000 - 1000,
      size: (i % 3) + 1,
      opacity: 0.2 + (i % 5) * 0.15,
      pulse: i % 4 === 0,
    }));
  });

  // Handle Mouse Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left-click
    setIsDragging(true);
    setDragStart({
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      onTransformChange({
        ...transform,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart, transform, onTransformChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(0.35, transform.scale * zoomFactor), 2.2);

    // Zoom centered on pointer
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      const scaleChange = newScale - transform.scale;
      const newX = transform.x - (mouseX - transform.x) * (scaleChange / transform.scale);
      const newY = transform.y - (mouseY - transform.y) * (scaleChange / transform.scale);

      onTransformChange({
        x: newX,
        y: newY,
        scale: newScale,
      });
    }
  };

  // Touch Support
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - transform.x,
        y: e.touches[0].clientY - transform.y,
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      onTransformChange({
        ...transform,
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchDistance !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const zoomRatio = dist / touchDistance;
      const newScale = Math.min(Math.max(0.35, transform.scale * (zoomRatio > 1 ? 1.03 : 0.97)), 2.2);
      onTransformChange({
        ...transform,
        scale: newScale,
      });
      setTouchDistance(dist);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchDistance(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Orbit Tiers radii
  const orbitTiers = [
    { radius: 210, label: 'Inner Circle' },
    { radius: 345, label: 'Collaborators' },
    { radius: 495, label: 'Extended Network' },
  ];

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-full overflow-hidden cosmic-canvas-bg ambient-grid select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Centered World Viewport */}
      <div
        className="absolute left-1/2 top-1/2 w-0 h-0 will-change-transform"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Background Ambient Stars */}
        <div className="absolute inset-0 pointer-events-none">
          {stars.map((s) => (
            <div
              key={s.id}
              style={{
                transform: `translate(${s.x}px, ${s.y}px)`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity,
              }}
              className={`rounded-full bg-cyan-200 ${
                s.pulse ? 'animate-ping' : ''
              }`}
            />
          ))}
        </div>

        {/* Orbit Guide Rings */}
        {showOrbits && (
          <div className="absolute inset-0 pointer-events-none">
            {orbitTiers.map((tier, idx) => (
              <div
                key={idx}
                style={{
                  width: `${tier.radius * 2}px`,
                  height: `${tier.radius * 2}px`,
                  transform: `translate(-${tier.radius}px, -${tier.radius}px)`,
                }}
                className="absolute rounded-full border border-cyan-500/15"
              >
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest text-cyan-400/40 font-mono">
                  {tier.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* SVG Connection Lines Layer */}
        <svg
          className="absolute -top-[1200px] -left-[1200px] w-[2400px] h-[2400px] pointer-events-none overflow-visible"
          viewBox="-1200 -1200 2400 2400"
        >
          {friends.map((friend) => (
            <ConnectionLine
              key={`line-${friend.id}`}
              user={friend}
              isSelected={selectedUser?.id === friend.id}
              isHovered={hoveredUser?.id === friend.id}
              isDimmed={!filteredUserIds.has(friend.id)}
            />
          ))}
        </svg>

        {/* Surrounding Friend Nodes */}
        {friends.map((friend) => (
          <FriendNode
            key={friend.id}
            user={friend}
            isSelected={selectedUser?.id === friend.id}
            isHovered={hoveredUser?.id === friend.id}
            isDimmed={!filteredUserIds.has(friend.id)}
            onSelect={(user) => onSelectUser(user)}
            onHoverStart={(user) => setHoveredUser(user)}
            onHoverEnd={() => setHoveredUser(null)}
          />
        ))}

        {/* Central "YOU" Dominant Node */}
        <FriendNode
          user={currentUser}
          isSelected={selectedUser?.id === currentUser.id}
          isHovered={hoveredUser?.id === currentUser.id}
          isDimmed={false}
          onSelect={(user) => onSelectUser(user)}
          onHoverStart={(user) => setHoveredUser(user)}
          onHoverEnd={() => setHoveredUser(null)}
        />
      </div>
    </div>
  );
};

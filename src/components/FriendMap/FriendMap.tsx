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

  // Background ambient cosmic stars (generated once for stable display)
  const [stars] = useState(() => {
    return Array.from({ length: 90 }).map((_, i) => ({
      id: i,
      x: (Math.sin(i * 99) * 0.5 + 0.5) * 2400 - 1200,
      y: (Math.cos(i * 77) * 0.5 + 0.5) * 2400 - 1200,
      size: (i % 3) + 1,
      opacity: 0.15 + (i % 5) * 0.12,
      color: i % 3 === 0 ? '#c084fc' : i % 3 === 1 ? '#38bdf8' : '#ffffff',
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

  const transformRef = useRef(transform);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  // Attach native non-passive wheel listener to allow e.preventDefault() without passive warning
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const currentTransform = transformRef.current;
      const newScale = Math.min(Math.max(0.35, currentTransform.scale * zoomFactor), 2.2);

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      const scaleChange = newScale - currentTransform.scale;
      const newX = currentTransform.x - (mouseX - currentTransform.x) * (scaleChange / currentTransform.scale);
      const newY = currentTransform.y - (mouseY - currentTransform.y) * (scaleChange / currentTransform.scale);

      onTransformChange({
        x: newX,
        y: newY,
        scale: newScale,
      });
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheelNative);
    };
  }, [onTransformChange]);

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

  // Subtle organic cosmic orbit radii (ethereal guide bands)
  const orbitTiers = [
    { radius: 220, label: 'Inner Orbit' },
    { radius: 320, label: 'Mid Orbit' },
    { radius: 430, label: 'Outer Orbit' },
  ];

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-full overflow-hidden select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 50%, #110c26 0%, #080614 45%, #05030b 100%)',
      }}
    >
      {/* Centered World Viewport */}
      <div
        className="absolute left-1/2 top-1/2 w-0 h-0 will-change-transform"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Deep Cosmic Nebula Backing centered on YOU */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: '1000px',
            height: '1000px',
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.16) 0%, rgba(56, 189, 248, 0.08) 35%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />

        {/* Ambient Twinkling Stars */}
        <div className="absolute inset-0 pointer-events-none">
          {stars.map((s) => (
            <div
              key={s.id}
              style={{
                transform: `translate(${s.x}px, ${s.y}px)`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity,
                backgroundColor: s.color,
                boxShadow: s.size > 2 ? `0 0 6px ${s.color}` : 'none',
              }}
              className={`rounded-full ${s.pulse ? 'animate-ping' : ''}`}
            />
          ))}
        </div>

        {/* Ethereal Subtle Cosmic Orbit Dust Rings */}
        {showOrbits && (
          <div className="absolute inset-0 pointer-events-none">
            {orbitTiers.map((tier, idx) => (
              <div
                key={idx}
                style={{
                  width: `${tier.radius * 2}px`,
                  height: `${tier.radius * 2}px`,
                  transform: `translate(-${tier.radius}px, -${tier.radius}px)`,
                  borderColor: 'rgba(168, 85, 247, 0.08)',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.03)',
                }}
                className="absolute rounded-full border border-dashed"
              >
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-widest text-purple-400/25 font-mono">
                  {tier.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* SVG Connection Lines Layer (Strictly behind nodes) */}
        <svg
          className="absolute -top-[1600px] -left-[1600px] w-[3200px] h-[3200px] pointer-events-none overflow-visible"
          viewBox="-1600 -1600 3200 3200"
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

        {/* Surrounding Real Connection Nodes */}
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

        {/* Central Dominant "YOU" Hero Node (Rendered last for highest z-index) */}
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

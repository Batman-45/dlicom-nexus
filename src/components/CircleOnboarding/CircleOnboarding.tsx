import React, { useState } from 'react';
import { ArrowRight, Play, Shield } from 'lucide-react';
import { DlicomLogo } from '../DlicomLogo/DlicomLogo';
import './CircleOnboarding.css';

interface CircleOnboardingProps {
  onSubmit: (username: string) => void;
  onLoadDemoPreset?: () => void;
  initialValue?: string;
  isDevMode?: boolean;
}

export const CircleOnboarding: React.FC<CircleOnboardingProps> = ({
  onSubmit,
  onLoadDemoPreset,
  initialValue = '',
  isDevMode = false,
}) => {
  const [handle, setHandle] = useState<string>(initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handle.replace(/^@+/, '').trim();

    if (!cleanHandle) {
      setValidationError('Please enter your X username.');
      return;
    }

    if (!/^[a-zA-Z0-9_]{1,25}$/.test(cleanHandle)) {
      setValidationError('Usernames can only contain letters, numbers, and underscores (1-25 characters).');
      return;
    }

    setValidationError(null);
    onSubmit(cleanHandle);
  };

  const handleQuickSelect = (username: string) => {
    setHandle(username);
    setValidationError(null);
    onSubmit(username);
  };

  return (
    <div className="onboarding-viewport">
      {/* Subtle Atmospheric Background Orbit Rings */}
      <div className="onboarding-bg-orbits">
        <div className="onboarding-ring onboarding-ring-outer" />
        <div className="onboarding-ring onboarding-ring-mid" />
        <div className="onboarding-ring onboarding-ring-inner" />
      </div>

      {/* Main Centered Onboarding Box */}
      <div className="onboarding-container">
        {/* Official Dlicom Logo */}
        <div className="onboarding-icon-box">
          <DlicomLogo size={76} />
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className="onboarding-title">
          Build your Circle
        </h1>
        <p className="onboarding-subtitle">
          Enter your X username and discover your community.
        </p>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="onboarding-input-wrap">
            <span className="onboarding-at-prefix">@</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => {
                setHandle(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="username"
              autoFocus
              autoComplete="off"
              spellCheck="false"
              className="onboarding-input-field"
            />
          </div>

          {/* Inline Validation Error Banner */}
          {validationError && (
            <p className="onboarding-error-text">
              {validationError}
            </p>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            className="onboarding-submit-btn"
          >
            <span>Build My Circle</span>
            <ArrowRight style={{ width: '18px', height: '18px' }} />
          </button>

          {/* Helper Security Text below Button */}
          <p className="onboarding-helper-text">
            <Shield style={{ width: '13px', height: '13px', color: 'rgba(56, 189, 248, 0.7)' }} />
            <span>Read-only social graph analysis. No authentication required.</span>
          </p>
        </form>

        {/* Quick Example Suggestions */}
        <div className="onboarding-examples-block">
          <span className="onboarding-examples-label">
            Try an example handle
          </span>
          <div className="onboarding-chips-row">
            {['rohitdeshmane', 'dan_abramov', 'vitalikbuterin', 'karpathy'].map((suggested) => (
              <button
                key={suggested}
                type="button"
                onClick={() => handleQuickSelect(suggested)}
                className="onboarding-chip-btn"
              >
                @{suggested}
              </button>
            ))}
          </div>
        </div>

        {/* Developer Prototype Demo Preset (Isolated Development Preset) */}
        {isDevMode && onLoadDemoPreset && (
          <div className="onboarding-demo-block">
            <button
              type="button"
              onClick={onLoadDemoPreset}
              className="onboarding-demo-btn"
            >
              <Play style={{ width: '12px', height: '12px' }} />
              <span>Load Prototype Demo (Alex Chen & 28 Nodes)</span>
            </button>
            <span className="onboarding-demo-hint">
              Explicit sample dataset for offline verification
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
